interface IGraph {
    scale: number;
    translation: p5.Vector;
}
class GraphHandler implements IGraph, ISerializableGraph {
    private _isModified: boolean;
    private _scale: number;
    private _translation: p5.Vector;

    constructor() {
        this._isModified = false;
        this._scale = 1;
        this._translation = createVector(0, 0);
    }

    public get isModified() { return this._isModified; }
    public get scale() { return this._scale; }
    public get translation() { return this._translation.copy(); }

    private setScale(scale: number) {
        this._scale = scale;
        this._isModified = true;
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
            const nextScale = constrain(this.scale * zoomFactor, 0.01, 100);
            this.setScale(nextScale);
        }
        if (keyIsDown(KEY_HALF)) this.setScale(0.5);
        if (keyIsDown(KEY_1)) this.setScale(1);
        if (keyIsDown(KEY_2)) this.setScale(2);
        if (keyIsDown(KEY_3)) this.setScale(4);
    }

    private handleTranslation(prevMouse: p5.Vector) {
        // Translate
        const movedX = (mouseX - prevMouse.x) / this.scale;
        const movedY = (mouseY - prevMouse.y) / this.scale;
        this._translation.add(movedX, movedY);
        this._isModified = true;
    }

    public serialize(): GraphData {
        return {
            scale: this.scale,
            translation: toPoint(this.translation)
        };
    }

    public deserialize(graph: GraphData) {
        this._scale = graph.scale;
        this._translation = toVector(graph.translation);
    }
}