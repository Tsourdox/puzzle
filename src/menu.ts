class Menu {
    private background: p5.Color;
    private foreground: p5.Color;
    private height: number;
    private input: p5.Element;
    private puzzle: IGeneratePuzzle;

    constructor(puzzle: IGeneratePuzzle) {
        this.puzzle = puzzle;
        this.background = color('rgba(10, 10, 10, 0.9)');
        this.foreground = color(200);
        this.height = 100;

        this.input = createFileInput((file) => this.handleFileSelect(file));
        this.input.position(width / 2, height - this.height / 2);
        this.input.addClass('file-input');
    }

    private handleFileSelect(file: any) {
        if (file.type === 'image') {
            loadImage(file.data, (image) => {
                this.puzzle.generateNewPuzzle(image, 5, 5)
            });
        }
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
        
        text(icon["cogs solid"], halfMenu, height - halfMenu);
        text(icon["Puzzle Piece solid"], width - halfMenu, height - halfMenu);
        pop();
    }

    drawInput() {

    }
}