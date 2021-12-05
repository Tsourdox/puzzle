interface IMenu {
    setOpenMenu: (name: MenuName) => void;
    generatePuzzleFromImage: (image: p5.Image, size: p5.Vector) => void;
}

type MenuName = "game" | "settings" | "closed";

class Menu implements IMenu {
    private menuName: MenuName;
    private background: p5.Color;
    private foreground: p5.Color;
    private height: number;
    private puzzle: IGeneratePuzzle;
    private fps: FPS;
    private gameMenu: GameMenu;
    private settingsMenu: SettingsMenu;
    private prevMouseIsPressed: boolean;

    constructor(puzzle: IGeneratePuzzle) {
        this.puzzle = puzzle;
        this.background = color('rgba(10, 10, 10, 0.9)');
        this.foreground = color(200);
        this.height = 80;
        this.fps = new FPS();
        this.gameMenu = new GameMenu(this);
        this.settingsMenu = new SettingsMenu(this);
        this.menuName = 'closed';
        this.prevMouseIsPressed = false;
    }

    public get isOpen() {
        return this.menuName !== 'closed'
    }
    
    public generatePuzzleFromImage = (image: p5.Image, { x, y }: p5.Vector) => {
        this.puzzle.generateNewPuzzle(image, x, y);
        this.setOpenMenu('closed');
    }

    public setOpenMenu(name: MenuName) {
        if (this.menuName === name || name === 'closed') {
            this.gameMenu.close();
            this.settingsMenu.close();
            this.menuName = 'closed';
            return;
        }

        if (name === 'game') {
            this.gameMenu.open();
            this.settingsMenu.close();
        } else if (name === 'settings') {
            this.gameMenu.close();
            this.settingsMenu.open();
        }
        this.menuName = name;
    }

    public update() {
        this.fps.update();
        
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        const mouseOverGameIcon = mouseX < this.height;
        const mouseOverSettingsIcon = mouseX > width - this.height;
        
        if (didPress) {
            if (mouseOverGameIcon) {
                this.setOpenMenu('game');
            } else if (mouseOverSettingsIcon) {
                this.setOpenMenu('settings');
            } else {
                this.setOpenMenu('closed');
            }
        }

        if (mouseOverGameIcon || mouseOverSettingsIcon) {
            cursor('pointer');
        } else {
            cursor('auto');
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

    private drawContent() {
        push();
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