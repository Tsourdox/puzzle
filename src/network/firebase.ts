const { initializeApp, getDatabase, ref, onValue, onChildChanged, off } = firebase;

class FirebaseDB {
    private db: ReturnType<typeof getDatabase>;
    
    constructor() {
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAlEj7hYnfuvJPQEgZiwkogUMy6gViUbdc",
            authDomain: "puzzelin-f0c28.firebaseapp.com",
            projectId: "puzzelin-f0c28",
            storageBucket: "puzzelin-f0c28.appspot.com",
            messagingSenderId: "946157006607",
            appId: "1:946157006607:web:3991b8e8272c940d3d187a",
            databaseURL: "https://puzzelin-f0c28-default-rtdb.europe-west1.firebasedatabase.app",
        };
        const app = initializeApp(firebaseConfig);
        this.db = getDatabase(app);
    }

    public savePuzzleData(code: string, puzzle: PuzzleData) {
        const roomData: RoomData = {
            puzzle,
            pieces: []
        };
        console.log('SEND', roomData, code);
        firebase.update(ref(this.db, 'rooms/' + code), roomData);
    }

    public savePiecesData(code: string, pieces: PieceData[]) {
        const roomData: Pick<RoomData, 'pieces'> = { pieces };
        firebase.update(ref(this.db, 'rooms/' + code), roomData);
    }

    public async getRoomData(code: string): Promise<RoomData | null> {
        const snapshot = await firebase.get(ref(this.db, 'rooms/' + code));
        if (snapshot.exists()) {
            return snapshot.val() as RoomData;
        }
        return null;
    }
    
    public listenToPuzzleUpdates(code: string, onUpdate: (puzzleData: PuzzleData) => void) {
        onValue(ref(this.db, 'rooms/' + code + '/puzzle'), (snapshot) => {
            if (snapshot.val()) {
                onUpdate(snapshot.val());
            } else {
                console.log('No value at', code);
            }
        }, (errorObject) => {
          console.log('The read failed: ' + errorObject.name);
        });
    }
    
    public listenToPiecesUpdates(code: string, onUpdate: (piecesData: PieceData[]) => void) {
        onValue(ref(this.db, 'rooms/' + code + '/pieces'), (snapshot) => {
          onUpdate(snapshot.val());
        }, (errorObject) => {
          console.log('The read failed: ' + errorObject.name);
        });
    }
}

