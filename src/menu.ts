class Menu {
    private background: p5.Color;
    private foreground: p5.Color;
    private height: number;

    constructor() {
        this.background = color('rgba(10, 10, 10, 0.9)');
        this.foreground = color(200);
        this.height = 100;
    }

    draw() {
        this.drawMenuBar();
        this.drawContent();
    }

    drawMenuBar() {
        push();
        fill(this.background);
        rect(0, height - this.height, width, this.height);
        pop();
    }

    drawContent() {
        const size = 50;
        const offset = size / 20;
        const halfMenu = (this.height / 2) + offset;
        
        push();
        textAlign(CENTER, CENTER);
        fill(this.foreground);
        textFont(fonts.icons);
        textSize(50);
        
        text(icon["Play Circle regular"], halfMenu, height - halfMenu);
        text(icon["Puzzle Piece solid"], width - halfMenu, height - halfMenu);
        pop();
    }
}