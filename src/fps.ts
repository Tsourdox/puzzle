class FPS {
    private count = 0;
    private fps = 60;

    public update() {
        if (this.count === 0) {
            this.fps = Math.round(frameRate());
        }
        
        this.count++;

        if (this.count > 20) {
            this.count = 0;
        }
    }

    public draw() {
        push();
        fill(255);
        stroke(0);
        textSize(20);
        textAlign(LEFT, TOP);
        text("FPS: " + this.fps, width - 94, 8);
        pop();
    }
}