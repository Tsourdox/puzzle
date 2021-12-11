interface IGraph {
    scale: number;
    translation: p5.Vector;
}

class GraphHandler implements IGraph, ISerializableGraph {
    private _isModified: boolean;
    private _scale: number;
    private _translation: p5.Vector;
    private settings: IReadableSettings;
    private puzzle: IPuzzle;
    private isZoomDisabled: number;

    constructor(puzzle: IPuzzle, settings: IReadableSettings) {
        this.puzzle = puzzle;
        this.settings = settings;
        this._isModified = false;
        this._scale = 1;
        this._translation = createVector(0, 0);
        this.isZoomDisabled = 0;
    }

    public get isModified() { return this._isModified; }
    public get scale() { return this._scale; }
    public get translation() { return this._translation.copy(); }

    private setScale(scale: number, translation: p5.Vector) {
        this._scale = scale;
        this._translation = translation;
        this._isModified = true;
    }

    update(prevMouse: p5.Vector, prevTouches: Touches) {
        this.handleTranslation(prevMouse, prevTouches);
        this.handleScaling(prevTouches);

        if (keyIsDown(this.settings.getValue('zooma hem'))) {
            this.zoomHome();
        }

        // Prevent non-intended zoom when a piece connects from scrolling
        this.isZoomDisabled = max(0, this.isZoomDisabled - 1);
        if (this.puzzle.selectedPieces.length) {
            this.isZoomDisabled = 0.3 * frameRate()
        }
    }

    private handleScaling(prevTouches: Touches) {
        let zoomDelta = 0;        
        // Mouse
        if (!this.isZoomDisabled && scrollDelta !== 0) {
            zoomDelta = scrollDelta;
        }
        // Touch
        if (prevTouches.length === 2 && touches.length === 2) {
            const [t1, t2] = touches as Touches;
            const pinchDist = dist(t1.x, t1.y, t2.x, t2.y);
            const [p1, p2] = prevTouches;
            const prevPinchDist = dist(p1.x, p1.y, p2.x, p2.y);
            zoomDelta = prevPinchDist - pinchDist;
        }
        
        // Apply zoom
        if (zoomDelta !== 0) {
            const invert = this.settings.getValue('invertera zoom');
            const zoomFactor = 1 + zoomDelta * -0.002 * (invert ? -1 : 1);
            const nextScale = constrain(this.scale * zoomFactor, 0.01, 100);
            const currentHomeTranslation = this.getHomeTranslation(this.scale);
            const translationDiff = currentHomeTranslation.sub(this.translation);
            const nextHomeTranslation = this.getHomeTranslation(nextScale);
            nextHomeTranslation.sub(translationDiff);
            this.setScale(nextScale, nextHomeTranslation);
        }
    }

    private getHomeTranslation(scale: number) {
        if (!this.puzzle.image) return createVector(0, 0);
        const homeX = (width / scale - this.puzzle.image.width) * .5;
        const homeY = ((height - 80) / scale - this.puzzle.image.height) * .5;
        return createVector(homeX, homeY);
    }

    public zoomHome() {
        this.setScale(1, this.getHomeTranslation(1));
    }

    private handleTranslation(prevMouse: p5.Vector, prevTouches: Touches) {
        // Touch
        if (prevTouches.length === 2 && touches.length === 2) {
            const [t1, t2] = touches as Touches;
            const [p1, p2] = prevTouches;
            const currentMid = pointBetween(t1, t2);
            const prevMid = pointBetween(p1, p2);
            const movedX = (currentMid.x - prevMid.x) / this.scale;
            const movedY = (currentMid.y - prevMid.y) / this.scale;
            this._translation.add(movedX, movedY);
            this._isModified = true;
        }
        // Mouse
        if (mouseIsPressed && (mouseButton === CENTER || mouseButton === RIGHT)) {
            const movedX = (mouseX - prevMouse.x) / this.scale;
            const movedY = (mouseY - prevMouse.y) / this.scale;
            this._translation.add(movedX, movedY);
            this._isModified = true;
        }
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