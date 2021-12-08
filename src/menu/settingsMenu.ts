class SettingsMenu {
    public div: p5.Element;
    private keyBindings: KeyBindings;
    private isOpen: boolean;

    constructor(menu: IMenu) {
        this.isOpen = false;
        this.div = createElement('div');
        this.div.addClass('menu-box');
        this.div.addClass('hidden');

        const title = createElement('h2');
        title.html('Inställningar');
        title.addClass('title');
        this.div.child(title);

        this.keyBindings = new KeyBindings(this.div);
        new CloseButton(this.div, menu);
    }

    public update() {
        if (this.isOpen) {
            this.keyBindings.update();
        }
    }

    public get showFPS() {
        return this.keyBindings.showFPS;
    }

    public open() {
        this.div.removeClass('hidden');
        this.isOpen = true;
    }
    
    public close() {
        this.div.addClass('hidden');
        this.isOpen = false;
    }
}