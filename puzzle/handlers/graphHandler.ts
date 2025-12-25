import p5 from 'p5';
import { IGraphData, ISerializableGraph } from '../network/types';
import { IPuzzle } from '../puzzle';
import { getMostDistantPoints, pointBetween, toPoint, toVector } from '../utils/general';
import { ISettingsMap, settings } from '../utils/settings';
import { Touches } from './inputHandler';

export interface IGraph {
  scale: number;
  translation: p5.Vector;
}

export default class GraphHandler implements IGraph, ISerializableGraph {
  private _isModified: boolean;
  private _scale: number;
  private _translation: p5.Vector;
  private settings: ISettingsMap;
  private puzzle: IPuzzle;
  private isGraphDisabled: number;

  constructor(puzzle: IPuzzle) {
    this.puzzle = puzzle;
    this.settings = settings;
    this._isModified = false;
    this._scale = 1;
    this._translation = puzzle.p.createVector(0, 0);
    this.isGraphDisabled = 0;
  }

  public get isModified() {
    return this._isModified;
  }
  public get scale() {
    return this._scale;
  }
  public get translation() {
    return this._translation.copy();
  }

  private setScale(scale: number, translation: p5.Vector) {
    this._scale = scale;
    this._translation = translation;
    this._isModified = true;
  }

  update(prevMouse: p5.Vector, prevTouches: Touches, scrollDelta: number) {
    const { p } = this.puzzle;
    this.handleTranslation(prevMouse, prevTouches);
    this.handleScaling(prevTouches, scrollDelta);

    // Prevent non-intended zoom when a piece connects from scrolling
    this.isGraphDisabled = p.max(0, this.isGraphDisabled - 1);
    if (this.puzzle.selectedPieces.length) {
      this.isGraphDisabled = 0.3 * p.frameRate();
    }
  }

  private handleScaling(prevTouches: Touches, scrollDelta: number) {
    const { p } = this.puzzle;
    let zoomDelta = 0;
    let zoomCenter = p.createVector(p.mouseX, p.mouseY);

    // Mouse
    if (!this.isGraphDisabled && scrollDelta !== 0) {
      zoomDelta = scrollDelta;
      zoomCenter = p.createVector(p.mouseX, p.mouseY);
    }
    // Touch
    if (prevTouches.length >= 2 && p.touches.length >= 2 && !this.isGraphDisabled) {
      const [t1, t2] = getMostDistantPoints(p, ...(p.touches as Touches));
      const [p1, p2] = getMostDistantPoints(p, ...prevTouches);
      const pinchDist = p.dist(t1.x, t1.y, t2.x, t2.y);
      const prevPinchDist = p.dist(p1.x, p1.y, p2.x, p2.y);
      zoomDelta = prevPinchDist - pinchDist;
      // Zoom toward the center point between the two touches
      zoomCenter = pointBetween(p, t1, t2);
    }

    // Apply zoom
    if (zoomDelta !== 0) {
      const invert = this.settings['invertera zoom'];
      const zoomFactor = 1 + zoomDelta * -0.002 * (invert ? -1 : 1);
      const nextScale = p.constrain(this.scale * zoomFactor, 0.01, 100);

      // Calculate world position under zoom center before zoom
      const worldX = (zoomCenter.x - this._translation.x * this.scale) / this.scale;
      const worldY = (zoomCenter.y - this._translation.y * this.scale) / this.scale;

      // Calculate new translation to keep the same world point under the zoom center
      const newTranslationX = (zoomCenter.x - worldX * nextScale) / nextScale;
      const newTranslationY = (zoomCenter.y - worldY * nextScale) / nextScale;

      this.setScale(nextScale, p.createVector(newTranslationX, newTranslationY));
    }
  }

  private getHomeTranslation(scale: number) {
    const { image, p } = this.puzzle;
    if (!image) return p.createVector(0, 0);
    const homeX = (p.width / scale - image.width) * 0.5;
    const homeY = (p.height / scale - image.height) * 0.5;
    return p.createVector(homeX, homeY);
  }

  public zoom(zoomFactor: number, zoomCenter: p5.Vector) {
    const { p } = this.puzzle;
    const nextScale = p.constrain(this.scale * zoomFactor, 0.01, 100);

    // Calculate world position under zoom center before zoom
    const worldX = (zoomCenter.x - this._translation.x * this.scale) / this.scale;
    const worldY = (zoomCenter.y - this._translation.y * this.scale) / this.scale;

    // Calculate new translation to keep the same world point under the zoom center
    const newTranslationX = (zoomCenter.x - worldX * nextScale) / nextScale;
    const newTranslationY = (zoomCenter.y - worldY * nextScale) / nextScale;

    this.setScale(nextScale, p.createVector(newTranslationX, newTranslationY));
  }

  public zoomHome() {
    const { image, p } = this.puzzle;
    const widthRatio = p.width / (image?.width || p.width);
    const heightRatio = p.height / (image?.height || p.height);
    const scale = p.min(widthRatio, heightRatio) * 0.5;
    this.setScale(scale, this.getHomeTranslation(scale));
  }

  public screenToWorld(screenX: number, screenY: number): p5.Vector {
    // Convert screen coordinates to world coordinates (accounting for pan/zoom)
    const worldX = (screenX - this._translation.x * this.scale) / this.scale;
    const worldY = (screenY - this._translation.y * this.scale) / this.scale;
    return this.puzzle.p.createVector(worldX, worldY);
  }

  private handleTranslation(prevMouse: p5.Vector, prevTouches: Touches) {
    const { p } = this.puzzle;
    // Touch
    if (prevTouches.length >= 2 && p.touches.length >= 2 && !this.isGraphDisabled) {
      const [t1, t2] = p.touches as Touches;
      const [p1, p2] = prevTouches;
      const currentMid = pointBetween(p, t1, t2);
      const prevMid = pointBetween(p, p1, p2);
      const movedX = (currentMid.x - prevMid.x) / this.scale;
      const movedY = (currentMid.y - prevMid.y) / this.scale;
      this._translation.add(movedX, movedY);
      this._isModified = true;
    }
    // Mouse
    if (p.mouseIsPressed && (p.mouseButton === p.CENTER || p.mouseButton === p.RIGHT)) {
      const movedX = (p.mouseX - prevMouse.x) / this.scale;
      const movedY = (p.mouseY - prevMouse.y) / this.scale;
      this._translation.add(movedX, movedY);
      this._isModified = true;
    }
  }

  public serialize(): IGraphData {
    return {
      scale: this.scale,
      translation: toPoint(this.translation),
    };
  }

  public async deserialize(graph: IGraphData) {
    this._scale = graph.scale;
    this._translation = toVector(graph.translation);
  }
}
