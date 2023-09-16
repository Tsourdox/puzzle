import p5 from 'p5';
import { globals } from '../../app/room/[...slug]/utils/globals';
import { IGraphData, ISerializableGraph } from '../network/types';
import { IPuzzle } from '../puzzle';
import {
  getMostDistantPoints,
  pointBetween,
  toPoint,
  toVector,
} from '../utils/general';
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
  private isZoomDisabled: number;

  constructor(puzzle: IPuzzle) {
    this.puzzle = puzzle;
    this.settings = settings;
    this._isModified = false;
    this._scale = 1;
    this._translation = puzzle.p.createVector(0, 0);
    this.isZoomDisabled = 0;
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

  update(prevMouse: p5.Vector, prevTouches: Touches) {
    const { p } = this.puzzle;
    this.handleTranslation(prevMouse, prevTouches);
    this.handleScaling(prevTouches);

    // Prevent non-intended zoom when a piece connects from scrolling
    this.isZoomDisabled = p.max(0, this.isZoomDisabled - 1);
    if (this.puzzle.selectedPieces.length) {
      this.isZoomDisabled = 0.3 * p.frameRate();
    }
  }

  private handleScaling(prevTouches: Touches) {
    const { p } = this.puzzle;
    let zoomDelta = 0;
    // Mouse
    if (!this.isZoomDisabled && globals.scrollDelta !== 0) {
      zoomDelta = globals.scrollDelta;
    }
    // Touch
    if (prevTouches.length === 3 && touches.length === 3) {
      const [t1, t2] = getMostDistantPoints(...(touches as Touches));
      const [p1, p2] = getMostDistantPoints(...prevTouches);
      const pinchDist = p.dist(t1.x, t1.y, t2.x, t2.y);
      const prevPinchDist = p.dist(p1.x, p1.y, p2.x, p2.y);
      zoomDelta = prevPinchDist - pinchDist;
    }

    // Apply zoom
    if (zoomDelta !== 0) {
      const invert = this.settings['invertera zoom'];
      const zoomFactor = 1 + zoomDelta * -0.002 * (invert ? -1 : 1);
      const nextScale = p.constrain(this.scale * zoomFactor, 0.01, 100);
      const currentHomeTranslation = this.getHomeTranslation(this.scale);
      const translationDiff = currentHomeTranslation.sub(this.translation);
      const nextHomeTranslation = this.getHomeTranslation(nextScale);
      nextHomeTranslation.sub(translationDiff);
      this.setScale(nextScale, nextHomeTranslation);
    }
  }

  private getHomeTranslation(scale: number) {
    const { image, p } = this.puzzle;
    if (!image) return p.createVector(0, 0);
    const homeX = (p.width / scale - image.width) * 0.5;
    const homeY = (p.height / scale - image.height) * 0.5;
    return p.createVector(homeX, homeY);
  }

  public zoomHome() {
    const { image, p } = this.puzzle;
    const widthRatio = p.width / (image?.width || p.width);
    const heightRatio = p.height / (image?.height || p.height);
    const scale = p.min(widthRatio, heightRatio) * 0.7;
    this.setScale(scale, this.getHomeTranslation(scale));
  }

  private handleTranslation(prevMouse: p5.Vector, prevTouches: Touches) {
    const { p } = this.puzzle;
    // Touch
    if (prevTouches.length === 3 && touches.length === 3) {
      const [t1, t2] = touches as Touches;
      const [p1, p2] = prevTouches;
      const currentMid = pointBetween(t1, t2);
      const prevMid = pointBetween(p1, p2);
      const movedX = (currentMid.x - prevMid.x) / this.scale;
      const movedY = (currentMid.y - prevMid.y) / this.scale;
      this._translation.add(movedX, movedY);
      this._isModified = true;
    }
    // Mouse
    if (
      p.mouseIsPressed &&
      (p.mouseButton === p.CENTER || p.mouseButton === p.RIGHT)
    ) {
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
