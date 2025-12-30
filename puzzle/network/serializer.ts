import ClientDB from './clientDB';
import { INDEXEDDB_SAVE_RATE_MS } from './constants';
import {
  IDeserializedPieceData,
  IGraphData,
  IPuzzleData,
  ISerializableGraph,
  ISerializablePuzzle,
} from './types';

export default class NetworkSerializer {
  private puzzle: ISerializablePuzzle;
  private graph: ISerializableGraph;
  private sendTimeout: number;
  public clientDB: ClientDB;
  private _roomCode: string;

  constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph, roomCode: string) {
    this.puzzle = puzzle;
    this.graph = graph;
    this._roomCode = roomCode;
    this.sendTimeout = INDEXEDDB_SAVE_RATE_MS;
    this.clientDB = new ClientDB(roomCode);
  }

  public get roomCode() {
    return this._roomCode;
  }

  public update(deltaTime: number) {
    // if (this.puzzle.isModified) {
    //   this.puzzle.isModified = false;
    //   this.saveInitialData();
    // }

    if (this.sendTimeout <= 0) {
      this.sendTimeout = INDEXEDDB_SAVE_RATE_MS;
      if (this.graph.isModified) {
        this.saveGraphDataToClientDB();
      }
      this.sendIncrementalPuzzleData();
    }

    this.sendTimeout -= deltaTime;
  }

  public async saveInitialData() {
    const puzzleData = this.puzzle.serialize();
    await this.clientDB.initVersion();
    await this.clientDB.createObjectStore(this.roomCode);
    await this.clientDB.open();
    await this.clientDB.savePuzzle(puzzleData);
    this.saveGraphDataToClientDB();
  }

  private saveGraphDataToClientDB() {
    const graphData = this.graph.serialize();
    this.clientDB.saveGraph(graphData);
  }

  private sendIncrementalPuzzleData() {
    const { pieces } = this.puzzle;
    const piecesData = pieces.filter((p) => p.isModified).map((p) => p.serialize());
    if (piecesData.length) {
      this.clientDB.savePieces(piecesData);
    }
  }

  public async init() {
    await this.clientDB.initVersion();
    await this.clientDB.createObjectStore(this.roomCode);
    await this.clientDB.open();
  }

  public async loadGraphData(): Promise<boolean> {
    try {
      const graphData = await this.clientDB.loadGraph();
      if (graphData) {
        await this.graph.deserialize(graphData);
        return true;
      }
      return false;
    } catch (error) {
      // No graph data saved yet, that's fine
      return false;
    }
  }

  public cleanup() {
    this.clientDB.close();
  }

  public async loadPuzzle() {
    try {
      await this.clientDB.open();
      const graphData = await this.clientDB.loadGraph();
      const puzzleData = await this.clientDB.loadPuzzle();
      const piecesData = await this.clientDB.loadPieces();
      await this.deserializeAll(puzzleData, piecesData, graphData);
      return true;
    } catch (error) {
      await this.clientDB.close();
      return false;
    }
  }

  private async deserializeAll(
    puzzleData: IPuzzleData,
    piecesData: IDeserializedPieceData[],
    graphData: IGraphData,
  ) {
    await this.graph.deserialize(graphData);
    await this.puzzle.deserialize(puzzleData);
    if (!this.puzzle.pieces.length) return;
    for (const pieceData of piecesData) {
      await this.puzzle.pieces[pieceData.id].deserialize(pieceData, {
        lerp: false,
      });
    }
  }

  public async clearAll(): Promise<void> {
    try {
      await this.clientDB.clearAll();
    } catch (error) {
      console.error('Failed to clear local data:', error);
    }
  }
}
