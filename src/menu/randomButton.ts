interface PexelsImage {
    src: {
        original: string;
        large2x: string;
        large: string;
    }
}

class RandomButton {
    private readonly API_KEY: string;
    private gameMenu: IGameMenu;
    private button: p5.Element;
    private isLoading: boolean;
    private imageGroupCache: Record<string, PexelsImage[] | undefined> = {
        'wind+pirate': undefined,
        'happy+sun': undefined,
        'water+house': undefined,
        'earth+totem': undefined,
        'magic+snow': undefined,
        'animal+love': undefined,
    };

    constructor(div: p5.Element, gameMenu: IGameMenu) {
        this.gameMenu = gameMenu;
        this.isLoading = false;
        // todo: how do we hide the key?
        this.API_KEY = '563492ad6f91700001000001e9543e64cc6240f3a18b3b0d9f42629d';
        this.loadCacheFromLS();

        this.button = createElement('label');
        this.button.addClass('button');
        this.button.html('Slumpa bild');
        this.button.mouseReleased(() => this.loadRandomPhoto());
        div.child(this.button);
    }

    private async loadRandomPhoto() {
        try {
            if (this.isLoading) return;
            this.isLoading = true;
            this.button.html('Skapar pussel ...');

            const searchTerm = random(Object.keys(this.imageGroupCache));
            let imageGroup = this.imageGroupCache[searchTerm];
            if (!imageGroup) {
                imageGroup = await this.fetchImageGroupFromAPI(searchTerm);
                this.imageGroupCache[searchTerm] = imageGroup;
                this.saveCacheToLS();
            }

            const image = random(imageGroup);
            const url = this.getImageUrl(image);
            loadImage(url, this.loadImageComplete);
        } catch (error) {
            // todo: Bättre felhantering?
            this.isLoading = false;
            this.button.html('Slumpa bild');
            console.error(error);
        }
    }

    private saveCacheToLS() {
        localStorage.imageGroupCache = JSON.stringify(this.imageGroupCache);
        localStorage.imageGroupCacheDate = new Date().toJSON();
    }
    
    private loadCacheFromLS() {
        const imageGroupCache = localStorage.getItem('imageGroupCache');
        const cacheDateString = localStorage.getItem('imageGroupCacheDate');
        if (imageGroupCache && cacheDateString) {
            const cacheDate = new Date(cacheDateString);
            if (daysBetweenDates(cacheDate, new Date()) > 7) {
                localStorage.removeItem('imageGroupCache');
                localStorage.removeItem('imageGroupCacheDate');
            } else {
                this.imageGroupCache = {
                    ...this.imageGroupCache,
                    ...JSON.parse(imageGroupCache)
                };
            }

        }
    }

    private async fetchImageGroupFromAPI(searchTerm: string): Promise<PexelsImage[]> {
        const page = floor(random(0, 20));
        const domain = 'https://api.pexels.com/';
        const path = 'v1/search'
        const query = `?query=${searchTerm}&orientation=landscape&per_page=80&page=${page}`;
        const url = `${domain}${path}${query}`
        const response = await fetch(url, {
            headers: { 'Authorization': this.API_KEY }
        });
        const imageGroup = (await response.json()).photos as PexelsImage[];
        if (!imageGroup?.length) {
            // Just in case nothing was returned - fetch again...
            return this.fetchImageGroupFromAPI(searchTerm);
        }
        return imageGroup;
    }

    private loadImageComplete = (image: p5.Image) => {
        this.isLoading = false;
        this.button.html('Slumpa bild');
        this.gameMenu.useImage(image);
    }

    private getImageUrl(image: PexelsImage): string {
        switch (this.gameMenu.selectedSize) {
            case 'xs': return image.src.large;
            case 's': return image.src.large;
            case 'm': return image.src.large2x;
            case 'l': return image.src.large2x;
            case 'xl': return image.src.original;
            default: return image.src.original
        }
    }
}