import p5 from 'p5';
import { IPuzzle } from '../puzzle';
import GraphHandler from './graphHandler';
import SelectionHandler from './selectionHandler';
import TransformHandler from './transformationHandler';

export type Touches = Array<{ x: number; y: number }>;

export default class InputHandler {
  public graphHandler: GraphHandler;
  public selectionHandler: SelectionHandler;
  public transformHandler: TransformHandler;
  private prevMouse: p5.Vector;
  private prevTouches: Touches;
  private puzzle: IPuzzle;

  constructor(puzzle: IPuzzle) {
    this.puzzle = puzzle;
    this.graphHandler = new GraphHandler(puzzle);
    this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler);
    this.transformHandler = new TransformHandler(
      puzzle,
      this.graphHandler,
      this.selectionHandler,
    );
    const { createVector, mouseX, mouseY } = puzzle.p;
    this.prevMouse = createVector(mouseX, mouseY);
    this.prevTouches = [];
  }

  public update(scrollDelta: number) {
    this.graphHandler.update(this.prevMouse, this.prevTouches, scrollDelta);
    this.selectionHandler.update();
    this.transformHandler.update(this.prevMouse, this.prevTouches, scrollDelta);
    this.setPreviousValues();
  }

  private setPreviousValues() {
    const { p } = this.puzzle;
    this.prevMouse = p.createVector(p.mouseX, p.mouseY);
    this.prevTouches = p.touches as Touches;
  }

  public draw() {
    this.selectionHandler.draw();
  }
}
