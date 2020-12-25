// todo: probably not a good idea with an abstract class..
abstract class InputHandler {
    protected prevMouseX: number;
    protected prevMouseY: number;
    protected scrollSensitivity: number;

    constructor() {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
        this.scrollSensitivity = 1;
    }

    protected setPreviousValues() {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }
}