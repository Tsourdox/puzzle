// todo: probably not a good idea with an abstract class..
class InputHandler {
    public graphHandler: GraphHandler;
    public selectionHandler: SelectionHandler;
    public transformHandler: TransformHandler;
    private scrollSensitivity: number;
    private prevMouse: p5.Vector;


    constructor(puzzle: IPuzzle) {
        this.graphHandler = new GraphHandler();
        this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler);
        this.transformHandler = new TransformHandler(puzzle, this.graphHandler, this.selectionHandler);
        this.scrollSensitivity = 1;
        this.prevMouse = createVector(mouseX, mouseY);
    }

    public update() {
        this.graphHandler.update(this.scrollSensitivity, this.prevMouse);
        this.selectionHandler.update();
        this.transformHandler.update(this.scrollSensitivity, this.prevMouse);
        
        this.setPreviousValues();
    }

    private setPreviousValues() {
        this.prevMouse = createVector(mouseX, mouseY);
    }

    public draw() {
        this.selectionHandler.draw();
    }
}