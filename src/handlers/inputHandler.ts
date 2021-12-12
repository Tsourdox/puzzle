type Touches = Array<{ x: number, y: number }>

class InputHandler {
    public graphHandler: GraphHandler;
    public selectionHandler: SelectionHandler;
    public transformHandler: TransformHandler;
    private prevMouse: p5.Vector;
    private prevTouches: Touches;
    private isTouchDevice: boolean;
    private touchIndexActivatingRotation?: number;
    private rotateButtonY: number;

    constructor(puzzle: IPuzzle, settings: IReadableSettings) {
        this.graphHandler = new GraphHandler(puzzle, settings);
        this.selectionHandler = new SelectionHandler(puzzle, this.graphHandler, settings);
        this.transformHandler = new TransformHandler(puzzle, this.graphHandler, this.selectionHandler, settings);
        this.prevMouse = createVector(mouseX, mouseY);
        this.prevTouches = [];
        this.isTouchDevice = false;
        this.rotateButtonY = height * .7;
    }

    private get isTouchingRotateButton() {
        return this.touchIndexActivatingRotation !== undefined;
    }

    public update() {
        this.checkIfTouchingRotateButton();
        this.moveRotateButton();
        const isTouchInputDisabled = this.isTouchingRotateButton;
        this.graphHandler.update(this.prevMouse, this.prevTouches, isTouchInputDisabled);
        this.selectionHandler.update(isTouchInputDisabled);
        this.transformHandler.update(this.prevMouse, this.prevTouches, isTouchInputDisabled);
        
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
            this.drawTouchRotateButton();
        }
    }

    private moveRotateButton() {
        if (this.prevTouches.length && this.touchIndexActivatingRotation !== undefined) {
            const prevTouch = this.prevTouches[this.touchIndexActivatingRotation];
            if (prevTouch) {
                const currentY = (touches as Touches)[this.touchIndexActivatingRotation].y;
                const deltaY = currentY - prevTouch.y;
                this.rotateButtonY = max(height * .15, min(this.rotateButtonY + deltaY, height * .75));
            }
        }
    }

    private checkIfTouchingRotateButton() {
        const d = (height + width) * .05;
        const x = d * .7;
        const y = this.rotateButtonY;

        for (const touch of touches as Touches) {
            if (dist(x, y, touch.x, touch.y) < d) {
                this.touchIndexActivatingRotation = touches.indexOf(touch);
                return;
            }
        }
        delete this.touchIndexActivatingRotation;
    }

    private drawTouchRotateButton() {
        const d = (height + width) * .05;
        const x = d * .7;
        const y = this.rotateButtonY;
        
        push();
        strokeWeight(d * .1);
        stroke(this.isTouchingRotateButton ? theme.darkened : 'black');
        fill(this.isTouchingRotateButton ? theme.primary : theme.darkdrop);
        circle(x, y, d);
        pop();

        const size = d * .7;
        push();
        fill(theme.neutral);
        textFont(fonts.icons);
        textSize(size);
        text
        textAlign(CENTER, CENTER);
        translate(x, y - size * 0.25);
        
        push();
        rotate(PI * -.43);
        text(icon["Undo solid"], -size * 0.25, 0);
        pop();
        
        rotate(PI * .43);
        text(icon["Redo solid"], size * 0.25, 0);
        pop();

        if (this.isTouchingRotateButton) {
            push()
            textSize(size * 0.35);
            textAlign(LEFT, CENTER);
            strokeWeight(size * 0.1);
            stroke(theme.darkened);
            fill(theme.primary);
            text('Dra på skärmen för att rotera pusselbit', x * 2, y);
            pop();
        }
    }
}