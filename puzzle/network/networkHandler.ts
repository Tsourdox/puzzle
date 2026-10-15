import {
  puzzleKey,
  type ClientMessage,
  type Peer,
  type RoomSnapshot,
  type ServerMessage,
} from '@/shared/protocol';
import type Piece from '../piece';
import {
  CURSOR_LERP_DURATION_MS,
  CURSOR_UPDATE_RATE_MS,
  RECONNECT_DELAYS_MS,
  SYNC_RATE_MS,
} from './constants';
import type NetworkSerializer from './serializer';
import { toPieceData } from './serializer';
import type { IPieceData, IPuzzleData, ISerializablePuzzle } from './types';

export interface IRemoteCursor {
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  lerpTime: number;
  lastUpdate: number;
}

/** Our color until the server hands us one */
const DEFAULT_COLOR = '#a855f7';
const FALLBACK_COLOR = '#ffffff';

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Keeps messages small; nobody can see a hundredth of a pixel */
const toWire = (piece: IPieceData): IPieceData => ({
  ...piece,
  rotation: round(piece.rotation, 5),
  translation: { x: round(piece.translation.x, 2), y: round(piece.translation.y, 2) },
});

/**
 * The room's WebSocket (/api/ws, server/index.ts). Sends our moves, selection and cursor,
 * and applies everyone else's. Without a connection it keeps reconnecting, and moves made
 * in the meantime are marked unsynced so they're sent once we're back.
 */
export default class NetworkHandler {
  private puzzle: ISerializablePuzzle;
  private roomCode: string;
  private serializer: NetworkSerializer;
  private ws?: WebSocket;
  private isClosed = false;
  private reconnectAttempt = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private onWelcome?: (room: RoomSnapshot | null) => void;

  private myId = '';
  private myColor = DEFAULT_COLOR;
  private peers = new Map<string, Peer>();
  private remoteCursors = new Map<string, IRemoteCursor>();

  /** Pieces we moved since the last sync */
  private pendingIds = new Set<number>();
  private syncTimeout = 0;
  private forceSync = false;
  private lastSelection: number[] = [];
  private lastCursorSyncTime = 0;
  private isChangingImage = false;

  /** Called with the room's state when we (re)connect and when someone starts a new puzzle */
  public onRoom?: (room: RoomSnapshot) => void;

  constructor(puzzle: ISerializablePuzzle, roomCode: string, serializer: NetworkSerializer) {
    this.puzzle = puzzle;
    this.roomCode = roomCode;
    this.serializer = serializer;
  }

  private get pieces() {
    return this.puzzle.pieces as ReadonlyArray<Piece>;
  }

  public get isOnline() {
    return !!this.myId && this.ws?.readyState === WebSocket.OPEN;
  }

  /** Connects, resolving with the room's state, or null if the server doesn't answer in time */
  public connect(timeoutMs: number): Promise<RoomSnapshot | null> {
    window.addEventListener('online', this.reconnectNow);
    return new Promise((resolve) => {
      const timer = setTimeout(() => this.onWelcome?.(null), timeoutMs);
      this.onWelcome = (room) => {
        clearTimeout(timer);
        this.onWelcome = undefined;
        resolve(room);
      };
      this.openSocket();
    });
  }

  private openSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const room = encodeURIComponent(this.roomCode);
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?room=${room}`);
    this.ws = ws;

    ws.onmessage = (event) => {
      if (this.ws !== ws) return;
      try {
        this.handleMessage(JSON.parse(event.data));
      } catch (error) {
        console.error('Failed to handle message:', error);
      }
    };

    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = undefined;
      this.myId = '';
      this.clearPeers();
      this.onWelcome?.(null);
      if (this.isClosed) return;
      const delays = RECONNECT_DELAYS_MS;
      const delay = delays[Math.min(this.reconnectAttempt++, delays.length - 1)];
      this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
    };
  }

  private reconnectNow = () => {
    if (this.ws || this.isClosed) return;
    clearTimeout(this.reconnectTimer);
    this.openSocket();
  };

  private send(message: ClientMessage) {
    if (this.isOnline) this.ws!.send(JSON.stringify(message));
  }

  /* -------------------------------- incoming ------------------------------- */

  private handleMessage(message: ServerMessage) {
    if (this.isChangingImage) return;

    switch (message.type) {
      case 'welcome':
        this.myId = message.id;
        this.myColor = message.color;
        this.reconnectAttempt = 0;
        this.setPeers(message.peers);
        // Tell the room what we're holding
        this.lastSelection = [];
        this.updateSelectedPiecesColor();
        this.onRoom?.(message.room);
        this.onWelcome?.(message.room);
        return;
      case 'room':
        this.clearPeerSelections();
        this.onRoom?.(message.room);
        return;
      case 'peers':
        this.setPeers(message.peers);
        return;
      case 'pieces':
        this.applyRemotePieces(message.pieces);
        return;
      case 'select':
        this.handleSelection(message.from, message.pieceIds);
        return;
      case 'cursor':
        this.handleCursor(message.from, message.x, message.y);
        return;
      case 'connect':
        this.handleConnection(message.pieceIds);
        return;
    }
  }

  private setPeers(peers: Peer[]) {
    const others = peers.filter((peer) => peer.id !== this.myId);
    const ids = new Set(others.map((peer) => peer.id));
    for (const id of this.peers.keys()) {
      if (!ids.has(id)) this.remoteCursors.delete(id);
    }
    this.peers = new Map(others.map((peer) => [peer.id, peer]));
    this.refreshPeerSelections();
  }

  private clearPeers() {
    this.peers.clear();
    this.remoteCursors.clear();
    this.refreshPeerSelections();
  }

  private clearPeerSelections() {
    for (const peer of this.peers.values()) peer.pieceIds = [];
    this.refreshPeerSelections();
  }

  /** Marks every piece someone else is holding, in their color */
  public refreshPeerSelections() {
    const held = new Map<number, string>();
    for (const peer of this.peers.values()) {
      for (const id of peer.pieceIds) held.set(id, peer.color);
    }
    for (const piece of this.pieces) {
      const color = held.get(piece.id);
      piece.setSelectedByOther(color !== undefined);
      if (color) piece.setSelectionColor(color);
    }
  }

  /** Moves pieces to where another player put them (unless `skip`ped) */
  public applyRemotePieces(pieces: IPieceData[], skip?: ReadonlySet<number>) {
    const applied = pieces.filter((data) => this.pieces[data.id] && !skip?.has(data.id));
    for (const data of applied) {
      const piece = this.pieces[data.id];
      piece.deserialize(
        {
          ...data,
          // Turn the short way round (350° -> 10° shouldn't spin backwards)
          rotation: this.normalizeRotationDiff(piece.rotation, data.rotation),
          isSelectedByOther: piece.isSelectedByOther,
        },
        { lerp: true },
      );
    }
    this.serializer.queueRemote(applied);
  }

  private normalizeRotationDiff(currentRotation: number, targetRotation: number): number {
    let diff = targetRotation - currentRotation;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return currentRotation + diff;
  }

  private handleSelection(userId: string, pieceIds: number[]) {
    const peer = this.peers.get(userId);
    if (!peer) return;

    // "Last one wins": if they grab pieces we're holding, we let go
    for (const id of pieceIds) {
      const piece = this.pieces[id];
      if (piece?.isSelected) piece.isSelected = false;
    }
    peer.pieceIds = pieceIds;
    this.refreshPeerSelections();
  }

  private handleCursor(userId: string, x: number, y: number) {
    const now = Date.now();
    const cursor = this.remoteCursors.get(userId);
    if (cursor) {
      cursor.nextX = x;
      cursor.nextY = y;
      cursor.lerpTime = 0;
      cursor.lastUpdate = now;
    } else {
      this.remoteCursors.set(userId, {
        x,
        y,
        nextX: x,
        nextY: y,
        lerpTime: CURSOR_LERP_DURATION_MS,
        lastUpdate: now,
      });
    }
  }

  /** Snapped pieces are let go by everyone, including whoever is dragging them */
  private handleConnection(pieceIds: number[]) {
    for (const id of pieceIds) {
      const piece = this.pieces[id];
      if (piece) {
        piece.isSelected = false;
        piece.setSelectedByOther(false);
      }
    }
    for (const peer of this.peers.values()) {
      peer.pieceIds = peer.pieceIds.filter((id) => !pieceIds.includes(id));
    }
  }

  /* -------------------------------- outgoing ------------------------------- */

  /** Starts (or replaces) the room's puzzle with ours */
  public create(puzzle: IPuzzleData, pieces: IPieceData[]) {
    this.send({ type: 'create', puzzle, pieces: pieces.map(toWire) });
  }

  public queuePieces(ids: Iterable<number>) {
    for (const id of ids) this.pendingIds.add(id);
  }

  /** Sends queued pieces on the next update, without waiting for the sync rate */
  public requestSync() {
    this.forceSync = true;
  }

  public update(deltaTime: number, selectedPieces: Piece[]) {
    this.syncTimeout -= deltaTime;
    if (this.pendingIds.size && (this.forceSync || this.syncTimeout <= 0)) {
      this.syncPieces();
    }
    this.syncSelection(selectedPieces);
    this.updateCursors(deltaTime);
  }

  private syncPieces() {
    const ids = [...this.pendingIds];
    this.pendingIds.clear();
    this.forceSync = false;
    this.syncTimeout = SYNC_RATE_MS;

    if (!this.isOnline) {
      this.serializer.markUnsynced(ids);
      return;
    }
    const pieces = ids.flatMap((id) =>
      this.pieces[id] ? [toWire(toPieceData(this.pieces[id]))] : [],
    );
    this.send({ type: 'pieces', key: puzzleKey(this.puzzle.serialize()), pieces });
  }

  private syncSelection(selectedPieces: Piece[]) {
    const pieceIds = selectedPieces.map((piece) => piece.id);
    const changed =
      pieceIds.length !== this.lastSelection.length ||
      !pieceIds.every((id) => this.lastSelection.includes(id));
    if (!changed) return;

    this.lastSelection = pieceIds;
    selectedPieces.forEach((piece) => piece.setSelectionColor(this.myColor));
    this.send({ type: 'select', pieceIds });
  }

  public syncCursorPosition(x: number, y: number) {
    if (!this.isOnline) return;
    const now = Date.now();
    if (now - this.lastCursorSyncTime < CURSOR_UPDATE_RATE_MS) return;
    this.lastCursorSyncTime = now;
    this.send({ type: 'cursor', x: round(x, 1), y: round(y, 1) });
  }

  public broadcastConnection(pieceIds: number[]) {
    if (!this.isOnline) return;
    this.send({ type: 'connect', pieceIds });
    this.handleConnection(pieceIds);
  }

  /* --------------------------------- state --------------------------------- */

  private updateSelectedPiecesColor() {
    for (const piece of this.pieces) {
      if (piece.isSelected) piece.setSelectionColor(this.myColor);
    }
  }

  public getUserColor(userId: string): string {
    return this.peers.get(userId)?.color ?? FALLBACK_COLOR;
  }

  public getMyColor(): string {
    return this.myColor;
  }

  public getPresenceState(): ReadonlyMap<string, Peer> {
    return this.peers;
  }

  public getRemoteCursors(): Map<string, IRemoteCursor> {
    return this.remoteCursors;
  }

  private updateCursors(deltaTime: number) {
    for (const cursor of this.remoteCursors.values()) {
      if (cursor.lerpTime < CURSOR_LERP_DURATION_MS) {
        cursor.lerpTime += deltaTime;
        const t = Math.min(1, cursor.lerpTime / CURSOR_LERP_DURATION_MS);
        cursor.x = cursor.x + (cursor.nextX - cursor.x) * t;
        cursor.y = cursor.y + (cursor.nextY - cursor.y) * t;
      }
    }
  }

  /** Someone switched the room to another image; ignore the room until we've navigated there */
  public stopForImageChange() {
    this.isChangingImage = true;
    this.clearPeers();
  }

  public cleanup() {
    this.isClosed = true;
    clearTimeout(this.reconnectTimer);
    window.removeEventListener('online', this.reconnectNow);
    this.ws?.close();
    this.ws = undefined;
    this.clearPeers();
  }
}
