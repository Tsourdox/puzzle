import { Database } from 'bun:sqlite';
import type { IPieceData, IPuzzleData, RoomSnapshot } from '../shared/protocol';

/** Rooms and their pieces in SQLite. Pieces are stored as JSON, they're only ever read whole. */
export default class Store {
  private db: Database;
  private selectRoom;
  private selectPieces;
  private upsertRoom;
  private touchRoom;
  private upsertPiece;
  private deletePieces;
  private selectCache;
  private upsertCache;

  constructor(path: string) {
    this.db = new Database(path, { create: true });
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run(`CREATE TABLE IF NOT EXISTS rooms (
      code TEXT PRIMARY KEY,
      puzzle TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
    this.db.run(`CREATE TABLE IF NOT EXISTS pieces (
      room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
      piece_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (room_code, piece_id)
    ) WITHOUT ROWID`);
    // Pexels answers (server/pexels.ts)
    this.db.run(`CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires INTEGER NOT NULL
    )`);

    this.selectRoom = this.db.query<{ puzzle: string }, [string]>(
      'SELECT puzzle FROM rooms WHERE code = ?',
    );
    this.selectPieces = this.db.query<{ data: string }, [string]>(
      'SELECT data FROM pieces WHERE room_code = ?',
    );
    this.upsertRoom = this.db.query<unknown, [string, string, number, number]>(
      `INSERT INTO rooms (code, puzzle, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (code) DO UPDATE SET puzzle = ?2, created_at = ?3, updated_at = ?4`,
    );
    this.touchRoom = this.db.query<unknown, [number, string]>(
      'UPDATE rooms SET updated_at = ? WHERE code = ?',
    );
    this.upsertPiece = this.db.query<unknown, [string, number, string]>(
      `INSERT INTO pieces (room_code, piece_id, data) VALUES (?1, ?2, ?3)
       ON CONFLICT (room_code, piece_id) DO UPDATE SET data = ?3`,
    );
    this.deletePieces = this.db.query<unknown, [string]>('DELETE FROM pieces WHERE room_code = ?');
    this.selectCache = this.db.query<{ value: string; expires: number }, [string]>(
      'SELECT value, expires FROM cache WHERE key = ?',
    );
    this.upsertCache = this.db.query<unknown, [string, string, number]>(
      `INSERT INTO cache (key, value, expires) VALUES (?1, ?2, ?3)
       ON CONFLICT (key) DO UPDATE SET value = ?2, expires = ?3`,
    );
  }

  public getPuzzle(code: string): IPuzzleData | null {
    const row = this.selectRoom.get(code);
    return row ? JSON.parse(row.puzzle) : null;
  }

  public getRoom(code: string): RoomSnapshot {
    const puzzle = this.getPuzzle(code);
    const pieces = puzzle ? this.selectPieces.all(code).map((row) => JSON.parse(row.data)) : [];
    return { puzzle, pieces };
  }

  /** A new puzzle replaces the room's old one and all its pieces */
  public replaceRoom = (code: string, puzzle: IPuzzleData, pieces: IPieceData[]) =>
    this.db.transaction(() => {
      const now = Date.now();
      this.deletePieces.run(code);
      this.upsertRoom.run(code, JSON.stringify(puzzle), now, now);
      for (const piece of pieces) this.upsertPiece.run(code, piece.id, JSON.stringify(piece));
    })();

  public savePieces = (code: string, pieces: IPieceData[]) =>
    this.db.transaction(() => {
      for (const piece of pieces) this.upsertPiece.run(code, piece.id, JSON.stringify(piece));
      this.touchRoom.run(Date.now(), code);
    })();

  public getCache<T>(key: string): { value: T; expires: number } | null {
    const row = this.selectCache.get(key);
    return row ? { value: JSON.parse(row.value), expires: row.expires } : null;
  }

  /** Values of every cache key matching one of the LIKE patterns */
  public getCacheValues<T>(patterns: string[]): T[] {
    const where = patterns.map(() => 'key LIKE ?').join(' OR ');
    return this.db
      .query<{ value: string }, string[]>(`SELECT value FROM cache WHERE ${where}`)
      .all(...patterns)
      .map((row) => JSON.parse(row.value));
  }

  public setCache(key: string, value: unknown, ttl: number) {
    this.upsertCache.run(key, JSON.stringify(value), Date.now() + ttl);
  }

  public close() {
    this.db.close();
  }
}
