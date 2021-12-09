interface IGameMenu {
    useImage: (image: p5.Image) => void;
    readonly selectedSize: PuzzleSize;
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
        const title = createElement('h2');
        title.html('Börja ett nytt pussel');
        title.addClass('title');
        this.div.child(title);

        this.sizeToggle = new SizeToggle(this.div);
        new RandomButton(this.div, this);
        new FileButton(this.div, this);
    }
    
    public useImage(image: p5.Image) {
        const size = this.sizeToggle.selectedSizeAsVector;
        this.menu.generatePuzzleFromImage(image, size);
    }

    public get selectedSize() {
        return this.sizeToggle.selectedSize;
    }

    public open() {
        this.div.removeClass('hidden');
    }
    
    public close() {
        this.div.addClass('hidden');
    }
}