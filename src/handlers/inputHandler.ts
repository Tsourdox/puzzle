type Touches = Array<{ x: number, y: number }>

class InputHandler {
    public graphHandler: GraphHandler;
    public selectionHandler: SelectionHandler;
    public transformHandler: TransformHandler;
    private prevMouse: p5.Vector;
    private prevTouches: Touches;

    constructor(puzzle: IPuzzle, settings: IReadableSettings) {
        this.graphHandler = new GraphHandler(puzzle, settings);
        this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler, settings);
        this.transformHandler = new TransformHandler(puzzle, this.graphHandler, this.selectionHandler, settings);
        this.prevMouse = createVector(mouseX, mouseY);
        this.prevTouches = [];
    }

    public update() {
        this.graphHandler.update(this.prevMouse, this.prevTouches);
        this.selectionHandler.update();
        this.transformHandler.update(this.prevMouse);
        
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