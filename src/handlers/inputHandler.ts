// todo: probably not a good idea with an abstract class..
class InputHandler {
    public selectionHandler: SelectionHandler;
    public transformHandler: TransformHandler;
    private graphHandler: GraphHandler;
    private scrollSensitivity: number;
    private prevMouse: p5.Vector;


    constructor(puzzle: IPuzzle & IGraph) {
        this.selectionHandler = new SelectionHandler(puzzle);
        this.transformHandler = new TransformHandler(puzzle, this.selectionHandler);
        this.graphHandler = new GraphHandler(puzzle);
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