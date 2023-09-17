import ClientDB from './clientDB';
import {
  IDeserializedPieceData,
  IGraphData,
  IPuzzleData,
  ISerializableGraph,
  ISerializablePuzzle,
} from './types';

export const NETWORK_TIMEOUT = 100; //ms

export default class NetworkSerializer {
  private puzzle: ISerializablePuzzle;
  private graph: ISerializableGraph;
  private sendTimeout: number;
  private clientDB: ClientDB;
  private _roomCode: string;

  constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph, roomCode: string) {
    this.puzzle = puzzle;
    this.graph = graph;
    this._roomCode = roomCode;
    this.sendTimeout = NETWORK_TIMEOUT;
    this.clientDB = new ClientDB(roomCode);
  }

  public get roomCode() {
    return this._roomCode;
  }

  public update(deltaTime: number) {
    if (this.puzzle.isModified) {
      this.saveInitialData();
      this.puzzle.isModified = false;
    }

    if (this.sendTimeout <= 0) {
      this.sendTimeout = NETWORK_TIMEOUT;
      if (this.graph.isModified) {
        this.saveGraphDataToClientDB();
      }
      this.sendIncrementalPuzzleData();
    }

    this.sendTimeout -= deltaTime;
  }

  private saveInitialData() {
    const puzzleData = this.puzzle.serialize();
    this.clientDB.savePuzzle(puzzleData);
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

  public async loadPuzzle() {
    try {
      // Wait for connections to DB's to be established
      await this.clientDB.init();
      const graphData = await this.clientDB.loadGraph();
      const puzzleData = await this.clientDB.loadPuzzle();
      const piecesData = await this.clientDB.loadPieces();
      await this.deserializeAll(puzzleData, piecesData, graphData);
      return true;
    } catch (error) {
      console.error(error);
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
}
