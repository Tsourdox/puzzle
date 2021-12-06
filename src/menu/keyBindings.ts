
class KeyBindings {
  private keyTable: { [key: string]: number } = {
    'rotera vänster': KEY_Q,
    'rotera höger': KEY_E,
    'stapla bitar': SPACE,
    'sprid bitar': KEY_C,
    'zooma hem': KEY_1,
    'markera fler': SHIFT
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
        
        const name = createElement('span');
        name.addClass('row-name');
        name.html(key);
        
        const binding = createElement('span');
        binding.addClass('row-binding');
        binding.html(this.getStringFromKeyCode(value));
        
        container.child(row);
        row.child(name);
        row.child(binding);
      }

      parent.child(title);
      parent.child(container);
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