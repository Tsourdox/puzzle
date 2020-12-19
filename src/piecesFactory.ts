class PiecesFactory {
    private puzzleSize: p5.Vector;
    private cellSize: p5.Vector;
    private grid: p5.Vector[][];
    private image: p5.Image;

    constructor(x: number, y: number, image: p5.Image, cellSize: p5.Vector) {
        this.puzzleSize = createVector(x, y);
        this.cellSize = cellSize;
        this.grid = [];
        this.image = image;

        this.createGrid();
        this.offsetPoints();
        this.createAllPieces();
    }

    public createAllPieces(): ReadonlyArray<Piece> {
        const pieces: Piece[] = [];
        
        for (let x = 0; x < this.puzzleSize.x; x++) {
            for (let y = 0; y < this.puzzleSize.y; y++) {
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

                // todo: just for testing...
                if (pieces.length === 6) {
                    return pieces;
                }

                const piece = new Piece(sides);
                pieces.push(piece)
            }
        }

        return pieces;
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
        const maxOffsetX = this.cellSize.x / 10;
        const maxOffsetY = this.cellSize.y / 10;

        for (let x = 0; x <= this.puzzleSize.x; x++) {
            for (let y = 0; y <= this.puzzleSize.y; y++) {
                const gridPoint = this.grid[x][y];
                if (x !== 0 && x !== this.puzzleSize.x) {
                    gridPoint.x += random(-maxOffsetX, maxOffsetX);
                }
                if (y !== 0 && y !== this.puzzleSize.y) {
                    gridPoint.y += random(-maxOffsetY, maxOffsetY);
                }
            }
        }
    }

    public draw() {
        this.drawBackground();
        this.drawFixedGrid();
        this.drawGrid();
        this.drawPoints();
    }

    private drawBackground() {
        image(this.image, 0, 0);
    }

    private drawFixedGrid() {
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
    }

    private drawPoints() {
        stroke(0);
        strokeWeight(12);
        for (let x = 0; x <= this.puzzleSize.x; x++) {
            for (let y = 0; y <= this.puzzleSize.y; y++) {
                const gridPoint = this.grid[x][y];
                point(gridPoint.x, gridPoint.y);
            }
        }
    }

    private drawGrid() {
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
    }
}