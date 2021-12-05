interface IGameMenu {
    useImage: (image: p5.Image) => void;
}

type PuzzleSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

class GameMenu implements IGameMenu {
    private menu: IMenu;
    private div: p5.Element;
    private sizeToggle: SizeToggle;

    constructor(menu: IMenu) {
        this.menu = menu;
        this.div = createElement('div');
        this.div.addClass('menu-box');
        this.div.addClass('hidden');

        this.sizeToggle = new SizeToggle(this.div);
        new RandomButton(this.div, this);
        new FileButton(this.div, this);
        new CloseButton(this.div, menu);
    }
    
    public useImage(image: p5.Image) {
        this.menu.generatePuzzleFromImage(image, this.sizeToggle.selectedSize);
    }

    public open() {
        this.div.removeClass('hidden');
    }
    
    public close() {
        this.div.addClass('hidden');
    }
}