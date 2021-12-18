interface IPuzzle {
    image?: p5.Image;
    pieces: ReadonlyArray<Piece>;
    pieceCount: p5.Vector;
    pieceSize: p5.Vector;
    readonly selectedPieces: ReadonlyArray<Piece>;
}

interface IGeneratePuzzle {
    generateNewPuzzle(image: p5.Image, x: number, y: number): void;
}

class Puzzle implements IPuzzle, IGeneratePuzzle, ISerializablePuzzle {
    public image?: p5.Image;
    public pieces: ReadonlyArray<Piece>;
    public pieceCount: p5.Vector;
    public pieceSize: p5.Vector;
    public isModified: boolean;
    private inputHandler: InputHandler;
    private networkSerializer: NetworkSerializer;
    private pieceConnetor: PieceConnector;
    private menu: Menu;
    private piecesFactory?: PiecesFactory;

    constructor() {
        this.pieces = [];
        this.pieceCount = createVector(0, 0);
        this.pieceSize = createVector(0, 0);
        this.isModified = false;
        this.menu = new Menu(this);
        this.inputHandler = new InputHandler(this, this.menu.settings);
        this.networkSerializer = new NetworkSerializer(this, this.inputHandler.graphHandler);
        const { selectionHandler, transformHandler } = this.inputHandler;
        this.pieceConnetor = new PieceConnector(this, selectionHandler, transformHandler);
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.isModified = true;
        this.image = image;
        this.pieceCount = createVector(x, y);
        this.pieceSize = createVector(image.width / x, image.height / y);

        for (const piece of this.pieces) {
            piece.cleanup();
        }

        this.piecesFactory = new PiecesFactory(x, y, image);
        this.pieces = this.piecesFactory.createAllPieces();
        this.inputHandler.graphHandler.zoomHome();
    }

    // todo: borde sparas eftersom detta blir kostsamt med många bitar
    // samt flytta till InputHandler
    public get selectedPieces(): Piece[] {
        return this.pieces.filter(p => p.isSelected);
    }

    public update() {
        this.menu.update();
        if (this.networkSerializer.isLoading) return;
        
        this.networkSerializer.update();
        if (!this.menu.isOpen) {
            this.inputHandler.update();
            this.pieceConnetor.update();
    
            for (const piece of this.pieces) {
                piece.update();
            }
        }
    }

    public draw() {
        background(this.menu.settings.getValue('bakgrundsfärg'));
        textFont(fonts.primary);
        
        push();
        scale(this.inputHandler.graphHandler.scale);
        translate(this.inputHandler.graphHandler.translation);
        this.drawPieces();
        pop();
        
        const hideInstruction = Boolean(this.piecesFactory || this.menu.isOpen); 
        this.inputHandler.draw(hideInstruction);
        this.menu.draw();
    }

    private drawPieces() {
        for (const piece of sortPieces(this.pieces)) {
            piece.draw();
        }
    }

    public serialize(): PuzzleData {
        return {
            pieceCount: toPoint(this.pieceCount),
            seed: this.piecesFactory?.seed || 0,
            image: (this.image as any)?.canvas.toDataURL() || 'no-image'
        };
    }

    public deserialize(puzzle: PuzzleData, done?: Function) {
        loadImage(puzzle.image, (image) => {
            const { x, y } = puzzle.pieceCount;
            this.image = image;
            this.pieceCount = createVector(x, y);
            this.pieceSize = createVector(image.width / x, image.height / y);
            this.piecesFactory = new PiecesFactory(x, y, image, puzzle.seed);
            this.pieces = this.piecesFactory.createAllPieces();
            done!();
        });
    }
}