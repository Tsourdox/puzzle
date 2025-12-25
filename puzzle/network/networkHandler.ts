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

// Broadcast message types (batched real-time updates)
export interface IBroadcastPieceUpdate {
  type: 'piece_batch';
  user_id: string;
  image_id: number | string; // To detect when sender has a different puzzle
  pieces: Array<{
    piece_id: number;
    x: number;
    y: number;
    rotation: number;
    connected_sides: number[];
    elevation: number;
  }>;
}

export interface IBroadcastSelectionUpdate {
  type: 'selection';
  user_id: string;
  piece_ids: number[];
}

export default class NetworkHandler {
  private puzzle: ISerializablePuzzle;
  private roomCode: string;
  private userId: string;
  private targetImageId: number | string;
  private channel?: RealtimeChannel;
  private isInitialized: boolean;
  private lastSyncTime: number;
  private userColors: Map<string, string> = new Map();
  private availableColors = ['#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899'];
  private currentSelections: Map<string, number[]> = new Map(); // userId -> pieceIds
  private selectionIdToUser: Map<number, string> = new Map(); // selection id -> userId

  // Receiver-side throttling to batch incoming updates
  private pendingPieceUpdates: Map<number, INetworkPieceData> = new Map(); // pieceId -> latest data
  private updateFlushTimer?: NodeJS.Timeout;
  private readonly UPDATE_FLUSH_INTERVAL = 50; // Apply batched updates every 50ms

  // Callback for when the puzzle image changes (so we can update without reloading)
  private onImageChange?: (imageId: number | string) => void;
  // Flag to prevent processing updates when transitioning to a new puzzle
  private isChangingImage = false;

  constructor(
    puzzle: ISerializablePuzzle,
    roomCode: string,
    targetImageId: number | string,
    onImageChange?: (imageId: number | string) => void,
  ) {
    this.puzzle = puzzle;
    this.roomCode = roomCode;
    this.targetImageId = targetImageId;
    this.userId = this.generateUserId();
    this.isInitialized = false;
    this.lastSyncTime = 0;
    this.onImageChange = onImageChange;
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

      // Check if the loaded puzzle's image matches the target image
      const loadedImageId = room.puzzle_data?.imageData?.id;
      if (loadedImageId && loadedImageId !== this.targetImageId) {
        // Image changed - clear old data before proceeding
        await this.clearRoomData();
        return false; // Signal to generate new puzzle
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
      .channel(`room:${this.roomCode}`, {
        config: {
          broadcast: { self: false }, // Don't receive our own broadcasts
        },
      })
      // Broadcast events for real-time updates (fast, batched)
      .on('broadcast', { event: 'piece_update' }, (payload) => {
        this.handleBroadcastPieceUpdate(payload.payload as IBroadcastPieceUpdate);
      })
      .on('broadcast', { event: 'selection_update' }, (payload) => {
        this.handleBroadcastSelectionUpdate(payload.payload as IBroadcastSelectionUpdate);
      })
      // Only subscribe to room changes (image updates)
      // NOTE: We DON'T subscribe to postgres_changes for pieces/selections anymore
      // because they arrive delayed (200-500ms) and cause pieces to jump back
      // after broadcast updates. Broadcast is the source of truth for real-time.
      // Postgres is only for persistence (initial load when joining).
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${this.roomCode}`,
        },
        (payload) => {
          this.handleRoomUpdate(payload);
        },
      )
      .subscribe();
  }

  // Fixed throttle for broadcast updates (batched, so piece count doesn't matter)
  private readonly SYNC_THROTTLE_MS = 50; // 20Hz - fast and responsive

  private normalizeRotationDiff(currentRotation: number, targetRotation: number): number {
    // Calculate the shortest rotation path
    let diff = targetRotation - currentRotation;

    // Normalize difference to [-PI, PI] range (shortest path)
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return currentRotation + diff;
  }

  // Broadcast handlers (batched real-time updates)
  private handleBroadcastPieceUpdate(payload: IBroadcastPieceUpdate): void {
    if (!payload || payload.user_id === this.userId) return;

    // Image mismatch detection - if sender has a different puzzle, trigger image change
    if (payload.image_id && String(payload.image_id) !== String(this.targetImageId)) {
      if (!this.isChangingImage) {
        console.log(
          `[NetworkHandler] Image mismatch detected: sender has ${payload.image_id}, we have ${this.targetImageId}`,
        );
        this.isChangingImage = true;

        // Trigger image change callback
        if (this.onImageChange) {
          this.onImageChange(payload.image_id);
        }
      }
      // Ignore updates from different puzzle
      return;
    }

    // Ignore updates if we're transitioning to a new puzzle
    if (this.isChangingImage) return;

    // Apply all pieces in the batch immediately (already batched by sender)
    for (const pieceData of payload.pieces) {
      const piece = this.puzzle.pieces[pieceData.piece_id] as Piece;
      if (!piece) continue;

      // Normalize rotation to take shortest path (prevent 350° -> 10° going the long way)
      const currentRotation = piece.rotation;
      const normalizedRotation = this.normalizeRotationDiff(currentRotation, pieceData.rotation);

      // Lerp remote updates for smooth animation
      piece.deserialize(
        {
          id: pieceData.piece_id,
          translation: { x: pieceData.x, y: pieceData.y },
          rotation: normalizedRotation,
          connectedSides: pieceData.connected_sides,
          elevation: pieceData.elevation,
          isSelectedByOther: piece.isSelectedByOther, // Preserve selection state
        },
        { lerp: true },
      );
    }
  }

  private handleBroadcastSelectionUpdate(payload: IBroadcastSelectionUpdate): void {
    if (!payload || payload.user_id === this.userId) return;
    // Ignore updates if we're transitioning to a new puzzle
    if (this.isChangingImage) return;

    const userId = payload.user_id;
    const newPieceIds = payload.piece_ids || [];

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
    if (newPieceIds.length > 0) {
      newPieceIds.forEach((pieceId) => {
        const piece = this.puzzle.pieces[pieceId] as Piece;
        if (piece) {
          piece.setSelectedByOther(true);
        }
      });
      this.currentSelections.set(userId, newPieceIds);
    } else {
      // Clear all selections for this user
      this.currentSelections.delete(userId);
    }
  }

  // Postgres handlers (fallback for late joiners, kept for persistence)
  private handlePieceUpdate(payload: any): void {
    const pieceData = payload.new as INetworkPieceData;
    if (!pieceData) return;

    // Ignore our own updates (prevent echo/bounce)
    if (pieceData.updated_by === this.userId) return;

    // Queue the update instead of applying immediately
    // This allows us to batch hundreds of rapid updates into one application
    this.pendingPieceUpdates.set(pieceData.piece_id, pieceData);

    // Schedule a flush if not already scheduled
    if (!this.updateFlushTimer) {
      this.updateFlushTimer = setTimeout(() => {
        this.flushPendingUpdates();
      }, this.UPDATE_FLUSH_INTERVAL);
    }
  }

  private flushPendingUpdates(): void {
    // Clear the timer
    this.updateFlushTimer = undefined;

    // Apply all pending updates in batch
    for (const [pieceId, pieceData] of this.pendingPieceUpdates) {
      const piece = this.puzzle.pieces[pieceId] as Piece;
      if (!piece) continue;

      // Normalize rotation to take shortest path (prevent 350° -> 10° going the long way)
      const currentRotation = piece.rotation;
      const normalizedRotation = this.normalizeRotationDiff(currentRotation, pieceData.rotation);

      // Lerp remote updates for smooth animation
      piece.deserialize(
        {
          id: pieceData.piece_id,
          translation: { x: pieceData.x, y: pieceData.y },
          rotation: normalizedRotation,
          connectedSides: pieceData.connected_sides,
          elevation: pieceData.elevation,
          isSelectedByOther: piece.isSelectedByOther, // Preserve selection state
        },
        { lerp: true },
      );
    }

    // Clear the queue
    this.pendingPieceUpdates.clear();
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

  private handleRoomUpdate(payload: any): void {
    // Handle INSERT or UPDATE events (new puzzle created or changed)
    if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
      const newImageId = payload.new.puzzle_data?.imageData?.id;
      if (newImageId && String(newImageId) !== String(this.targetImageId)) {
        // Only trigger if not already changing (might have been triggered by broadcast)
        if (!this.isChangingImage) {
          console.log(
            `[NetworkHandler] Room update detected: image changed from ${this.targetImageId} to ${newImageId}`,
          );
          // Image changed - stop processing updates to prevent piece snapping
          this.isChangingImage = true;

          // Trigger callback to update client-side
          if (this.onImageChange) {
            // Use callback for smooth client-side update (no reload)
            this.onImageChange(newImageId);
          } else {
            // Fallback: navigate/reload (old behavior)
            setTimeout(() => {
              this.navigateToNewPuzzle(newImageId);
            }, 500);
          }
        }
      }
    }
  }

  private navigateToNewPuzzle(newImageId: number | string): void {
    // Get current pathname and replace the image ID (last segment) with the new one
    const pathParts = window.location.pathname.split('/');

    // Handle both formats: /[lang]/room/[code] and /[lang]/room/[code]/[imageId]
    if (pathParts.length >= 4) {
      // Replace or add the image ID as the last segment
      if (pathParts.length === 4) {
        // Format: /[lang]/room/[code] - add image ID
        pathParts.push(String(newImageId));
      } else {
        // Format: /[lang]/room/[code]/[oldImageId] - replace image ID
        pathParts[pathParts.length - 1] = String(newImageId);
      }
      const newPath = pathParts.join('/');
      window.location.href = newPath;
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
  }

  public updateTargetImageId(newImageId: number | string): void {
    this.targetImageId = newImageId;
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

  public async syncPieces(pieces: Piece[], force = false): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    const modifiedPieces = pieces.filter((p) => p.isModified);
    if (modifiedPieces.length === 0) return;

    if (!force) {
      const now = Date.now();
      if (now - this.lastSyncTime < this.SYNC_THROTTLE_MS) return;
      this.lastSyncTime = now;
    }

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
      // Send broadcast first (real-time, fast)
      const broadcastPayload: IBroadcastPieceUpdate = {
        type: 'piece_batch',
        user_id: this.userId,
        image_id: this.targetImageId, // Include image ID to detect mismatches
        pieces: updates.map((u) => ({
          piece_id: u.piece_id,
          x: u.x,
          y: u.y,
          rotation: u.rotation,
          connected_sides: u.connected_sides,
          elevation: u.elevation,
        })),
      };

      await this.channel.send({
        type: 'broadcast',
        event: 'piece_update',
        payload: broadcastPayload,
      });

      // Then persist to DB (slower, but needed for late joiners)
      // Use fire-and-forget to avoid blocking on DB writes
      supabase
        .from('pieces')
        .upsert(updates, {
          onConflict: 'room_code,piece_id',
        })
        .then(({ error }) => {
          if (error) console.error('Failed to persist pieces to DB:', error);
        });

      // Mark pieces as synced immediately after broadcast
      modifiedPieces.forEach((p) => (p.isModified = false));
    } catch (error) {
      console.error('Failed to sync pieces:', error);
    }
  }

  public async syncSelection(pieceIds: number[]): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    try {
      // Send broadcast first (real-time)
      const broadcastPayload: IBroadcastSelectionUpdate = {
        type: 'selection',
        user_id: this.userId,
        piece_ids: pieceIds,
      };

      await this.channel.send({
        type: 'broadcast',
        event: 'selection_update',
        payload: broadcastPayload,
      });

      // Then persist to DB (fire-and-forget)
      if (pieceIds.length === 0) {
        // Clear selection
        supabase
          .from('selections')
          .delete()
          .eq('room_code', this.roomCode)
          .eq('user_id', this.userId)
          .then(({ error }) => {
            if (error) console.error('Failed to clear selection in DB:', error);
          });
      } else {
        // Update selection
        supabase
          .from('selections')
          .upsert(
            {
              room_code: this.roomCode,
              user_id: this.userId,
              piece_ids: pieceIds,
            },
            {
              onConflict: 'room_code,user_id',
            },
          )
          .then(({ error }) => {
            if (error) console.error('Failed to persist selection to DB:', error);
          });
      }
    } catch (error) {
      console.error('Failed to sync selection:', error);
    }
  }

  public async clearRoomData(): Promise<void> {
    try {
      // Delete all pieces for this room
      await supabase.from('pieces').delete().eq('room_code', this.roomCode);

      // Delete all selections for this room
      await supabase.from('selections').delete().eq('room_code', this.roomCode);

      // Delete the room itself
      await supabase.from('rooms').delete().eq('room_code', this.roomCode);

      // Unsubscribe from real-time updates
      if (this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = undefined;
      }

      this.isInitialized = false;
    } catch (error) {
      console.error('[NetworkHandler] Failed to clear room data:', error);
    }
  }

  public cleanup(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    // Clear pending update timer
    if (this.updateFlushTimer) {
      clearTimeout(this.updateFlushTimer);
      this.updateFlushTimer = undefined;
    }

    // Clear selection on cleanup
    this.syncSelection([]).catch(() => {});
  }
}
