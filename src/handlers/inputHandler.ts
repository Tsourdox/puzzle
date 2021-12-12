type Touches = Array<{ x: number, y: number }>

class InputHandler {
    public graphHandler: GraphHandler;
    public selectionHandler: SelectionHandler;
    public transformHandler: TransformHandler;
    private prevMouse: p5.Vector;
    private prevTouches: Touches;
    private isTouchDevice: boolean;

    constructor(puzzle: IPuzzle, settings: IReadableSettings) {
        this.graphHandler = new GraphHandler(puzzle, settings);
        this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler, settings);
        this.transformHandler = new TransformHandler(puzzle, this.graphHandler, this.selectionHandler, settings);
        this.prevMouse = createVector(mouseX, mouseY);
        this.prevTouches = [];
        this.isTouchDevice = false;
    }

    public update() {
        this.checkZoomHomeButton();
        this.graphHandler.update(this.prevMouse, this.prevTouches);
        this.selectionHandler.update();
        this.transformHandler.update(this.prevMouse, this.prevTouches);
        
        if (!this.isTouchDevice && touches.length) {
            this.isTouchDevice = true;
        }
        
        this.setPreviousValues();
    }

    private setPreviousValues() {
        this.prevMouse = createVector(mouseX, mouseY);
        this.prevTouches = touches as Touches;
    }

    public draw() {
        this.selectionHandler.draw();
        if (this.isTouchDevice) {
            this.drawTouchButtons();
        }
    }

    private checkZoomHomeButton() {
        const d = (height + width) * .05;
        const x = d * .7;
        const y = height * .1;

        if (dist(x, y, mouseX, mouseY) < d) {
            this.graphHandler.zoomHome();
        }
    }

    private drawTouchButtons() {
        this.drawButton(height * .1, icon["home solid"]);
    }
    
    private drawButton(y: number, icon: string) {
        const d = (height + width) * .03;
        const x = d * .7;
        
        push();
        strokeWeight(d * .1);
        stroke('black');
        fill(theme.darkdrop);
        circle(x, y, d);
        pop();

        const size = d * .7;
        push();
        fill(theme.neutral);
        textFont(fonts.icons);
        textSize(size);
        textAlign(CENTER, CENTER);
        text(icon, x, y - d * .06);
        pop();
    }
}