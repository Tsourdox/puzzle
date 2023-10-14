import { StoreDispatch } from '@/store/StoreProvider';
import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import p5 from 'p5';
import InputHandler from './handlers/inputHandler';
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
  readonly dispatch: StoreDispatch; // maybe a bit to dependent on store?
}

export default class Puzzle implements IPuzzle, ISerializablePuzzle {
  public dispatch: StoreDispatch;
  public p: p5;
  public image?: p5.Image;
  public pieces: ReadonlyArray<Piece>;
  public pieceCount: p5.Vector;
  public pieceSize: p5.Vector;
  public isModified: boolean;
  private inputHandler: InputHandler;
  private networkSerializer: NetworkSerializer;
  private pieceConnector: PieceConnector;
  private piecesFactory?: PiecesFactory;
  private size: Size;
  private imageData: PexelsImage;

  constructor(p: p5, size: Size, image: PexelsImage, roomCode: string, dispatch: StoreDispatch) {
    this.dispatch = dispatch;
    this.p = p;
    this.size = size;
    this.imageData = image;
    this.pieces = [];
    this.pieceCount = p.createVector(0, 0);
    this.pieceSize = p.createVector(0, 0);
    this.isModified = false;
    this.inputHandler = new InputHandler(this);
    this.networkSerializer = new NetworkSerializer(this, this.inputHandler.graphHandler, roomCode);
    const { selectionHandler, transformHandler } = this.inputHandler;
    this.pieceConnector = new PieceConnector(this, selectionHandler, transformHandler);
  }

  private async loadCanvasImage(src: string) {
    return new Promise<p5.Image>((resolve) => {
      this.p.loadImage(src, (image) => {
        resolve(image);
      });
    });
  }

  public async tryLoadPuzzle() {
    return this.networkSerializer.loadPuzzle();
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
    this.inputHandler.graphHandler.zoomHome();
    await this.networkSerializer.saveInitialData();
  }

  // todo: borde sparas eftersom detta blir kostsamt med många bitar
  // samt flytta till InputHandler
  public get selectedPieces(): Piece[] {
    return this.pieces.filter((p) => p.isSelected);
  }

  public cleanup() {
    this.releaseCanvas();
    this.pieces.forEach((p) => p.releaseCanvas());
    this.networkSerializer.cleanup();
  }

  private releaseCanvas() {
    this.p.noLoop();
    this.p.width = 0;
    this.p.height = 0;
    this.p.clear(0, 0, 0, 0);
    this.p.remove();
    this.p = undefined as any;
  }

  public update(scrollDelta: number) {
    this.networkSerializer.update(this.p.deltaTime);
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
