class GraphHandler extends InputHandler {
    private graph: IPuzzle;

    constructor(graph: IPuzzle) {
        super();
        this.graph = graph;
    }

    update() {
        this.handleGraphScaleAndTranslation();
        this.setPreviousValues();
    }

    private setPreviousValues() {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }

    private handleGraphScaleAndTranslation() {
        if (mouseIsPressed && (mouseButton === CENTER || mouseButton === RIGHT)) {
            // Translate
            const movedX = (mouseX - this.prevMouseX) / this.graph.scale;
            const movedY = (mouseY - this.prevMouseY) / this.graph.scale;
            this.graph.translation.add(movedX, movedY);
        } else {
            // Scale
            if (!keyIsDown(ALT) && scrollDelta !== 0) {
                const zoomFactor = 1 + scrollDelta * 0.002 * this.scrollSensitivity;
                const nextScale = constrain(this.graph.scale * zoomFactor, 0.01, 100);
                this.graph.scale = nextScale;
            }
            if (keyIsDown(KEY_HALF)) this.graph.scale = 0.5;
            if (keyIsDown(KEY_1)) this.graph.scale = 1;
            if (keyIsDown(KEY_2)) this.graph.scale = 2;
            if (keyIsDown(KEY_3)) this.graph.scale = 4;
        }
    }
}