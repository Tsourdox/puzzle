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
        this.label.html('Eget Pussel');
        div.child(this.label);
    }

    private handleFileSelect(file: { type: string, data: string }) {
        if (file.type === 'image') {
            this.label.html('Laddar ...');
            loadImage(file.data, (file) => {
                this.label.html('Nytt Pussel');
                this.gameMenu.useImage(file);
            });
        }
    }
}