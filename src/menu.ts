class Menu {
    public isOpen: boolean;
    private background: p5.Color;
    private foreground: p5.Color;
    private height: number;
    private input: p5.Element;
    private label: p5.Element;
    private closeButton: p5.Element;
    private puzzle: IGeneratePuzzle;
    private fps: FPS;
    private prevMouseIsPressed: boolean;

    constructor(puzzle: IGeneratePuzzle) {
        this.puzzle = puzzle;
        this.background = color('rgba(10, 10, 10, 0.9)');
        this.foreground = color(200);
        this.height = 80;
        this.fps = new FPS();
        this.isOpen = false;
        this.prevMouseIsPressed = false;

        this.input = createFileInput((file) => this.handleFileSelect(file));
        this.input.addClass('file-input');
        this.input.id('file');
        this.label = createElement('label');
        this.label.addClass('button');
        this.label.attribute('for', 'file');
        this.label.position(width / 2, height / 2 - 50);
        this.label.html('Nytt Pussel');
        this.label.hide();

        this.closeButton = createElement('label');
        this.closeButton.addClass('button');
        this.closeButton.position(width / 2, height / 2 + 50);
        this.closeButton.html('Stäng Menyn');
        this.closeButton.mousePressed(() => this.openOrCloseMenu());
        this.closeButton.hide();
    }

    private handleFileSelect(file: { type: string, data: string }) {
        if (file.type === 'image') {
            this.label.html('LOADING...');
            loadImage(file.data, (image) => {
                this.puzzle.generateNewPuzzle(image, 8, 8);
                this.label.html('Nytt Pussel');
                this.openOrCloseMenu()
            });
        }
    }

    private openOrCloseMenu() {
        this.isOpen = !this.isOpen;
        this.isOpen ? this.label.show() : this.label.hide();
        this.isOpen ? this.closeButton.show() : this.closeButton.hide();
    }

    public update() {
        this.fps.update();
        this.label.position(width / 2, height / 2 - 50);
        this.closeButton.position(width / 2, height / 2 + 50);
        
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        const mouseOverMenu = mouseY > height - this.height;
        
        if (didPress && mouseOverMenu) {
            this.openOrCloseMenu();
        }
        
        this.prevMouseIsPressed = mouseIsPressed;
    }

    public draw() {
        push();
        fill(this.foreground);
        textAlign(CENTER, CENTER);
        
        this.fps.draw();
        this.drawRoomCode();
        this.drawMenuBar();
        this.drawContent();
        pop();
    }

    private drawMenuBar() {
        push();
        fill(this.background);
        const y = this.isOpen ? 0 : height - this.height;
        const menuHeight = this.isOpen ? height : this.height;
        rect(0, y, width, menuHeight);
        pop();
    }

    private drawContent() {push();
        const size = 50;
        const offset = size / 20;
        const halfMenu = (this.height / 2) + offset;
        textFont(fonts.icons);
        textSize(50);
        text(icon["Puzzle Piece solid"], halfMenu, height - halfMenu);
        text(icon["cog solid"], width - halfMenu, height - halfMenu);
        pop();
        
        push();
        const x = width / 2;
        const y = height - this.height / 1.7;
        textSize(60);
        text("PUZZELIN", x, y);
        pop();
    }

    private drawRoomCode() {
        push();
        textSize(20);
        textAlign(LEFT, TOP);
        text("ROOM: XY7G", 10, 6);
        pop();
    }
}

// tiny: 20
// small: 80
// medium: 300
// large: 900
// huge: 1500