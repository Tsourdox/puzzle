class FileButton {
    private menu: IMenu;
    private fileInput: p5.Element;
    private label: p5.Element;

    constructor(menu: IMenu) {
        this.menu = menu;

        this.fileInput = createFileInput((file) => this.handleFileSelect(file));
        this.fileInput.addClass('hidden');
        this.fileInput.id('file');
        this.label = createElement('label');
        this.label.addClass('button');
        this.label.attribute('for', 'file');
        this.label.html('Eget Pussel');
        this.menu.div.child(this.label);
    }

    private handleFileSelect(file: { type: string, data: string }) {
        if (file.type === 'image') {
            this.label.html('Laddar ...');
            loadImage(file.data, (file) => {
                this.label.html('Nytt Pussel');
                this.menu.onImageLoaded(file);
            });
        }
    }
}