class FPS {
    private count = 0;
    private fps = "";

    draw() {
        this.count++;

        if (this.count === 30) {
            this.count = 0;
            this.fps = frameRate().toFixed(0);
        }
        
        push();
        fill(255);
        stroke(0);
        text("FPS: " + this.fps, width - 50, 20);
        pop();
    }
}