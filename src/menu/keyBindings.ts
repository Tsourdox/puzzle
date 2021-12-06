
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

  constructor(parent: p5.Element) {
      const title = createElement('h2');
      title.html('Tangentbindningar');
      title.addClass('title');

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
          rowContent = this.createSlider(value);
        } else if (key === 'visa fps') {
          rowContent = this.createToggleSwitch(value);
        } else {
          rowContent = this.createKeyBinding(value);
        }
        
        container.child(row);
        row.child(rowName);
        row.child(rowContent);
      }

      parent.child(title);
      parent.child(container);
  }

  private createToggleSwitch(value: number) {
    const container = createElement('label');
    const input = createElement('input');
    const handle = createElement('span');
    
    container.addClass('switch');
    input.attribute('type', 'checkbox');
    value && input.attribute('checked', '');
    handle.addClass('toggle');
    
    container.child(input);
    container.child(handle);
    return container;
  }

  private createSlider(value: number) {
    const input = createElement('input');
    input.attribute('step', '0.1');
    input.attribute('min', '0.3');
    input.attribute('max', '3');
    input.attribute('type', 'range');
    input.value(value);
    input.addClass('slider');
    return input
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
}