import { IPuzzle } from '../puzzle';
import GraphHandler from './graphHandler';

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

  public draw(hideInstructions: boolean) {
    this.selectionHandler.draw();
    if (hideInstructions) return;
    this.drawInstructions();
  }

  private drawInstructions() {
    const size = min((height + width) * 0.012, 40);
    const y = height / 2;
    const x = width / 2;

    push();
    fill(theme.neutral);
    textAlign(CENTER, CENTER);

    textSize(size * 1.6);
    text('FÖR ENHETER MED TOUCH', x, y - y * 0.4);
    textSize(size);
    text('1 FINGER - MARKERA OCH FLYTTA BITAR', x, y - y * 0.1);
    text('2 FINGRAR - ROTERA MARKERADE BITAR', x, y);
    text('3 FINGRAR - ZOOMA OCH PANORERA VYN', x, y + y * 0.1);
    pop();
  }
}
