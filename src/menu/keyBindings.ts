
class KeyBindings {
    private keyTable: { [key: string]: number } = {
        'rotationshastighet': 1,
        'rotera vänster': KEY_Q,
        'rotera höger': KEY_E,
        'zooma hem': KEY_1,
        'stapla bitar': SPACE,
        'sprid bitar': KEY_C,
        'markera fler': SHIFT,
        'visa fps': 1,
    };

    public get showFPS() {
        return Boolean(this.keyTable['visa fps']);
    }

    constructor(parent: p5.Element) {
        this.loadFromLS();
        const container = createElement('div');
        container.addClass('keybindings-container')
        for (const [key, value] of Object.entries(this.keyTable)) {
            const row = createElement('div');
            row.addClass('table-row');
            
            const rowName = createElement('span');
            rowName.addClass('row-name');
            rowName.html(key);
            
            let rowContent: p5.Element;
            if (key === 'rotationshastighet') {
                rowContent = this.createSlider(value, key);
            } else if (key === 'visa fps') {
                rowContent = this.createToggleSwitch(value, key);
            } else {
                rowContent = this.createKeyBinding(value);
            }
            
            container.child(row);
            row.child(rowName);
            row.child(rowContent);
        }
        parent.child(container);
    }

    private updateBinding(key: string, value: number | string | boolean) {
        this.keyTable[key] = Number(value);
        this.saveToLS();
    }

    private createToggleSwitch(value: number, key: string) {
        const container = createElement('label');
        const input = createElement('input');
        const handle = createElement('span');
        
        container.addClass('switch');
        handle.addClass('toggle');
        input.attribute('type', 'checkbox');
        input.elt.checked = Boolean(value);
        input.mouseClicked(() => {
            this.updateBinding(key, input.elt.checked);
        });
        
        container.child(input);
        container.child(handle);
        return container;
    }

    private createSlider(value: number, key: string) {
        const min = .3; const max = 3;
        const input = createElement('input');
        input.attribute('type', 'range');
        input.attribute('step', '0.1');
        input.attribute('min', min.toString());
        input.attribute('max', max.toString());
        input.value(value);
        input.addClass('slider');
        input.elt.addEventListener('input', () => {
            this.setSliderBackground(input, min, max);
            this.updateBinding(key, input.value());
        });
        this.setSliderBackground(input, min, max);
        return input
    }

    private setSliderBackground(input: p5.Element, min: number, max: number) {
        const value = Number(input.value());
        if (value === min) return;

        let percentage = (value - min) / (max - min) * 100
        const gradient = `linear-gradient(to right, var(--darkened), var(--primary) ${percentage}%, var(--backdrop) ${percentage}%, var(--background) 100%)`;
        input.style('background', gradient);
    }

    private createKeyBinding(value: number) {
        const span = createElement('span');
        span.addClass('row-binding');
        span.html(this.getStringFromKeyCode(value));
        return span;
    }

    private getStringFromKeyCode(code: number) {
        switch(code) {
            case SPACE: return 'space';
            case LEFT_ARROW: return 'pil vänster';
            case RIGHT_ARROW: return 'pil höger';
            case UP_ARROW: return 'pil upp';
            case DOWN_ARROW: return 'pil ner';
            case SHIFT: return 'shift';
            default: return String.fromCharCode(code);
        }
    }

    private saveToLS() {
        localStorage.setItem('settings', JSON.stringify(this.keyTable));
    }

    private loadFromLS() {
        const data = localStorage.getItem('settings');
        if (data) {
            this.keyTable = JSON.parse(data);
        }
    }
}