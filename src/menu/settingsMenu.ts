class SettingsMenu {
  public div: p5.Element;
  private keyBindings: KeyBindings;

  constructor(menu: IMenu) {
      this.div = createElement('div');
      this.div.addClass('menu-box');
      this.div.addClass('hidden');

      const title = createElement('h2');
      title.html('Inställningar');
      title.addClass('title');
      this.div.child(title);

      this.keyBindings = new KeyBindings(this.div);
      new CloseButton(this.div, menu);
  }

  public get showFPS() {
    return this.keyBindings.showFPS;
  }

  public open() {
      this.div.removeClass('hidden');
  }
  
  public close() {
      this.div.addClass('hidden');
  }
}