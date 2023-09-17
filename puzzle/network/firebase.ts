import { initializeApp } from 'firebase/app';
import { getDatabase, off, onChildChanged, onDisconnect, onValue, ref } from 'firebase/database';
import { IDeserializedPieceData, IPieceData, IPuzzleData, ISerializedPieceData } from './types';

interface RoomData<P> {
  puzzle: IPuzzleData;
  pieces: Record<string, P>;
}

interface StoredPieceData extends IPieceData {
  selectedBy?: string;
  updatedBy: string;
}

export default class FirebaseDB {
  private db: ReturnType<typeof getDatabase>;
  private clientId: string;
  private pieceRefs: (ReturnType<typeof firebase.push> | ReturnType<typeof firebase.child>)[];
  private deslectUpdates: Record<string, StoredPieceData>;
  private _isOnline: boolean;
  public get isOnline() {
    return this._isOnline;
  }

  constructor() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: 'AIzaSyAlEj7hYnfuvJPQEgZiwkogUMy6gViUbdc',
      authDomain: 'puzzelin-f0c28.firebaseapp.com',
      projectId: 'puzzelin-f0c28',
      storageBucket: 'puzzelin-f0c28.appspot.com',
      messagingSenderId: '946157006607',
      appId: '1:946157006607:web:3991b8e8272c940d3d187a',
      databaseURL: 'https://puzzelin-f0c28-default-rtdb.europe-west1.firebasedatabase.app',
    };

    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
    this.pieceRefs = [];
    this.deslectUpdates = {};
    this._isOnline = false;

    this.clientId = localStorage.getItem('clientId') || random().toString().split('.')[1];
    localStorage.setItem('clientId', this.clientId);
  }

  public async getRoomData(code: string): Promise<RoomData<IDeserializedPieceData> | null> {
    const snapshot = await firebase.get(ref(this.db, 'rooms/' + code));
    if (!snapshot.exists()) return null;
    const storedRoomData = snapshot.val() as RoomData<StoredPieceData>;
    storedRoomData.pieces = storedRoomData.pieces || [];
    for (const [key, piece] of Object.entries(storedRoomData.pieces)) {
      this.pieceRefs[piece.id] = firebase.child(
        firebase.ref(this.db, 'rooms/' + code + '/pieces'),
        key,
      );
    }

    const roomData: RoomData<IDeserializedPieceData> = {
      puzzle: storedRoomData.puzzle,
      pieces: {},
    };
    for (const [key, { selectedBy, ...pieceData }] of Object.entries(storedRoomData.pieces)) {
      roomData.pieces[key] = {
        ...pieceData,
        isSelectedByOther: Boolean(selectedBy && selectedBy !== this.clientId),
      };
    }
    return roomData;
  }

  public savePuzzleData(code: string, puzzle: IPuzzleData) {
    const roomRef = ref(this.db, 'rooms/' + code);
    const roomData: RoomData<StoredPieceData> = {
      puzzle: { ...puzzle, updatedBy: this.clientId },
      pieces: {},
    };
    firebase.update(roomRef, roomData);
  }

  public async cleanup(code: string) {
    const piecesRef = ref(this.db, 'rooms/' + code + '/pieces');
    const puzzleRef = ref(this.db, 'rooms/' + code + '/puzzle');
    await firebase.update(piecesRef, this.deslectUpdates);
    off(puzzleRef, 'child_changed');
    off(piecesRef, 'child_changed');
  }

  public async savePiecesData(code: string, pieces: ISerializedPieceData[]) {
    try {
      const piecesRef = ref(this.db, 'rooms/' + code + '/pieces');
      const updates: Record<string, StoredPieceData> = {};
      const pieceUpdates = pieces.map((p) => ({
        ...p,
        updatedBy: this.clientId,
      }));
      for (const { isSelected, ...piece } of pieceUpdates) {
        if (!this.pieceRefs[piece.id]) {
          const pieceRef = firebase.push(piecesRef);
          this.pieceRefs[piece.id] = pieceRef;
        }

        const pieceRefKey = this.pieceRefs[piece.id].key;
        if (!pieceRefKey) continue;

        updates[pieceRefKey] = { ...piece };
        if (isSelected) updates[pieceRefKey].selectedBy = this.clientId;

        if (isSelected) {
          this.deslectUpdates[pieceRefKey] = { ...piece };
        } else {
          delete this.deslectUpdates[pieceRefKey];
        }
      }
      await onDisconnect(piecesRef).cancel();
      onDisconnect(piecesRef).update(this.deslectUpdates);
      firebase.update(piecesRef, updates);
    } catch (err) {
      console.error(err);
    }
  }

  public listenToPuzzleUpdates(code: string, onUpdate: (puzzleData: IPuzzleData) => void) {
    const puzzleRef = ref(this.db, 'rooms/' + code + '/puzzle');
    onValue(
      puzzleRef,
      (snapshot) => {
        const puzzleData = snapshot.val() as IPuzzleData;
        if (puzzleData && puzzleData.updatedBy !== this.clientId) {
          onUpdate(puzzleData);
        }
      },
      (errorObject) => {
        console.error('The read failed: ' + errorObject.name);
      },
    );
  }

  public listenToPiecesUpdates(
    code: string,
    onUpdate: (piecesData: IDeserializedPieceData) => void,
  ) {
    const pieceRef = ref(this.db, 'rooms/' + code + '/pieces');
    onChildChanged(
      pieceRef,
      (snapshot) => {
        const { selectedBy, updatedBy, ...piece } = snapshot.val() as StoredPieceData;
        if (updatedBy !== this.clientId) {
          onUpdate({
            ...piece,
            isSelectedByOther: Boolean(selectedBy && selectedBy !== this.clientId),
          });
        }
      },
      (errorObject) => {
        console.error('The read failed: ' + errorObject.name);
      },
    );
  }

  public async init() {
    this.pieceRefs = [];
    if (!this.isOnline) {
      await this.listenForOnlineConnection();
    }
  }

  private listenForOnlineConnection() {
    return new Promise<void>((resolve) => {
      let isFirstSnapshot = true;
      let isFullfilled = false;

      const connectedRef = ref(this.db, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        this._isOnline = Boolean(snapshot.val());

        // Resolve on second response since the first is always offline
        if (!isFirstSnapshot && !isFullfilled) {
          isFullfilled = true;
          return resolve();
        }

        // In case we are offline wait a maximum of 500ms before resolving
        isFirstSnapshot = false;
        setTimeout(() => {
          if (isFullfilled) return;
          isFullfilled = true;
          resolve();
        }, 500);
      });
    });
  }
}
