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
        this.transformHandler.update(this.prevMouse, this.prevTouches);
        this.setPreviousValues();
    }

    private setPreviousValues() {
        this.prevMouse = createVector(mouseX, mouseY);
        this.prevTouches = touches as Touches;
    }

    public draw(hideInstructions: boolean) {
        this.selectionHandler.draw();
        this.drawInstructions(hideInstructions);
        this.drawButtons(hideInstructions);
    }

    private drawInstructions(hideInstruction: boolean) {
        if (hideInstruction) return;
        
        const size = min((height + width) * .01, 40);
        const y = (height - 80) - size * 1.1;

        push()
        textSize(size);
        fill(theme.neutral);
        textAlign(LEFT, CENTER);
        text('Nytt pussel', width * .01, y);
        textAlign(RIGHT, CENTER);
        text('Inställningar', width * .99, y);
        pop();
    }

    private drawButtons(hideInstructions: boolean) {
        this.drawButton(height * .08, icon["home solid"], 'Zooma hem', hideInstructions);
    }
    
    private drawButton(y: number, icon: string, instruction: string, hideInstructions: boolean) {
        const d = (height + width) * .02;
        const x = d * .7;
        
        push();
        noStroke();
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
        
    
        if (mouseIsPressed && dist(x, y, mouseX, mouseY) < d * .5) {
            this.graphHandler.zoomHome();
        }

        if (hideInstructions) return;
        
        push()
        textSize(size * 0.7);
        textAlign(LEFT, CENTER);
        fill(theme.neutral);
        text(instruction, x * 2, y - size * 0.1);
        pop();
    }
}