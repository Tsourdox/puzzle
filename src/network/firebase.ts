const { initializeApp, getDatabase, ref, onValue, onChildChanged, off} = firebase;

class FirebaseDB {
    private db: ReturnType<typeof getDatabase>;
    private clientId: string;
    private pieceRefs: (ReturnType<typeof firebase.push> | ReturnType<typeof firebase.child>)[];
    
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
        this.clientId = random().toString().split('.')[1];
        this.pieceRefs = [];
    }

    public async getRoomData(code: string): Promise<RoomData | null> {
        const snapshot = await firebase.get(ref(this.db, 'rooms/' + code));
        if (!snapshot.exists()) return null;
        const roomData = snapshot.val() as RoomData;
        for (const [key, piece] of Object.entries(roomData.pieces)) {
            this.pieceRefs[piece.id] = firebase.child(firebase.ref(this.db, 'rooms/' + code + '/pieces'), key); 
        }
        console.log('GET PUZZLE', roomData);
        return roomData;
    }

    public savePuzzleData(code: string, puzzle: PuzzleData) {
        const roomData: RoomData = {
            puzzle,
            pieces: {}
        };
        firebase.update(ref(this.db, 'rooms/' + code), roomData);
    }

    public savePiecesData(code: string, pieces: PieceData[]) {
        try {
            const pieceUpdates = pieces.map(p => ({ ...p, updatedBy: this.clientId }));
            for (const piece of pieceUpdates) {
                if (this.pieceRefs[piece.id]) {
                    firebase.set(this.pieceRefs[piece.id], piece);
                } else {
                    const pieceRef = firebase.push(ref(this.db, 'rooms/' + code + '/pieces'));
                    this.pieceRefs[piece.id] = pieceRef;
                }
            }
        } catch (err) {
            console.error(err);
        }
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
    
    public listenToPiecesUpdates(code: string, onUpdate: (piecesData: PieceData) => void) {
        onChildChanged(ref(this.db, 'rooms/' + code + '/pieces'), (snapshot) => {
            const piece = snapshot.val();
            if (piece.updatedBy !== this.clientId) {
                onUpdate(piece);
            }
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });
    }
}

