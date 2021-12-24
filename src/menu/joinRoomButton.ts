class JoinRoomButton {
    private menu: IMenu;
    private roomCodeInput: p5.Element;
    private label: p5.Element;

    constructor(div: p5.Element, menu: IMenu) {
        this.menu = menu;

        const container = createElement('div');
        this.roomCodeInput = createInput();
        this.roomCodeInput.addClass('hidden').addClass('room-code-input');
        this.roomCodeInput.attribute('maxlength', '4').attribute('placeholder', 'XXXX');
        this.roomCodeInput.elt.addEventListener('input', () => this.handleRoomCodeChanged());
        this.label = createElement('label');
        this.label.addClass('button');
        this.label.html('Gå med i rum');
        this.label.mouseReleased(() => this.showCodeInput());
        
        container.child(this.roomCodeInput);
        container.child(this.label);
        div.child(container);
    }

    private showCodeInput() {
        this.label.addClass('hidden');
        this.roomCodeInput.removeClass('hidden');
        this.roomCodeInput.elt.focus();
    }

    private handleRoomCodeChanged() {
        const roomCode = this.roomCodeInput.value().toString().toUpperCase();
        if (roomCode.length === 4) {
            setTimeout(() => this.setRoomCode(roomCode), 500);
        }
    }
    
    private setRoomCode(roomCode: string) {
        this.label.removeClass('hidden');
        this.roomCodeInput.addClass('hidden');
        this.roomCodeInput.value('');
        this.roomCodeInput.elt.blur();
        localStorage.setItem('room-code', roomCode);
        window.dispatchEvent(new Event('storage'));
        this.menu.setOpenMenu('closed');
    }
}