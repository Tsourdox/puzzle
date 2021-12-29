class SettingsMenu implements IWritableSettings, IReadableSettings {
    public div: p5.Element;
    private settingsTable: SettingsTable;
    private isOpen: boolean;

    private settingsMap: ISettingsMap = {
        'rotationshastighet': 1,
        'rotera med 3 fingrar': 0,
        'rotera vänster': KEY_Z,
        'rotera höger': KEY_X,
        'stapla bitar': SPACE,
        'sprid bitar': KEY_C,
        'markera fler': SHIFT,
        'koppla om bitar': KEY_R,
        'invertera zoom': 0,
        'visa fps räknare': 0,
        'bakgrundsfärg': 40,
    };

    public get keys() {
        return Object.keys(this.settingsMap) as ISetting[];
    }
    public get map() {
        return this.settingsMap;
    }
    public getValue(key: ISetting) {
        return this.settingsMap[key];
    }

    constructor() {
        this.loadFromLS();
        this.isOpen = false;
        this.div = createElement('div');
        this.div.addClass('menu-box');
        this.div.addClass('hidden');

        const title = createElement('h2');
        title.html('Inställningar');
        title.addClass('title');
        this.div.child(title);

        this.settingsTable = new SettingsTable(this.div, this);
    }

    public update() {
        if (this.isOpen) {
            this.settingsTable.update();
        }
    }

    public get showFPS() {
        return Boolean(this.settingsMap['visa fps räknare']);
    }

    public open() {
        this.div.removeClass('hidden');
        this.isOpen = true;
    }
    
    public close() {
        this.div.addClass('hidden');
        this.isOpen = false;
    }

    public updateBinding(key: ISetting, value: number | string | boolean) {
        this.settingsMap[key] = Number(value);
        this.saveToLS();
    }

    private saveToLS() {
        localStorage.setItem('settings', JSON.stringify(this.settingsMap));
    }

    private loadFromLS() {
        const data = localStorage.getItem('settings');
        if (data) {
            const savedTable = JSON.parse(data);
            for (const key of Object.keys(this.settingsMap) as ISetting[]) {
                if (savedTable[key]) {
                    this.settingsMap[key] = savedTable[key];
                }
            }
        }
    }
}