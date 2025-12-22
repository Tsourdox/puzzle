import { supabase } from '@/utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type Piece from '../piece';
import type { ISerializablePuzzle } from './types';

export interface INetworkPieceData {
  piece_id: number;
  x: number;
  y: number;
  rotation: number;
  connected_sides: number[];
  elevation: number;
  updated_by: string;
}

export interface INetworkSelectionData {
  id?: number;
  user_id: string;
  piece_ids: number[];
}

export default class NetworkHandler {
  private puzzle: ISerializablePuzzle;
  private roomCode: string;
  private userId: string;
  private channel?: RealtimeChannel;
  private isInitialized: boolean;
  private lastSyncTime: number;
  private syncThrottle: number = 1000 / 60; // ~16ms = 60Hz
  private userColors: Map<string, string> = new Map();
  private availableColors = ['#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899'];
  private currentSelections: Map<string, number[]> = new Map(); // userId -> pieceIds
  private selectionIdToUser: Map<number, string> = new Map(); // selection id -> userId

  constructor(puzzle: ISerializablePuzzle, roomCode: string) {
    this.puzzle = puzzle;
    this.roomCode = roomCode;
    this.userId = this.generateUserId();
    this.isInitialized = false;
    this.lastSyncTime = 0;
  }

  private generateUserId(): string {
    // Generate or retrieve user ID (could use localStorage for persistence)
    let userId = localStorage.getItem('puzzelin_user_id');
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('puzzelin_user_id', userId);
    }
    return userId;
  }

  public async initialize(): Promise<boolean> {
    try {
      // Check if room exists and get puzzle data
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', this.roomCode)
        .single();

      if (roomError || !room) {
        // Room doesn't exist yet, will be created when saving puzzle
        return false;
      }

      // Load the puzzle (creates pieces, sets up board)
      await this.puzzle.deserialize(room.puzzle_data);

      // Load all piece positions
      const { data: pieces } = await supabase
        .from('pieces')
        .select('*')
        .eq('room_code', this.roomCode);

      // Apply piece positions
      if (pieces) {
        for (const pieceData of pieces) {
          const piece = this.puzzle.pieces[pieceData.piece_id];
          if (piece) {
            await piece.deserialize(
              {
                id: pieceData.piece_id,
                translation: { x: pieceData.x, y: pieceData.y },
                rotation: pieceData.rotation,
                connectedSides: pieceData.connected_sides || [],
                elevation: pieceData.elevation || 0,
                isSelectedByOther: false,
              },
              { lerp: false },
            );
          }
        }
      }

      // Load current selections
      const { data: selections } = await supabase
        .from('selections')
        .select('*')
        .eq('room_code', this.roomCode);

      // Apply existing selections
      if (selections) {
        for (const selection of selections) {
          const pieceIds = selection.piece_ids || [];

          if (selection.user_id === this.userId) {
            // Restore your own selection
            pieceIds.forEach((pieceId: number) => {
              const piece = this.puzzle.pieces[pieceId] as Piece;
              if (piece) {
                piece.isSelected = true;
              }
            });
          } else {
            // Show other users' selections
            pieceIds.forEach((pieceId: number) => {
              const piece = this.puzzle.pieces[pieceId] as Piece;
              if (piece) {
                piece.setSelectedByOther(true);
              }
            });
            this.currentSelections.set(selection.user_id, pieceIds);
            if (selection.id) {
              this.selectionIdToUser.set(selection.id, selection.user_id);
            }
          }
        }
      }

      // Subscribe to real-time updates
      this.subscribeToUpdates();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize network:', error);
      return false;
    }
  }

  public async createRoom(puzzleData: any): Promise<void> {
    try {
      await supabase.from('rooms').insert({
        room_code: this.roomCode,
        puzzle_data: puzzleData,
      });

      this.subscribeToUpdates();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  private subscribeToUpdates(): void {
    this.channel = supabase
      .channel(`room:${this.roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pieces',
          filter: `room_code=eq.${this.roomCode}`,
        },
        (payload) => {
          this.handlePieceUpdate(payload);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'selections',
          filter: `room_code=eq.${this.roomCode}`,
        },
        (payload) => {
          this.handleSelectionUpdate(payload);
        },
      )
      .subscribe();
  }

  private normalizeRotationDiff(currentRotation: number, targetRotation: number): number {
    // Calculate the shortest rotation path
    let diff = targetRotation - currentRotation;

    // Normalize difference to [-PI, PI] range (shortest path)
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return currentRotation + diff;
  }

  private handlePieceUpdate(payload: any): void {
    const pieceData = payload.new as INetworkPieceData;
    if (!pieceData) return;

    // Ignore our own updates (prevent echo/bounce)
    if (pieceData.updated_by === this.userId) return;

    const piece = this.puzzle.pieces[pieceData.piece_id] as Piece;
    if (!piece) return;

    // Normalize rotation to take shortest path (prevent 350° -> 10° going the long way)
    const currentRotation = piece.rotation;
    const normalizedRotation = this.normalizeRotationDiff(currentRotation, pieceData.rotation);

    // Update piece position from network
    piece.deserialize(
      {
        id: pieceData.piece_id,
        translation: { x: pieceData.x, y: pieceData.y },
        rotation: normalizedRotation,
        connectedSides: pieceData.connected_sides,
        elevation: pieceData.elevation,
        isSelectedByOther: piece.isSelectedByOther, // Preserve selection state
      },
      { lerp: true }, // Smooth interpolation
    );
  }

  private getUserColor(userId: string): string {
    if (!this.userColors.has(userId)) {
      const colorIndex = this.userColors.size % this.availableColors.length;
      this.userColors.set(userId, this.availableColors[colorIndex]);
    }
    return this.userColors.get(userId)!;
  }

  private handleSelectionUpdate(payload: any): void {
    // Handle DELETE events (user deselected)
    if (payload.eventType === 'DELETE' && payload.old) {
      // Supabase only sends the id in DELETE events, so we need to lookup the user
      const selectionId = payload.old.id;
      const oldUserId = this.selectionIdToUser.get(selectionId);

      if (oldUserId && oldUserId !== this.userId) {
        // Clear selections for this user
        const oldSelections = this.currentSelections.get(oldUserId) || [];
        oldSelections.forEach((pieceId) => {
          const piece = this.puzzle.pieces[pieceId] as Piece;
          if (piece) {
            piece.setSelectedByOther(false);
          }
        });
        this.currentSelections.delete(oldUserId);
        this.selectionIdToUser.delete(selectionId);
      }
      return;
    }

    const selectionData = payload.new as INetworkSelectionData;
    if (!selectionData || selectionData.user_id === this.userId) return;

    // Track the selection id -> user mapping for DELETE events
    if (selectionData.id) {
      this.selectionIdToUser.set(selectionData.id, selectionData.user_id);
    }

    const userId = selectionData.user_id;
    const newPieceIds = selectionData.piece_ids || [];

    // If empty array, clear all selections for this user
    if (newPieceIds.length === 0) {
      const oldSelections = this.currentSelections.get(userId) || [];
      oldSelections.forEach((pieceId) => {
        const piece = this.puzzle.pieces[pieceId] as Piece;
        if (piece) {
          piece.setSelectedByOther(false);
        }
      });
      this.currentSelections.delete(userId);
      return;
    }

    // Clear old selections for this user
    const oldSelections = this.currentSelections.get(userId) || [];
    oldSelections.forEach((pieceId) => {
      if (!newPieceIds.includes(pieceId)) {
        const piece = this.puzzle.pieces[pieceId] as Piece;
        if (piece) {
          piece.setSelectedByOther(false);
        }
      }
    });

    // Apply new selections
    newPieceIds.forEach((pieceId) => {
      const piece = this.puzzle.pieces[pieceId] as Piece;
      if (piece) {
        piece.setSelectedByOther(true);
        // TODO: Get user color and pass to piece for custom outline color
        // const color = this.getUserColor(userId);
        // For now, piece will use default "selected by other" color
      }
    });

    this.currentSelections.set(userId, newPieceIds);
  }

  private lastSelectionSync: number[] = [];

  public async syncSelections(selectedPieces: Piece[]): Promise<void> {
    if (!this.isInitialized) return;

    const pieceIds = selectedPieces.map((p) => p.id);

    // Only sync if selection changed
    const changed =
      pieceIds.length !== this.lastSelectionSync.length ||
      !pieceIds.every((id) => this.lastSelectionSync.includes(id));

    if (changed) {
      this.lastSelectionSync = pieceIds;
      await this.syncSelection(pieceIds);
    }
  }

  public async syncPieces(pieces: Piece[]): Promise<void> {
    if (!this.isInitialized) return;

    // Throttle sync
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncThrottle) return;
    this.lastSyncTime = now;

    // Get modified pieces
    const modifiedPieces = pieces.filter((p) => p.isModified);
    if (modifiedPieces.length === 0) return;

    const updates = modifiedPieces.map((piece) => {
      const serialized = piece.serialize();
      return {
        room_code: this.roomCode,
        piece_id: serialized.id,
        x: serialized.translation.x,
        y: serialized.translation.y,
        rotation: serialized.rotation,
        connected_sides: serialized.connectedSides || [],
        elevation: serialized.elevation,
        updated_by: this.userId, // Track who updated this
      };
    });

    try {
      await supabase.from('pieces').upsert(updates, {
        onConflict: 'room_code,piece_id',
      });

      // Mark pieces as synced
      modifiedPieces.forEach((p) => (p.isModified = false));
    } catch (error) {
      console.error('Failed to sync pieces:', error);
    }
  }

  public async syncSelection(pieceIds: number[]): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (pieceIds.length === 0) {
        // Clear selection
        await supabase
          .from('selections')
          .delete()
          .eq('room_code', this.roomCode)
          .eq('user_id', this.userId);
      } else {
        // Update selection
        await supabase.from('selections').upsert(
          {
            room_code: this.roomCode,
            user_id: this.userId,
            piece_ids: pieceIds,
          },
          {
            onConflict: 'room_code,user_id',
          },
        );
      }
    } catch (error) {
      console.error('Failed to sync selection:', error);
    }
  }

  public cleanup(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    // Clear selection on cleanup
    this.syncSelection([]).catch(() => {});
  }
}
