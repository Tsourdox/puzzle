import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import p5 from 'p5';
import InputHandler from './handlers/inputHandler';
import NetworkHandler from './network/networkHandler';
import NetworkSerializer from './network/serializer';
import { IDeserializeOptions, IPuzzleData, ISerializablePuzzle } from './network/types';
import Piece from './piece';
import PieceConnector from './pieceConnector';
import PiecesFactory from './piecesFactory';
import { toPoint } from './utils/general';
import { sortPieces } from './utils/pieces';

export interface IPuzzle {
  p: p5;
  image?: p5.Image;
  pieces: ReadonlyArray<Piece>;
  pieceCount: p5.Vector;
  pieceSize: p5.Vector;
  readonly selectedPieces: ReadonlyArray<Piece>;
  readonly setShowPuzzlePieceActions: (show: boolean) => void;
}

export default class Puzzle implements IPuzzle, ISerializablePuzzle {
  public setShowPuzzlePieceActions: (show: boolean) => void;
  public p: p5;
  public image?: p5.Image;
  public pieces: ReadonlyArray<Piece>;
  public pieceCount: p5.Vector;
  public pieceSize: p5.Vector;
  public isModified: boolean;
  private inputHandler: InputHandler;
  private networkSerializer: NetworkSerializer;
  private networkHandler: NetworkHandler;
  private pieceConnector: PieceConnector;
  private piecesFactory?: PiecesFactory;
  private size: Size;
  private imageData: PexelsImage;

  constructor(
    p: p5,
    size: Size,
    image: PexelsImage,
    roomCode: string,
    setShowPuzzlePieceActions: (show: boolean) => void,
  ) {
    this.setShowPuzzlePieceActions = setShowPuzzlePieceActions;
    this.p = p;
    this.size = size;
    this.imageData = image;
    this.pieces = [];
    this.pieceCount = p.createVector(0, 0);
    this.pieceSize = p.createVector(0, 0);
    this.isModified = false;
    this.inputHandler = new InputHandler(this);
    this.networkSerializer = new NetworkSerializer(this, this.inputHandler.graphHandler, roomCode);
    this.networkHandler = new NetworkHandler(this, roomCode, image.id);
    const { selectionHandler, transformHandler } = this.inputHandler;
    this.pieceConnector = new PieceConnector(
      this,
      selectionHandler,
      transformHandler,
      this.networkHandler,
    );
  }

  private async loadCanvasImage(src: string) {
    return new Promise<p5.Image>((resolve) => {
      this.p.loadImage(src, (image) => {
        resolve(image);
      });
    });
  }

  public async tryLoadPuzzle() {
    // Try to load from Supabase first (multiplayer)
    // NetworkHandler will check image ID and clear data if needed
    const loadedFromNetwork = await this.networkHandler.initialize();
    if (loadedFromNetwork) {
      // Initialize IndexedDB for local state persistence
      await this.networkSerializer.init();
      // Save the puzzle data to IndexedDB so joiners can continue later
      const puzzleData = this.serialize();
      await this.networkSerializer.clientDB.savePuzzle(puzzleData);
      // Load user's personal zoom/pan state from IndexedDB
      const hasGraphData = await this.networkSerializer.loadGraphData();
      // If no saved zoom/pan state, zoom to fit all pieces
      if (!hasGraphData) {
        this.inputHandler.graphHandler.zoomHome();
      }
      return true;
    }

    // If initialize returned false, it might be because:
    // 1. No room exists yet (first time)
    // 2. Image mismatch was detected and data was cleared
    // In case of image mismatch, we need to clear local IndexedDB too
    await this.networkSerializer.init();
    await this.networkSerializer.clearAll();

    // Don't try to load from IndexedDB - let generateNewPuzzle() be called
    return false;
  }

  private getPiecesCountFromSize(size: Size) {
    return { xs: 4, s: 8, m: 12, l: 20, xl: 30 }[size];
  }

  public async generateNewPuzzle() {
    const xy = this.getPiecesCountFromSize(this.size);
    this.image = await this.loadCanvasImage(this.imageData.src.large2x);
    this.isModified = true;
    this.pieceCount = this.p.createVector(xy, xy);
    this.pieceSize = this.p.createVector(this.image.width / xy, this.image.height / xy);

    this.piecesFactory = new PiecesFactory(this.p, xy, xy, this.image);
    this.pieces = this.piecesFactory.createAllPieces();

    // Explode pieces slightly so they're not stacked on top of each other
    const explosionFactor = 0.5;
    const puzzleCenter = this.p.createVector(this.image.width / 2, this.image.height / 2);
    for (const piece of this.pieces) {
      const pieceCenter = piece.getTrueCenter();
      const offset = p5.Vector.sub(pieceCenter, puzzleCenter);
      const explosion = offset.copy().mult(explosionFactor);
      piece.translation = p5.Vector.add(piece.translation, explosion);
    }

    this.inputHandler.graphHandler.zoomHome();

    // Save to both IndexedDB and Supabase
    await this.networkSerializer.saveInitialData();
    const puzzleData = this.serialize();
    await this.networkHandler.createRoom(puzzleData);
  }

  // todo: borde sparas eftersom detta blir kostsamt med många bitar
  // samt flytta till InputHandler
  public get selectedPieces(): Piece[] {
    return this.pieces.filter((p) => p.isSelected);
  }

  // Public methods for button controls
  public zoomIn() {
    const zoomFactor = 1.2; // 20% zoom in
    const center = this.p.createVector(this.p.width / 2, this.p.height / 2);
    this.inputHandler.graphHandler.zoom(zoomFactor, center);
  }

  public zoomOut() {
    const zoomFactor = 1 / 1.2; // 20% zoom out
    const center = this.p.createVector(this.p.width / 2, this.p.height / 2);
    this.inputHandler.graphHandler.zoom(zoomFactor, center);
  }

  public rotateLeft() {
    const rotation = 0.1; // ~5.7 degrees
    this.inputHandler.transformHandler['rotatePieces'](-rotation);
  }

  public rotateRight() {
    const rotation = 0.1;
    this.inputHandler.transformHandler['rotatePieces'](rotation);
  }

  public stackPieces() {
    this.inputHandler.transformHandler['stackPieces']();
  }

  public explodePieces() {
    this.inputHandler.transformHandler['explodePieces']();
  }

  public deselectAll() {
    this.pieces.forEach((p) => (p.isSelected = false));
    this.setShowPuzzlePieceActions(false);
  }

  public cleanup() {
    this.releaseCanvas();
    this.pieces.forEach((p) => p.releaseCanvas());
    this.networkSerializer.cleanup();
    this.networkHandler.cleanup();
  }

  private releaseCanvas() {
    this.p.noLoop();
    this.p.width = 0;
    this.p.height = 0;
    this.p.clear(0, 0, 0, 0);
    this.p.remove();
  }

  public update(scrollDelta: number) {
    this.networkSerializer.update(this.p.deltaTime);
    this.networkHandler.syncPieces(this.pieces as Piece[]);
    this.networkHandler.syncSelections(this.selectedPieces);
    this.inputHandler.update(scrollDelta);
    this.pieceConnector.update();
    for (const piece of this.pieces) {
      piece.update();
    }
  }

  public draw() {
    this.p.clear(0, 0, 0, 0);

    this.p.push();
    this.p.scale(this.inputHandler.graphHandler.scale);
    this.p.translate(this.inputHandler.graphHandler.translation);
    this.drawPieces();
    this.p.pop();

    this.inputHandler.draw();
  }

  private drawPieces() {
    for (const piece of sortPieces(this.pieces)) {
      piece.draw();
    }
  }

  public serialize(): IPuzzleData {
    return {
      pieceCount: toPoint(this.pieceCount),
      seed: this.piecesFactory?.seed || 0,
      imageData: this.imageData,
      size: this.size,
    };
  }

  private resetPuzzle() {
    this.pieceCount = this.p.createVector(0, 0);
    this.pieceSize = this.p.createVector(0, 0);
    this.pieces = [];
    delete this.piecesFactory;
  }

  public deserialize(puzzle: IPuzzleData, options: IDeserializeOptions) {
    return new Promise<void>((resolve, reject) => {
      if (!puzzle) {
        this.resetPuzzle();
        return;
      }
      try {
        this.p.loadImage(puzzle.imageData.src.large2x, (image) => {
          const { x, y } = puzzle.pieceCount;
          this.image = image;
          this.pieceCount = this.p.createVector(x, y);
          this.pieceSize = this.p.createVector(image.width / x, image.height / y);
          this.piecesFactory = new PiecesFactory(this.p, x, y, image, puzzle.seed);
          this.pieces = this.piecesFactory.createAllPieces(true);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
