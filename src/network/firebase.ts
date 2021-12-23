const { initializeApp, getDatabase, ref, onValue, onChildChanged, off } = firebase;

class FirebaseDB {
    private db: ReturnType<typeof getDatabase>;
    private clientId: string;
    private pieceRefs: (ReturnType<typeof firebase.push> | ReturnType<typeof firebase.child>)[];
    private currentPuzzleRef?: ReturnType<typeof ref>;
    private currentPieceRef?: ReturnType<typeof ref>;
    private _isOnline: boolean;
    public get isOnline() { return this._isOnline };
    
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
        this._isOnline = false;
    }

    public async getRoomData(code: string): Promise<RoomData | null> {
        const snapshot = await firebase.get(ref(this.db, 'rooms/' + code));
        if (!snapshot.exists()) return null;
        const roomData = snapshot.val() as RoomData;
        roomData.pieces = roomData.pieces || [];
        for (const [key, piece] of Object.entries(roomData.pieces)) {
            this.pieceRefs[piece.id] = firebase.child(firebase.ref(this.db, 'rooms/' + code + '/pieces'), key); 
        }
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
        if (this.currentPuzzleRef) off(this.currentPuzzleRef, 'child_changed');

        this.currentPuzzleRef = ref(this.db, 'rooms/' + code + '/puzzle');
        onValue(this.currentPuzzleRef, (snapshot) => {
            if (snapshot.val()) {
                onUpdate(snapshot.val());
            }
        }, (errorObject) => {
            console.error('The read failed: ' + errorObject.name);
        });
    }
    
    public listenToPiecesUpdates(code: string, onUpdate: (piecesData: PieceData) => void) {
        if (this.currentPieceRef) off(this.currentPieceRef, 'child_changed');
        
        this.currentPieceRef = ref(this.db, 'rooms/' + code + '/pieces');
        onChildChanged(this.currentPieceRef, (snapshot) => {
            const piece = snapshot.val();
            if (piece.updatedBy !== this.clientId) {
                onUpdate(piece);
            }
        }, (errorObject) => {
            console.error('The read failed: ' + errorObject.name);
        });
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
            
            const connectedRef = ref(this.db, ".info/connected");
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
                    resolve()
                }, 500);
            });
        })
    }
}

