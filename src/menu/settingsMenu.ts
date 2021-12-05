class SettingsMenu {
  public div: p5.Element;

  constructor(menu: IMenu) {
      this.div = createElement('div');
      this.div.addClass('menu-box');
      this.div.addClass('hidden');

      new CloseButton(this.div, menu);
  }

  public open() {
      this.div.removeClass('hidden');
  }
  
  public close() {
      this.div.addClass('hidden');
  }
}