class PiecesFactory {
    private puzzleSize: p5.Vector;
    private cellSize: p5.Vector;
    private grid: p5.Vector[][];
    private image: p5.Image;
    private offset: number;
    public seed: number;

    constructor(x: number, y: number, image: p5.Image, seed?: number) {
        this.puzzleSize = createVector(x, y);
        this.cellSize = createVector(image.width / x, image.height / y);
        this.grid = [];
        this.image = image;
        this.offset = this.cellSize.mag() / 10;
        this.seed = seed || floor(random(0, 100));
        randomSeed(this.seed)

        this.createGrid();
        this.offsetPoints();
    }

    public createAllPieces(): Piece[] {
        const pieces: Piece[] = [];
        
        for (let y = 0; y < this.puzzleSize.y; y++) {
            for (let x = 0; x < this.puzzleSize.x; x++) {
                // All corners
                const origin = this.grid[x][y];
                const right = this.grid[x + 1][y];
                const bottom = this.grid[x][y + 1];
                const diagonal = this.grid[x + 1][y + 1];

                // Create sides based on the corners
                // todo: we need more points!! (ok for now)
                const sides = {
                    top: [origin, right],
                    right: [right, diagonal],
                    bottom: [diagonal, bottom],
                    left: [bottom, origin],
                };

                const offset = this.offset * 2;
                const pieceX = round(origin.x);
                const pieceY = round(origin.y)
                let pieceW = round(this.cellSize.x + offset * 2);
                let pieceH = round(this.cellSize.y + offset * 2);

                // todo: cant be outside of image in Safari..... damn...
                const image = this.image.get(pieceX, pieceY, pieceW, pieceH);
                const id = pieces.length // array index
                const piece = new Piece(id, image, origin, this.cellSize, sides, offset);
                pieces.push(piece)
            }
        }
        
        this.shufflePieces(pieces);
        return pieces;
    }

    private shufflePieces(pieces: Piece[]) {
        const locations = pieces.map(p => p.getOrigin());
        
        for (const piece of pieces) {
            // Translate
            const randomIndex = random(0, locations.length);
            const location = locations.splice(randomIndex, 1)[0];
            const delta = p5.Vector.sub(location, piece.getOrigin())
            piece.translation = delta;

            // Rotate
            piece.rotation = random(0, PI * 2);
        }
    }

    private createGrid() {
        for (let x = 0; x <= this.puzzleSize.x; x++) {
            // create an array for y values
            this.grid[x] = [];

            for (let y = 0; y <= this.puzzleSize.y; y++) {
                this.grid[x][y] = createVector(
                    this.cellSize.x * x,
                    this.cellSize.y * y,
                );
            }
        }
    }

    private offsetPoints() {
        for (let x = 0; x <= this.puzzleSize.x; x++) {
            for (let y = 0; y <= this.puzzleSize.y; y++) {
                const gridPoint = this.grid[x][y];
                if (x !== 0 && x !== this.puzzleSize.x) {
                    gridPoint.x += random(-this.offset, this.offset);
                }
                if (y !== 0 && y !== this.puzzleSize.y) {
                    gridPoint.y += random(-this.offset, this.offset);
                }
            }
        }
    }

    public draw() {
        if (IS_DEV_MODE) {
            this.drawBackground();
            this.drawFixedGrid();
            this.drawGrid();
            this.drawPoints();
        }
    }

    private drawBackground() {
        image(this.image, 0, 0);
    }

    private drawFixedGrid() {
        push();
        strokeWeight(1);
        stroke(200);
        // Verical lines
        for (let i = 0; i <= this.puzzleSize.x; i++) {
            const x = this.cellSize.x * i;
            line(x, 0, x, height);
        }
        // Horizontal lines
        for (let i = 0; i <= this.puzzleSize.y; i++) {
            const y = this.cellSize.y * i;
            line(0, y, width, y);
        }
        pop();
    }

    private drawPoints() {
        push();
        stroke(0);
        strokeWeight(12);
        for (let x = 0; x <= this.puzzleSize.x; x++) {
            for (let y = 0; y <= this.puzzleSize.y; y++) {
                const gridPoint = this.grid[x][y];
                point(gridPoint.x, gridPoint.y);
            }
        }
        pop();
    }

    private drawGrid() {
        push();
        curveTightness(0);
        noFill();
        stroke(255);
        strokeWeight(2);
        // vertical
        for (let x = 0; x <= this.puzzleSize.x; x++) {
            const firstPoint = this.grid[x][0];
            const lastPoint = this.grid[x][this.puzzleSize.y];
            beginShape();
            curveVertex(firstPoint.x, firstPoint.y);
            for (let y = 0; y <= this.puzzleSize.y; y++) {
                const gridPoint = this.grid[x][y];
                curveVertex(gridPoint.x, gridPoint.y);
            }
            curveVertex(lastPoint.x, lastPoint.y);
            endShape();
        }

        // horizontal
        for (let y = 0; y <= this.puzzleSize.y; y++) {
            const firstPoint = this.grid[0][y];
            const lastPoint = this.grid[this.puzzleSize.x][y];
            beginShape();
            curveVertex(firstPoint.x, firstPoint.y);
            for (let x = 0; x <= this.puzzleSize.x; x++) {
                const gridPoint = this.grid[x][y];
                curveVertex(gridPoint.x, gridPoint.y);
            }
            curveVertex(lastPoint.x, lastPoint.y);
            endShape();
        }
        pop();
    }
}