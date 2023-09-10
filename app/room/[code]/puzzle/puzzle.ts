import P5 from 'p5';

export interface IPuzzle {
  p: P5;
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
  public p: P5;
  public image?: p5.Image;
  public pieces: ReadonlyArray<Piece>;
  public pieceCount: p5.Vector;
  public pieceSize: p5.Vector;
  public isModified: boolean;
  private inputHandler: InputHandler;
  private networkSerializer: NetworkSerializer;
  private pieceConnetor: PieceConnector;
  private piecesFactory?: PiecesFactory;

  constructor(p: P5) {
    this.p = p;
    this.pieces = [];
    this.pieceCount = p.createVector(0, 0);
    this.pieceSize = p.createVector(0, 0);
    this.isModified = false;
    this.inputHandler = new InputHandler(this);
    this.networkSerializer = new NetworkSerializer(
      this,
      this.inputHandler.graphHandler,
    );
    const { selectionHandler, transformHandler } = this.inputHandler;
    this.pieceConnetor = new PieceConnector(
      this,
      selectionHandler,
      transformHandler,
    );
  }

  public generateNewPuzzle(image: p5.Image, x: number, y: number) {
    this.isModified = true;
    this.image = image;
    this.pieceCount = createVector(x, y);
    this.pieceSize = createVector(image.width / x, image.height / y);
    this.pieces.forEach((p) => p.cleanup());

    this.piecesFactory = new PiecesFactory(x, y, image);
    this.pieces = this.piecesFactory.createAllPieces();
    this.inputHandler.graphHandler.zoomHome();
  }

  // todo: borde sparas eftersom detta blir kostsamt med många bitar
  // samt flytta till InputHandler
  public get selectedPieces(): Piece[] {
    return this.pieces.filter((p) => p.isSelected);
  }

  public update() {
    this.menu.update();
    if (this.networkSerializer.isLoading) return;

    this.networkSerializer.update();
    if (!this.menu.isOpen) {
      this.inputHandler.update();
      this.pieceConnetor.update();

      for (const piece of this.pieces) {
        piece.update();
      }
    }
  }

  public draw() {
    background(this.menu.settings.getValue('bakgrundsfärg'));
    textFont(fonts.primary);

    push();
    scale(this.inputHandler.graphHandler.scale);
    translate(this.inputHandler.graphHandler.translation);
    this.drawPieces();
    pop();

    const hideInstruction = Boolean(this.piecesFactory || this.menu.isOpen);
    this.inputHandler.draw(hideInstruction);
    this.menu.draw(this.networkSerializer.roomCode);
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
          this.piecesFactory = new PiecesFactory(x, y, image, puzzle.seed);
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
