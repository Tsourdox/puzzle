class SettingsTable {
    private waitingOnKeyBindingForKey?: ISetting;
    private elementToUpdate?: p5.Element;
    private settings: IReadWriteSettings;

    constructor(parent: p5.Element, settings: IReadWriteSettings) {
        this.settings = settings;
        const container = createElement('div');
        container.addClass('keybindings-container')
        for (const key of settings.keys) {
            const value = settings.getValue(key);
            const row = createElement('div');
            row.addClass('table-row');
            
            const rowName = createElement('span');
            rowName.addClass('row-name');
            rowName.html(key);
            
            let rowContent: p5.Element;
            if (key === 'rotationshastighet') {
                rowContent = this.createSlider(value, key);
            } else if (key === 'visa fps räknare' || key === 'invertera zoom' || key === 'rotera med 3 fingrar') {
                rowContent = this.createToggleSwitch(value, key);
            } else if (key === 'bakgrundsfärg') {
                rowContent = this.createColorPicker(value, key, [20, 40, 60]);
            } else {
                rowContent = this.createKeyBinding(value, key);
            }
            
            container.child(row);
            row.child(rowName);
            row.child(rowContent);
        }
        parent.child(container);
    }

    public update() {
        if (this.waitingOnKeyBindingForKey) {
            if (keyIsPressed) {
                if (keyCode === ESCAPE) {
                    this.resetWaitingOnKeyBinding();
                } else {
                    const key = this.waitingOnKeyBindingForKey;
                    this.settings.updateBinding(key, keyCode);
                    this.elementToUpdate?.html(this.getStringFromKeyCode(keyCode));
                    this.elementToUpdate?.removeClass('active');
                }
                
                this.elementToUpdate = undefined;
                this.waitingOnKeyBindingForKey = undefined;
            }
        }
    }

    private resetWaitingOnKeyBinding() {
        if (!this.waitingOnKeyBindingForKey) return;
        const oldKeyCode = this.settings.getValue(this.waitingOnKeyBindingForKey);
        const keyCodeString = this.getStringFromKeyCode(oldKeyCode)
        this.elementToUpdate?.html(keyCodeString);
        this.elementToUpdate?.removeClass('active');
    }

    private createColorPicker(value: number, key: ISetting, colors: number[]) {
        const colorPicker = createElement('div');
        colorPicker.addClass('color-picker')
        for (const background of colors) {
            const colorSquare = createElement('div');
            colorSquare.elt.style.background = color(background).toString();
            colorSquare.elt.addEventListener('click', () => {
                for (const square of colorPicker.elt.children) {
                    square.classList.remove('selected');
                }
                colorSquare.addClass('selected');
                this.settings.updateBinding(key, background);
            });
            
            if (value === background) {
                colorSquare.addClass('selected')
            }
            colorPicker.child(colorSquare);
        }
        return colorPicker;
    }

    private createToggleSwitch(value: number, key: ISetting) {
        const container = createElement('label');
        const input = createElement('input');
        const handle = createElement('span');
        
        container.addClass('switch');
        handle.addClass('toggle');
        input.attribute('type', 'checkbox');
        input.elt.checked = Boolean(value);
        input.mouseClicked(() => {
            this.settings.updateBinding(key, input.elt.checked);
        });
        
        container.child(input);
        container.child(handle);
        return container;
    }

    private createSlider(value: number, key: ISetting) {
        const min = .2; const max = 5;
        const input = createElement('input');
        input.attribute('type', 'range');
        input.attribute('step', '0.01');
        input.attribute('min', min.toString());
        input.attribute('max', max.toString());
        input.value(value);
        input.addClass('slider');
        input.elt.addEventListener('input', () => {
            this.setSliderBackground(input, min, max);
            this.settings.updateBinding(key, input.value());
        });
        this.setSliderBackground(input, min, max);
        return input
    }

    private setSliderBackground(input: p5.Element, min: number, max: number) {
        const value = Number(input.value());
        let percentage = (value - min) / (max - min) * 100
        const gradient = `linear-gradient(to right, var(--darkened), var(--primary) ${percentage}%, var(--backdrop) ${percentage}%, var(--background) 100%)`;
        input.style('background', gradient);
    }

    private createKeyBinding(value: number, key: ISetting) {
        const span = createElement('span');
        span.addClass('key-binding');
        span.html(this.getStringFromKeyCode(value));
        span.mouseClicked(() => {
            // Restore
            if (this.waitingOnKeyBindingForKey) {
                this.resetWaitingOnKeyBinding();
            }

            span.html('Ange ny tangent');
            span.addClass('active');
            this.waitingOnKeyBindingForKey = key;
            this.elementToUpdate = span;
        })
        return span;
    }

    private getStringFromKeyCode(code: number) {
        switch(code) {
            case SPACE: return 'mellanslag';
            case LEFT_ARROW: return 'pil vänster';
            case RIGHT_ARROW: return 'pil höger';
            case UP_ARROW: return 'pil upp';
            case DOWN_ARROW: return 'pil ner';
            case SHIFT: return 'shift';
            case ALT: return 'alt';
            case CONTROL: return 'ctrl';
            case ENTER: return 'enter';
            default: return String.fromCharCode(code);
        }
    }
}