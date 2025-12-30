import p5 from 'p5';
import type { ISelectionHandler } from './handlers/selectionHandler';
import type { ITransformHandler } from './handlers/transformationHandler';
import type NetworkHandler from './network/networkHandler';
import Piece, { Side } from './piece';
import type { IPuzzle } from './puzzle';
import { ISettings } from './settings';
import { getAdjacentPiece, getConnectedPieces } from './utils/pieces';

export default class PieceConnector {
  private puzzle: IPuzzle;
  private selectionHandler: ISelectionHandler;
  private transformHandler: ITransformHandler;
  private networkHandler: NetworkHandler;
  private settings: ISettings;

  constructor(
    puzzle: IPuzzle,
    selectionHandler: ISelectionHandler,
    transformHandler: ITransformHandler,
    networkHandler: NetworkHandler,
    settings: ISettings,
  ) {
    this.puzzle = puzzle;
    this.selectionHandler = selectionHandler;
    this.transformHandler = transformHandler;
    this.networkHandler = networkHandler;
    this.settings = settings;
  }

  public update() {
    const { p } = this.puzzle;
    if (p.keyIsPressed && p.keyCode === this.settings.keybindings.reconnectPieces) {
      this.resetConnectionForSelectedPieces();
    }
    this.checkForConnectedPieces();
  }

  /** Sometimes pieces connects incorrectly, this resets the connections */
  public resetConnectionForSelectedPieces() {
    for (const piece of this.puzzle.selectedPieces) {
      piece.connectedSides = [];
    }
  }

  private checkForConnectedPieces() {
    for (const piece of this.puzzle.selectedPieces) {
      this.checkPieceConnection(piece as Piece, true);
    }
  }

  private checkPieceConnection(piece: Piece, playSound: boolean) {
    const baseLimit = this.puzzle.pieceSize.mag() / 5;
    const limit = baseLimit * this.settings.puzzle.snapTolerance;
    const length = this.puzzle.pieces.length;
    const { x } = this.puzzle.pieceCount;
    let wasConnected = false;

    // Check each side [top, right, bottom, left]
    for (let side = 0; side < 4; side++) {
      // Dont check connected pieces
      if (piece.connectedSides.includes(side)) continue;

      // Dont check outside of puzzle
      const i = this.puzzle.pieces.indexOf(piece);
      if (side === Side.Top && i < x) continue;
      if (side === Side.Right && i % x === x - 1) continue;
      if (side === Side.Bottom && length - i <= x) continue;
      if (side === Side.Left && (length - i) % x === 0) continue;

      // Find adjacentPiece
      const adjacentPiece = getAdjacentPiece(piece, side, this.puzzle);

      // Find matching edges
      const pieceCorners = piece.getTrueCorners();
      const adjacentCorners = adjacentPiece.getTrueCorners();
      const pcA = pieceCorners[side];
      const acA = adjacentCorners[(side + 3) % 4];
      const pcB = pieceCorners[(side + 1) % 4];
      const acB = adjacentCorners[(side + 2) % 4];

      // Check distance between matching edges
      const distA = pcA.dist(acA);
      const distB = pcB.dist(acB);
      if (distA + distB < limit) {
        this.connectPiece(piece, adjacentPiece, side, playSound && !wasConnected);
        wasConnected = true;
      }
    }

    // Check all connected pieces
    if (wasConnected && piece.isSelected) {
      const connectedPieces = getConnectedPieces(piece, this.puzzle);
      connectedPieces.forEach((p) => this.checkPieceConnection(p, false));
      this.selectionHandler.select(piece, false);
    }
  }

  private connectPiece(piece: Piece, adjacentPiece: Piece, side: Side, playSound: boolean) {
    // First matching side found
    if (piece.isSelected) {
      // Play click sound
      if (playSound) {
        // const index = p.floor(p.random(0, globals.sounds?.snaps?.length || 0));
        // globals.sounds?.snaps[index]?.play();
      }

      // Rotate and translate selected piece|s
      const deltaRotation = adjacentPiece.rotation - piece.rotation;
      this.transformHandler.rotatePiece(piece, deltaRotation);

      const acA = adjacentPiece.getTrueCorners()[(side + 3) % 4];
      const ucA = piece.getTrueCorners()[side];
      const deltaTranslation = p5.Vector.sub(acA, ucA);
      this.transformHandler.translatePiece(piece, deltaTranslation);
    }

    // Add to connected side list
    const oppositeSide = (side + 2) % 4;
    adjacentPiece.connectedSides = [...adjacentPiece.connectedSides, oppositeSide];
    piece.connectedSides = [...piece.connectedSides, side];

    // CRITICAL: Mark all pieces in BOTH islands as modified
    // When pieces connect, both the moving island AND the stationary island need to be synced
    // to ensure all players see the correct final positions
    const movingIsland = getConnectedPieces(piece, this.puzzle);
    const adjacentIsland = getConnectedPieces(adjacentPiece, this.puzzle);

    for (const islandPiece of movingIsland) {
      islandPiece.isModified = true;
    }
    for (const islandPiece of adjacentIsland) {
      islandPiece.isModified = true;
    }

    // Broadcast connection to force all players to deselect these pieces
    // Connection takes precedence over any active dragging
    const allConnectedPieceIds = [...movingIsland, ...adjacentIsland].map((p) => p.id);
    this.networkHandler.broadcastConnection(allConnectedPieceIds);

    // Force immediate sync after connection to prevent stale positions on other clients
    this.networkHandler.syncPieces(this.puzzle.pieces as Piece[], true);
  }
}
