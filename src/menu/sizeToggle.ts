class SizeToggle {
  private readonly sizes: PuzzleSize[] = ['xs', 's', 'm', 'l', 'xl', /* 'xxl' */];
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
        button.mouseReleased(() => this.selectPuzzleSize(button, size));
        this.buttons.push(button);
        container.child(button);
      }

      div.child(container);
  }

  public get selectedSize() {
    return this._selectedSize;
  }
  public get selectedSizeAsVector() {
    switch(this._selectedSize) {
        case 'xs': return createVector(5, 5);
        case 's': return createVector(8, 8);
        case 'm': return createVector(12, 12);
        case 'l': return createVector(20, 20);
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