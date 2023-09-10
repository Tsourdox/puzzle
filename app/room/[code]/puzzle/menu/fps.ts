export default class FPS {
  private count = 0;
  private fps = 60;

  public update() {
    if (this.count === 0) {
      this.fps = Math.round(frameRate());
    }

    this.count++;

    if (this.count > 40) {
      this.count = 0;
    }
  }

  public draw() {
    push();
    textSize(20);
    textAlign(LEFT, TOP);
    text('FPS: ' + this.fps, width - 100, 8);
    pop();
  }
}
