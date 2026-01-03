import { PexelsImage } from '@/utils/pexels';
import { Size } from '@/utils/sizes';
import p5 from 'p5';
import InputHandler from './handlers/inputHandler';
import { CURSOR_INACTIVE_TIMEOUT_MS } from './network/constants';
import NetworkHandler from './network/networkHandler';
import NetworkSerializer from './network/serializer';
import { IDeserializeOptions, IPuzzleData, ISerializablePuzzle } from './network/types';
import Piece from './piece';
import PieceConnector from './pieceConnector';
import PiecesFactory from './piecesFactory';
import { ISettings } from './settings';
import { isMouseOverCanvas, toPoint } from './utils/general';
import { sortPieces } from './utils/pieces';

export interface IPuzzle {
  p: p5;
  image?: p5.Image;
  pieces: ReadonlyArray<Piece>;
  pieceCount: p5.Vector;
  pieceSize: p5.Vector;
  readonly selectedPieces: ReadonlyArray<Piece>;
  readonly setShowPuzzlePieceControls: (show: boolean) => void;
  getMyColor(): string;
}

export interface IPuzzleControls {
  zoomIn(): void;
  zoomOut(): void;
  rotateLeft(): void;
  rotateRight(): void;
  stackPieces(): void;
  explodePieces(): void;
  reconnectPieces(): void;
  deselectAll(): void;
}

export default class Puzzle implements IPuzzle, ISerializablePuzzle, IPuzzleControls {
  public setShowPuzzlePieceControls: (show: boolean) => void;
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
  private readonly cursorVertices = {
    tip: [0, 0],
    leftBottom: [0, 11.76],
    notchStart: [2.88, 9.6],
    handleBottomLeft: [4.8, 14.4],
    handleBottom1: [5.52, 14.8],
    handleBottom2: [6.53, 14.4],
    handleBottomRight: [6.72, 13.6],
    notchEnd: [4.9, 8.8],
    rightPoint: [8.72, 8.64],
  };

  private settings: ISettings;

  constructor(
    p: p5,
    size: Size,
    image: PexelsImage,
    roomCode: string,
    settings: ISettings,
    setShowPuzzlePieceControls: (show: boolean) => void,
    onImageChange?: (imageId: number | string) => void,
  ) {
    this.setShowPuzzlePieceControls = setShowPuzzlePieceControls;
    this.p = p;
    this.size = size;
    this.imageData = image;
    this.settings = settings;
    this.pieces = [];
    this.pieceCount = p.createVector(0, 0);
    this.pieceSize = p.createVector(0, 0);
    this.isModified = false;
    this.inputHandler = new InputHandler(this, settings);
    this.networkSerializer = new NetworkSerializer(this, this.inputHandler.graphHandler, roomCode);
    this.networkHandler = new NetworkHandler(this, roomCode, image.id, onImageChange);
    const { selectionHandler, transformHandler } = this.inputHandler;
    this.pieceConnector = new PieceConnector(
      this,
      selectionHandler,
      transformHandler,
      this.networkHandler,
      settings,
    );
  }

  public updateSettings(settings: ISettings) {
    Object.assign(this.settings, settings);
  }

  public getMyColor(): string {
    return this.networkHandler.getMyColor();
  }

  private async loadCanvasImage(src: string) {
    return new Promise<p5.Image>((resolve) => {
      this.p.loadImage(src, (image) => {
        resolve(image);
      });
    });
  }

  public async tryLoadPuzzle() {
    // Try Supabase first (multiplayer). NetworkHandler checks image ID and clears stale data.
    const loadedFromNetwork = await this.networkHandler.initialize();
    if (loadedFromNetwork) {
      await this.networkSerializer.init();
      const puzzleData = this.serialize();
      await this.networkSerializer.clientDB.savePuzzle(puzzleData);
      const hasGraphData = await this.networkSerializer.loadGraphData();
      if (!hasGraphData) {
        this.inputHandler.graphHandler.zoomHome();
      }
      return true;
    }

    // No room exists yet OR image mismatch detected. Clear local IndexedDB to stay in sync.
    await this.networkSerializer.init();
    await this.networkSerializer.clearAll();
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

    this.piecesFactory = new PiecesFactory(this.p, xy, xy, this.image, this.settings);
    this.pieces = this.piecesFactory.createAllPieces();

    // Explode pieces slightly to avoid initial stacking
    const explosionFactor = 0.5;
    const puzzleCenter = this.p.createVector(this.image.width / 2, this.image.height / 2);
    for (const piece of this.pieces) {
      const pieceCenter = piece.getTrueCenter();
      const offset = p5.Vector.sub(pieceCenter, puzzleCenter);
      const explosion = offset.copy().mult(explosionFactor);
      piece.translation = p5.Vector.add(piece.translation, explosion);
    }

    this.inputHandler.graphHandler.zoomHome();

    // Prevent false mismatch detection when puzzle is reset
    this.networkHandler.updateTargetImageId(this.imageData.id);

    await this.networkSerializer.saveInitialData();
    const puzzleData = this.serialize();
    await this.networkHandler.createRoom(puzzleData);
  }

  public get selectedPieces(): Piece[] {
    return this.pieces.filter((p) => p.isSelected);
  }

  public zoomIn() {
    this.inputHandler.graphHandler.zoomIn();
  }

  public zoomOut() {
    this.inputHandler.graphHandler.zoomOut();
  }

  public rotateLeft() {
    this.inputHandler.transformHandler.rotateLeft();
  }

  public rotateRight() {
    this.inputHandler.transformHandler.rotateRight();
  }

  public stackPieces() {
    this.inputHandler.transformHandler.stackPieces();
  }

  public explodePieces() {
    this.inputHandler.transformHandler.explodePieces();
  }

  public reconnectPieces() {
    this.pieceConnector.resetConnectionForSelectedPieces();
  }

  public deselectAll() {
    this.inputHandler.selectionHandler.deselectAllPieces();
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

    // Only sync cursor position if mouse is over the canvas
    if (isMouseOverCanvas(this.p)) {
      const worldPos = this.inputHandler.graphHandler.screenToWorld(this.p.mouseX, this.p.mouseY);
      this.networkHandler.syncCursorPosition(worldPos.x, worldPos.y);
    }

    this.networkHandler.updateCursors(this.p.deltaTime);

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

    this.drawRemoteCursors();
    this.drawPresenceIndicators();
    this.inputHandler.draw();
  }

  private drawPieces() {
    const sortedPieces = sortPieces(this.pieces);
    for (const piece of sortedPieces) {
      piece.draw();
    }
  }

  private drawRemoteCursors() {
    if (!this.settings.network.showCursors) return;

    const remoteCursors = this.networkHandler.getRemoteCursors();
    if (!remoteCursors.size) return;

    const now = Date.now();
    const scale = this.inputHandler.graphHandler.scale;
    const translation = this.inputHandler.graphHandler.translation;

    for (const [userId, cursor] of remoteCursors) {
      if (now - cursor.lastUpdate > CURSOR_INACTIVE_TIMEOUT_MS) {
        continue;
      }

      const color = this.networkHandler.getUserColor(userId);
      const screenX = (cursor.x + translation.x) * scale;
      const screenY = (cursor.y + translation.y) * scale;

      this.p.push();
      this.p.translate(screenX, screenY);
      this.p.strokeJoin(this.p.ROUND);

      this.p.fill(255);
      this.p.stroke(255);
      this.p.strokeWeight(3);
      this.p.beginShape();
      for (const [x, y] of Object.values(this.cursorVertices)) {
        this.p.vertex(x, y);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(color);
      this.p.stroke(0);
      this.p.strokeWeight(1.2);
      this.p.beginShape();
      for (const [x, y] of Object.values(this.cursorVertices)) {
        this.p.vertex(x, y);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.pop();
    }
  }

  private drawPresenceIndicators() {
    const presenceState = this.networkHandler.getPresenceState();
    const myColor = this.networkHandler.getMyColor();

    const startX = 20;
    const startY = 20;
    const size = 16;
    const spacing = 8;

    this.p.push();
    this.p.fill(myColor);
    this.p.stroke(255);
    this.p.strokeWeight(2);
    this.p.circle(startX, startY, size);
    this.p.pop();

    let index = 1;
    for (const [userId, presence] of presenceState) {
      this.p.push();
      this.p.fill(presence.color);
      this.p.stroke(255);
      this.p.strokeWeight(2);
      this.p.circle(startX + index * (size + spacing), startY, size);
      this.p.pop();
      index++;
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
          this.piecesFactory = new PiecesFactory(this.p, x, y, image, this.settings, puzzle.seed);
          this.pieces = this.piecesFactory.createAllPieces(true);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
