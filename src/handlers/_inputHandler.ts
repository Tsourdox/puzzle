abstract class InputHandler {
    protected prevMouseX: number;
    protected prevMouseY: number;
    protected scrollSensitivity: number;

    constructor() {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
        this.scrollSensitivity = 1;
    }
}