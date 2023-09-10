import { settings } from '../utils/settings';

export default class RoomCode {
  public draw(roomCode: string) {
    if (!settings['visa fps räknare']) return;
    push();
    textSize(20);
    textAlign(LEFT, TOP);
    if (roomCode === 'OFFLINE') {
      text(roomCode, 10, 6);
    } else {
      text(`RUM: ${roomCode}`, 10, 6);
    }
    pop();
  }
}
