class FileButton {
    private gameMenu: IGameMenu;
    private fileInput: p5.Element;
    private label: p5.Element;

    constructor(div: p5.Element, gameMenu: IGameMenu) {
        this.gameMenu = gameMenu;

        this.fileInput = createFileInput((file) => this.handleFileSelect(file));
        this.fileInput.addClass('hidden');
        this.fileInput.id('file');
        this.label = createElement('label');
        this.label.addClass('button');
        this.label.attribute('for', 'file');
        this.label.html('Välj egen bild');
        div.child(this.label);
    }

    private handleFileSelect(file: { type: string, data: string }) {
        if (file.type === 'image') {
            this.label.html('Skapar pussel ...');
            loadImage(file.data, (image) => {
                this.label.html('Välj egen bild');
                resizeImage(image);
                this.gameMenu.useImage(image);
            });
        }
    }
}