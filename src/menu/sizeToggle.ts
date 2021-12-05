class SizeToggle {
  private readonly sizes: PuzzleSize[] = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
  private _selectedSize: PuzzleSize;
  private buttons: p5.Element[] = [];

  constructor(div: p5.Element) {
      this._selectedSize = 'xs';

      const container = createElement('div');
      container.addClass('toggle-container');

      for (const size of this.sizes) {
        const button = createElement('button');
        button.html(size);
        button.addClass('toggle-button');
        if (size === this._selectedSize) {
          button.addClass('selected');
        }
        button.mouseClicked(() => this.selectPuzzleSize(button, size));
        this.buttons.push(button);
        container.child(button);
      }

      div.child(container);
  }

  public get selectedSize() {
    switch(this._selectedSize) {
        case 'xs': return createVector(5, 5);
        case 's': return createVector(10, 10);
        case 'm': return createVector(16, 16);
        case 'l': return createVector(24, 24);
        case 'xl': return createVector(30, 30);
        case 'xxl': return createVector(40, 40);
    }
  }

  private selectPuzzleSize(button: p5.Element, size: PuzzleSize) {
    for (const button of this.buttons) {
      button.removeClass('selected');
    }
    button.addClass('selected');
    
    this._selectedSize = size;
  }
}

// xs: 5x5 - 25
// s: 10x10 - 100
// m: 16x16 - 256
// l: 24x24 - 576
// xs: 30x30 - 900
// xxs: 40x40 - 1600