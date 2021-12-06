class RandomButton {
    private readonly API_KEY: string
    private gameMenu: IGameMenu;
    private button: p5.Element;
    private isLoading: boolean;

    constructor(div: p5.Element, gameMenu: IGameMenu) {
        this.gameMenu = gameMenu;
        this.isLoading = false;
        // todo: how do we hide the key?
        this.API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';

        this.button = createElement('label');
        this.button.addClass('button');
        this.button.html('Slumpa bild');
        this.button.mouseReleased(() => this.fetchPhotos());
        div.child(this.button);
    }

    private get url() {
        const page = floor(random(1, 1000));
        const domain = 'https://api.pexels.com/';
        const path = 'v1/search'
        const query = `?query=multiple+colors&orientation=landscape&per_page=1&page=${page}`;
        return `${domain}${path}${query}`
    }

    private async fetchPhotos() {
        if (this.isLoading) return;
        try {
            this.isLoading = true;
            this.button.html('Skapar pussel ...');
            const response = await fetch(this.url, {
                headers: { 'Authorization': this.API_KEY }
            });
            const data = await response.json();
            const photo = data.photos[0];
            
            const url = this.getImageUrl(photo.src, this.gameMenu.selectedSize);
            loadImage(url, (image) => {
                this.isLoading = false;
                this.button.html('Slumpa bild');
                this.gameMenu.useImage(image)
            });
        } catch (error) {
            this.isLoading = false;
            this.button.html('Slumpa bild');
            console.error(error);
        }
    }

    private getImageUrl(srcOjb: any, size: PuzzleSize): string {
        switch (size) {
            case 'xs': return srcOjb.large;
            case 's': return srcOjb.large;
            case 'm': return srcOjb.large2x;
            case 'l': return srcOjb.large2x;
            case 'xl': return srcOjb.original;
            default: return srcOjb.original
        }
    }
}