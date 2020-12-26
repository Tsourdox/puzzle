class GraphHandler {
    private graph: IGraph;

    constructor(graph: IGraph) {
        this.graph = graph;
    }

    update(scrollSensitivity: number, prevMouse: p5.Vector) {
        if (mouseIsPressed && (mouseButton === CENTER || mouseButton === RIGHT)) {
            this.handleTranslation(prevMouse);
        } else {
            this.handleScaling(scrollSensitivity);
        }
    }

    private handleScaling(scrollSensitivity: number) {
        // Scale
        if (!keyIsDown(ALT) && scrollDelta !== 0) {
            const zoomFactor = 1 + scrollDelta * 0.002 * scrollSensitivity;
            const nextScale = constrain(this.graph.scale * zoomFactor, 0.01, 100);
            this.graph.scale = nextScale;
        }
        if (keyIsDown(KEY_HALF)) this.graph.scale = 0.5;
        if (keyIsDown(KEY_1)) this.graph.scale = 1;
        if (keyIsDown(KEY_2)) this.graph.scale = 2;
        if (keyIsDown(KEY_3)) this.graph.scale = 4;
    }

    private handleTranslation(prevMouse: p5.Vector) {
        // Translate
        const movedX = (mouseX - prevMouse.x) / this.graph.scale;
        const movedY = (mouseY - prevMouse.y) / this.graph.scale;
        this.graph.translation.add(movedX, movedY);
    }
}