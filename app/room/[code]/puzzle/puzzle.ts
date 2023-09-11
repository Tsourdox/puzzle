import p5 from 'p5';
import { globals } from '../utils/globals';
import InputHandler from './handlers/inputHandler';
import RoomCode from './menu/roomCode';
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
}

export interface IGeneratePuzzle {
  generateNewPuzzle(image: p5.Image, x: number, y: number): void;
}

export default class Puzzle
  implements IPuzzle, IGeneratePuzzle, ISerializablePuzzle
{
  public p: p5;
  public image?: p5.Image;
  public pieces: ReadonlyArray<Piece>;
  public pieceCount: p5.Vector;
  public pieceSize: p5.Vector;
  public isModified: boolean;
  private inputHandler: InputHandler;
  // private networkSerializer: NetworkSerializer;
  private pieceConnetor: PieceConnector;
  private piecesFactory?: PiecesFactory;
  private roomCode: RoomCode;

  constructor(canvas: p5) {
    this.p = canvas;
    this.pieces = [];
    this.pieceCount = canvas.createVector(0, 0);
    this.pieceSize = canvas.createVector(0, 0);
    this.isModified = false;
    this.inputHandler = new InputHandler(this);
    // this.networkSerializer = new NetworkSerializer(
    //   this,
    //   this.inputHandler.graphHandler,
    // );
    const { selectionHandler, transformHandler } = this.inputHandler;
    this.pieceConnetor = new PieceConnector(
      this,
      selectionHandler,
      transformHandler,
    );
    this.roomCode = new RoomCode();

    this.p.loadImage(globals.imageSrc, (image) => {
      let xy = 0;
      console.log(globals.size);
      switch (globals.size) {
        case 'XS':
          xy = 4;
          break;
        case 'S':
          xy = 8;
          break;
        case 'M':
          xy = 12;
          break;
        case 'L':
          xy = 20;
          break;
        case 'XL':
          xy = 30;
          break;
      }
      this.generateNewPuzzle(image, xy, xy);
    });
  }

  public generateNewPuzzle(image: p5.Image, x: number, y: number) {
    this.isModified = true;
    this.image = image;
    this.pieceCount = this.p.createVector(x, y);
    this.pieceSize = this.p.createVector(image.width / x, image.height / y);
    this.pieces.forEach((p) => p.cleanup());

    this.piecesFactory = new PiecesFactory(this.p, x, y, image);
    this.pieces = this.piecesFactory.createAllPieces();
    this.inputHandler.graphHandler.zoomHome();
  }

  // todo: borde sparas eftersom detta blir kostsamt med många bitar
  // samt flytta till InputHandler
  public get selectedPieces(): Piece[] {
    return this.pieces.filter((p) => p.isSelected);
  }

  public update() {
    // if (this.networkSerializer.isLoading) return;
    // this.networkSerializer.update();

    this.inputHandler.update();
    this.pieceConnetor.update();
    for (const piece of this.pieces) {
      piece.update();
    }
  }

  public draw() {
    this.p.clear(0, 0, 0, 0);
    this.p.textFont(globals.fonts.primary);

    this.p.push();
    this.p.scale(this.inputHandler.graphHandler.scale);
    this.p.translate(this.inputHandler.graphHandler.translation);
    this.drawPieces();
    this.p.pop();

    this.inputHandler.draw();
    // this.roomCode.draw(this.networkSerializer.roomCode);
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
      image:
        (this.image as any)?.canvas.toDataURL('image/jpeg', 0.85) || 'no-image',
    };
  }

  private resetPuzzle() {
    this.pieceCount = createVector(0, 0);
    this.pieceSize = createVector(0, 0);
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
        loadImage(puzzle.image, (image) => {
          const { x, y } = puzzle.pieceCount;
          this.image = image;
          this.pieceCount = createVector(x, y);
          this.pieceSize = createVector(image.width / x, image.height / y);
          this.piecesFactory = new PiecesFactory(
            this.p,
            x,
            y,
            image,
            puzzle.seed,
          );
          this.pieces = this.piecesFactory.createAllPieces(true);
          if (options?.roomChanged) {
            this.inputHandler.graphHandler.zoomHome();
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
