class CloseButton {
    private menu: IMenu;
    private closeButton: p5.Element;

    constructor(menu: IMenu) {
        this.menu = menu;
        this.closeButton = createElement('label');
        this.closeButton.addClass('button');
        this.closeButton.html('Stäng Menyn');
        this.closeButton.mousePressed(() => this.menu.openOrCloseMenu());
        this.menu.div.child(this.closeButton);
    }
}