import { supabase } from '@/utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type Piece from '../piece';
import type { IPuzzle } from '../puzzle';

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
  user_id: string;
  piece_ids: number[];
}

export default class NetworkHandler {
  private puzzle: IPuzzle;
  private roomCode: string;
  private userId: string;
  private channel?: RealtimeChannel;
  private isInitialized: boolean;
  private lastSyncTime: number;
  private syncThrottle: number = 1000 / 60; // ~16ms = 60Hz

  constructor(puzzle: IPuzzle, roomCode: string) {
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
              { lerp: false }
            );
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

    const piece = this.puzzle.pieces[pieceData.piece_id];
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
        isSelectedByOther: false, // TODO: Track from selections table
      },
      { lerp: true }, // Smooth interpolation
    );
  }

  private handleSelectionUpdate(payload: any): void {
    const selectionData = payload.new as INetworkSelectionData;
    if (!selectionData || selectionData.user_id === this.userId) return;

    // TODO: Visualize other players' selections
    // For now, just log it
    console.log(`User ${selectionData.user_id} selected pieces:`, selectionData.piece_ids);
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
        await supabase.from('selections').upsert({
          room_code: this.roomCode,
          user_id: this.userId,
          piece_ids: pieceIds,
        });
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
