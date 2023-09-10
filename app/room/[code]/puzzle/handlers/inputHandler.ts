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

  constructor(puzzle: IPuzzle) {
    this.graphHandler = new GraphHandler(puzzle);
    this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler);
    this.transformHandler = new TransformHandler(
      puzzle,
      this.graphHandler,
      this.selectionHandler,
    );
    const { createVector, mouseX, mouseY } = puzzle.canvas;
    this.prevMouse = createVector(mouseX, mouseY);
    this.prevTouches = [];
  }

  public update() {
    this.graphHandler.update(this.prevMouse, this.prevTouches);
    this.selectionHandler.update();
    this.transformHandler.update(this.prevMouse, this.prevTouches);
    this.setPreviousValues();
  }

  private setPreviousValues() {
    this.prevMouse = createVector(mouseX, mouseY);
    this.prevTouches = touches as Touches;
  }

  public draw() {
    this.selectionHandler.draw();
  }
}
