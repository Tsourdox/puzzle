interface IMenu {
    div: p5.Element;
    isOpen: boolean;
    openOrCloseMenu: () => void;
    onImageLoaded: (image: p5.Image) => void;
}

class Menu implements IMenu {
    public isOpen: boolean;
    public div: p5.Element;
    private background: p5.Color;
    private foreground: p5.Color;
    private height: number;
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

        this.div = createElement('div');
        this.div.addClass('menu-box');
        this.div.addClass('hidden');

        new RandomButton(this);
        new FileButton(this);
        new CloseButton(this);
    }
    
    public onImageLoaded = (image: p5.Image) => {
        this.puzzle.generateNewPuzzle(image, 4, 4);
        this.openOrCloseMenu()
    }

    public openOrCloseMenu() {
        this.isOpen = !this.isOpen;
        this.isOpen ? this.div.removeClass('hidden') : this.div.addClass('hidden');
    }

    public update() {
        this.fps.update();
        
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
        this.drawMenuBar();
        this.drawContent();
        this.drawRoomCode();
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
        const y = height - this.height / 1.65;
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