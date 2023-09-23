import p5 from 'p5';

export default class FPS {
  private count = 0;
  private fps = 60;

  constructor(private p: p5) {}

  public update() {
    if (this.count === 0) {
      this.fps = Math.round(this.p.frameRate());
    }

    this.count++;

    if (this.count > 40) {
      this.count = 0;
    }
  }

  public draw() {
    const { p } = this;
    p.push();
    p.textSize(20);
    p.textAlign(p.LEFT, p.TOP);
    p.text('FPS: ' + this.fps, p.width - 100, 8);
    p.pop();
  }
}
