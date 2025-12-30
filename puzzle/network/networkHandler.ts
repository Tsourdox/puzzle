import { supabase } from '@/utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type Piece from '../piece';
import { CURSOR_LERP_DURATION_MS, CURSOR_UPDATE_RATE_MS, SYNC_RATE_MS } from './constants';
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

export interface IBroadcastPieceUpdate {
  type: 'piece_batch';
  user_id: string;
  image_id: number | string;
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

export interface IBroadcastCursorUpdate {
  type: 'cursor';
  user_id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface IBroadcastConnectionUpdate {
  type: 'connection';
  user_id: string;
  piece_ids: number[];
}

export interface IRemoteCursor {
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  lerpTime: number;
  lastUpdate: number;
}

export default class NetworkHandler {
  private puzzle: ISerializablePuzzle;
  private roomCode: string;
  private userId: string;
  private targetImageId: number | string;
  private channel?: RealtimeChannel;
  private isInitialized: boolean;
  private lastSyncTime: number;
  private lastCursorSyncTime: number = 0;
  private userColors: Map<string, string> = new Map();
  private availableColors = [
    '#a855f7', // purple
    '#3b82f6', // blue
    '#10b981', // emerald
    '#ef4444', // red
    '#f59e0b', // amber
    '#ec4899', // pink
    '#eab308', // yellow
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#8b5cf6', // violet
  ];
  private myColor: string = '';
  private currentSelections: Map<string, number[]> = new Map(); // userId -> pieceIds
  private selectionIdToUser: Map<number, string> = new Map(); // selection id -> userId
  private remoteCursors: Map<string, IRemoteCursor> = new Map(); // userId -> cursor data
  private presenceState: Map<string, { color: string; online_at: string }> = new Map();

  private onImageChange?: (imageId: number | string) => void;
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
    let userId = localStorage.getItem('puzzelin_user_id');
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('puzzelin_user_id', userId);
    }
    return userId;
  }

  public async initialize(): Promise<boolean> {
    try {
      this.remoteCursors.clear();
      this.currentSelections.clear();
      this.presenceState.clear();

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', this.roomCode)
        .single();

      if (roomError || !room) {
        return false;
      }

      const loadedImageId = room.puzzle_data?.imageData?.id;
      if (loadedImageId && loadedImageId !== this.targetImageId) {
        await this.clearRoomData();
        return false;
      }

      await this.puzzle.deserialize(room.puzzle_data);

      const { data: pieces } = await supabase
        .from('pieces')
        .select('*')
        .eq('room_code', this.roomCode);

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

      const { data: selections } = await supabase
        .from('selections')
        .select('*')
        .eq('room_code', this.roomCode);

      if (selections) {
        for (const selection of selections) {
          const pieceIds = selection.piece_ids || [];

          if (selection.user_id === this.userId) {
            pieceIds.forEach((pieceId: number) => {
              const piece = this.puzzle.pieces[pieceId] as Piece;
              if (piece) {
                piece.isSelected = true;
              }
            });
          } else {
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
      this.remoteCursors.clear();
      this.currentSelections.clear();
      this.presenceState.clear();

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
          broadcast: { self: false },
          presence: { key: this.userId },
        },
      })
      .on('broadcast', { event: 'piece_update' }, (payload) => {
        this.handleBroadcastPieceUpdate(payload.payload as IBroadcastPieceUpdate);
      })
      .on('broadcast', { event: 'selection_update' }, (payload) => {
        this.handleBroadcastSelectionUpdate(payload.payload as IBroadcastSelectionUpdate);
      })
      .on('broadcast', { event: 'cursor_update' }, (payload) => {
        this.handleBroadcastCursorUpdate(payload.payload as IBroadcastCursorUpdate);
      })
      .on('broadcast', { event: 'connection' }, (payload) => {
        this.handleBroadcastConnection(payload.payload as IBroadcastConnectionUpdate);
      })
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        // Clear stale cursor data when user joins/rejoins to prevent flickering (e.g., after HMR)
        this.remoteCursors.delete(key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        this.remoteCursors.delete(key);
      })
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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.myColor = this.availableColors[0];

          await this.channel?.track({
            user_id: this.userId,
            color: this.myColor,
            online_at: new Date().toISOString(),
          });
        }
      });
  }

  private normalizeRotationDiff(currentRotation: number, targetRotation: number): number {
    let diff = targetRotation - currentRotation;

    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return currentRotation + diff;
  }

  private handleBroadcastPieceUpdate(payload: IBroadcastPieceUpdate): void {
    if (!payload || payload.user_id === this.userId) return;

    if (payload.image_id && String(payload.image_id) !== String(this.targetImageId)) {
      if (!this.isChangingImage) {
        console.log(
          `[NetworkHandler] Image mismatch detected: sender has ${payload.image_id}, we have ${this.targetImageId}`,
        );
        this.isChangingImage = true;

        this.remoteCursors.clear();
        this.currentSelections.clear();

        if (this.onImageChange) {
          this.onImageChange(payload.image_id);
        }
      }
      return;
    }

    if (this.isChangingImage) return;

    for (const pieceData of payload.pieces) {
      const piece = this.puzzle.pieces[pieceData.piece_id] as Piece;
      if (!piece) continue;

      // Normalize rotation to take shortest path (prevent 350° -> 10° going the long way)
      const currentRotation = piece.rotation;
      const normalizedRotation = this.normalizeRotationDiff(currentRotation, pieceData.rotation);

      piece.deserialize(
        {
          id: pieceData.piece_id,
          translation: { x: pieceData.x, y: pieceData.y },
          rotation: normalizedRotation,
          connectedSides: pieceData.connected_sides,
          elevation: pieceData.elevation,
          isSelectedByOther: piece.isSelectedByOther,
        },
        { lerp: true },
      );
    }
  }

  private handleBroadcastSelectionUpdate(payload: IBroadcastSelectionUpdate): void {
    if (!payload || payload.user_id === this.userId) return;
    if (this.isChangingImage) return;

    const userId = payload.user_id;
    const newPieceIds = payload.piece_ids || [];
    const userColor = this.getUserColor(userId);

    // "Last one wins" - if another user selects pieces we have selected, we lose them
    for (const pieceId of newPieceIds) {
      const piece = this.puzzle.pieces[pieceId] as Piece;
      if (piece && piece.isSelected) {
        piece.isSelected = false;
      }
    }

    const oldSelections = this.currentSelections.get(userId) || [];
    oldSelections.forEach((pieceId) => {
      if (!newPieceIds.includes(pieceId)) {
        const piece = this.puzzle.pieces[pieceId] as Piece;
        if (piece) {
          piece.setSelectedByOther(false);
        }
      }
    });

    if (newPieceIds.length > 0) {
      newPieceIds.forEach((pieceId) => {
        const piece = this.puzzle.pieces[pieceId] as Piece;
        if (piece) {
          piece.setSelectedByOther(true);
          piece.setOtherUserColor(userColor);
        }
      });
      this.currentSelections.set(userId, newPieceIds);
    } else {
      this.currentSelections.delete(userId);
    }

    // If we had a conflict, our selection changed - sync will happen automatically
    // via the puzzle's update loop which calls syncSelections
  }

  private handleBroadcastCursorUpdate(payload: IBroadcastCursorUpdate): void {
    if (!payload || payload.user_id === this.userId) return;
    if (this.isChangingImage) return;

    const userId = payload.user_id;
    const existingCursor = this.remoteCursors.get(userId);

    if (existingCursor) {
      existingCursor.nextX = payload.x;
      existingCursor.nextY = payload.y;
      existingCursor.lerpTime = 0;
      existingCursor.lastUpdate = payload.timestamp;
    } else {
      this.remoteCursors.set(userId, {
        x: payload.x,
        y: payload.y,
        nextX: payload.x,
        nextY: payload.y,
        lerpTime: CURSOR_LERP_DURATION_MS,
        lastUpdate: payload.timestamp,
      });
    }
  }

  private handleBroadcastConnection(payload: IBroadcastConnectionUpdate): void {
    if (!payload) return;
    if (this.isChangingImage) return;

    // Force deselect all connected pieces (for ALL users, including ourselves)
    // Connection takes precedence over any active dragging
    for (const pieceId of payload.piece_ids) {
      const piece = this.puzzle.pieces[pieceId] as Piece;
      if (piece) {
        piece.isSelected = false;
        piece.setSelectedByOther(false);
      }
    }
  }

  private assignMyColor(): void {
    const takenColors = Array.from(this.presenceState.values()).map((p) => p.color);
    const availableColor = this.availableColors.find((c) => !takenColors.includes(c));
    this.myColor = availableColor || this.availableColors[0];
  }

  private async handlePresenceSync(): Promise<void> {
    if (!this.channel) return;

    const presenceState = this.channel.presenceState();
    this.presenceState.clear();

    const activeUserIds = new Set<string>();
    for (const [userId, presences] of Object.entries(presenceState)) {
      const presence = presences[0] as any;
      if (presence && userId !== this.userId) {
        this.presenceState.set(userId, {
          color: presence.color,
          online_at: presence.online_at,
        });
        this.userColors.set(userId, presence.color);
        activeUserIds.add(userId);
      }
    }

    // Clean up cursors and selections for users no longer in presence
    // This fixes flickering after HMR when a user reconnects
    for (const userId of this.remoteCursors.keys()) {
      if (!activeUserIds.has(userId)) {
        this.remoteCursors.delete(userId);
      }
    }
    for (const userId of this.currentSelections.keys()) {
      if (!activeUserIds.has(userId)) {
        this.currentSelections.delete(userId);
      }
    }

    const previousColor = this.myColor;
    this.assignMyColor();

    if (this.myColor !== previousColor) {
      await this.channel.track({
        user_id: this.userId,
        color: this.myColor,
        online_at: new Date().toISOString(),
      });
      // Update all currently selected pieces with new color
      this.updateSelectedPiecesColor();
    }
  }

  private updateSelectedPiecesColor(): void {
    for (const piece of this.puzzle.pieces) {
      const p = piece as Piece;
      if (p.isSelected) {
        p.setUserColor(this.myColor);
      }
    }
  }

  public getUserColor(userId: string): string {
    if (this.presenceState.has(userId)) {
      return this.presenceState.get(userId)!.color;
    }
    if (!this.userColors.has(userId)) {
      const colorIndex = this.userColors.size % this.availableColors.length;
      this.userColors.set(userId, this.availableColors[colorIndex]);
    }
    return this.userColors.get(userId)!;
  }

  public getMyColor(): string {
    return this.myColor;
  }

  public getPresenceState(): Map<string, { color: string; online_at: string }> {
    return this.presenceState;
  }

  public getRemoteCursors(): Map<string, IRemoteCursor> {
    return this.remoteCursors;
  }

  public updateCursors(deltaTime: number): void {
    for (const cursor of this.remoteCursors.values()) {
      if (cursor.lerpTime < CURSOR_LERP_DURATION_MS) {
        cursor.lerpTime += deltaTime;
        const t = Math.min(1, cursor.lerpTime / CURSOR_LERP_DURATION_MS);
        cursor.x = cursor.x + (cursor.nextX - cursor.x) * t;
        cursor.y = cursor.y + (cursor.nextY - cursor.y) * t;
      }
    }
  }

  private handleRoomUpdate(payload: any): void {
    if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
      const newImageId = payload.new.puzzle_data?.imageData?.id;
      if (newImageId && String(newImageId) !== String(this.targetImageId)) {
        if (!this.isChangingImage) {
          console.log(
            `[NetworkHandler] Room update detected: image changed from ${this.targetImageId} to ${newImageId}`,
          );
          this.isChangingImage = true;

          this.remoteCursors.clear();
          this.currentSelections.clear();

          if (this.onImageChange) {
            this.onImageChange(newImageId);
          } else {
            setTimeout(() => {
              this.navigateToNewPuzzle(newImageId);
            }, 500);
          }
        }
      }
    }
  }

  private navigateToNewPuzzle(newImageId: number | string): void {
    const pathParts = window.location.pathname.split('/');

    if (pathParts.length >= 4) {
      if (pathParts.length === 4) {
        pathParts.push(String(newImageId));
      } else {
        pathParts[pathParts.length - 1] = String(newImageId);
      }
      const newPath = pathParts.join('/');
      window.location.href = newPath;
    } else {
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

    const changed =
      pieceIds.length !== this.lastSelectionSync.length ||
      !pieceIds.every((id) => this.lastSelectionSync.includes(id));

    if (changed) {
      this.lastSelectionSync = pieceIds;
      // Update newly selected pieces with our color
      for (const piece of selectedPieces) {
        (piece as Piece).setUserColor(this.myColor);
      }
      await this.syncSelection(pieceIds);
    }
  }

  public async syncPieces(pieces: Piece[], force = false): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    const modifiedPieces = pieces.filter((p) => p.isModified);
    if (modifiedPieces.length === 0) return;

    if (!force) {
      const now = Date.now();
      if (now - this.lastSyncTime < SYNC_RATE_MS) return;
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
        updated_by: this.userId,
      };
    });

    try {
      const broadcastPayload: IBroadcastPieceUpdate = {
        type: 'piece_batch',
        user_id: this.userId,
        image_id: this.targetImageId,
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

      modifiedPieces.forEach((p) => (p.isModified = false));
    } catch (error) {
      console.error('Failed to sync pieces:', error);
    }
  }

  public async syncSelection(pieceIds: number[]): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    try {
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

      if (pieceIds.length === 0) {
        supabase
          .from('selections')
          .delete()
          .eq('room_code', this.roomCode)
          .eq('user_id', this.userId)
          .then(({ error }) => {
            if (error) console.error('Failed to clear selection in DB:', error);
          });
      } else {
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

  public async syncCursorPosition(x: number, y: number): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    const now = Date.now();
    if (now - this.lastCursorSyncTime < CURSOR_UPDATE_RATE_MS) return;
    this.lastCursorSyncTime = now;

    try {
      const broadcastPayload: IBroadcastCursorUpdate = {
        type: 'cursor',
        user_id: this.userId,
        x,
        y,
        timestamp: now,
      };

      await this.channel.send({
        type: 'broadcast',
        event: 'cursor_update',
        payload: broadcastPayload,
      });
    } catch (error) {
      console.error('Failed to sync cursor position:', error);
    }
  }

  public async broadcastConnection(pieceIds: number[]): Promise<void> {
    if (!this.isInitialized || !this.channel) return;

    try {
      const broadcastPayload: IBroadcastConnectionUpdate = {
        type: 'connection',
        user_id: this.userId,
        piece_ids: pieceIds,
      };

      await this.channel.send({
        type: 'broadcast',
        event: 'connection',
        payload: broadcastPayload,
      });

      this.handleBroadcastConnection(broadcastPayload);
    } catch (error) {
      console.error('Failed to broadcast connection:', error);
    }
  }

  public async clearRoomData(): Promise<void> {
    try {
      await supabase.from('pieces').delete().eq('room_code', this.roomCode);

      await supabase.from('selections').delete().eq('room_code', this.roomCode);

      await supabase.from('rooms').delete().eq('room_code', this.roomCode);

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

    this.remoteCursors.clear();
    this.currentSelections.clear();
    this.presenceState.clear();

    this.syncSelection([]).catch(() => {});
  }
}
