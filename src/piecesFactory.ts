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
        
        for (const sides of this.generatePiecesOutlines()) {
            const origin = sides.top[0];
            const offset = this.offset * 4;
            const pieceX = round(origin.x - offset);
            const pieceY = round(origin.y - offset);
            let pieceW = round(this.cellSize.x + offset * 2);
            let pieceH = round(this.cellSize.y + offset * 2);
    
            // todo: cant be outside of image in Safari..... damn...
            const image = this.image.get(pieceX, pieceY, pieceW, pieceH);
            const id = pieces.length // array index
            const piece = new Piece(id, image, origin, this.cellSize, sides, offset);
            pieces.push(piece)

        }
        
        this.shufflePieces(pieces);
        return pieces;
    }

    private generatePiecesOutlines() {
        const sidesList: Sides[] = [];
        
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

                // todo: adding a few more points, still need more...
                this.generateSidePoints(sides.top, 'top', x, y, sidesList);
                this.generateSidePoints(sides.right, 'right', x, y, sidesList);
                this.generateSidePoints(sides.bottom, 'bottom', x, y, sidesList);
                this.generateSidePoints(sides.left, 'left', x, y, sidesList);

                sidesList.push(sides);
            }
        }

        return sidesList;
    }

    private generateSidePoints(side: p5.Vector[], edge: 'top'|'right'|'bottom'|'left', x: number, y: number, sides: Sides[]) {
        const abovePieceIndex = (y - 1) * this.puzzleSize.x + x;
        const leftPieceIndex = y * this.puzzleSize.x + (x - 1);

        if (edge === 'bottom' && y === this.puzzleSize.y - 1) return;
        if (edge === 'right' && x === this.puzzleSize.x - 1) return;
        
        if (edge === 'top') {
            if (y === 0) return;
            // Clone bottom side from above piece to match it.
            const newSide = sides[abovePieceIndex].bottom.map(vector => vector.copy());
            newSide.reverse();
            side.splice(0, 2, ...newSide);
            return;
        }
        if (edge === 'left') {
            if (x === 0) return;
            // Clone right side from piece on the left to match it.
            const newSide = sides[leftPieceIndex].right.map(vector => vector.copy());
            newSide.reverse();
            side.splice(0, 2, ...newSide);
            return;
        }
        const newSide = this.createCurve(side[0], side[1]);
        side.splice(0, 2, ...newSide);
    }

    private angleBetween(v0: p5.Vector, v1: p5.Vector) {
        const dx = v1.x - v0.x;
        const dy = v1.y - v0.y;
        return Math.atan2(dy, dx);
    }
    
    /**
     * Creates the curve by adding 2 control points to each end (v0, v1) and 3 bezier points
     * (a pair of 1 origin and 2 control points) in the middle of the array.
     * The direction or in other words - bay or headland for a puzzle piece, is randomed.
     * Each point has some slight randomness to it's position to make
     * the whole curve a bit random.
     * 
     * @returns a curve as a series of points.
     */
    private createCurve(v0: p5.Vector, v1: p5.Vector): p5.Vector[] {
        const distance = this.cellSize.mag() * .6;
        const angle = this.angleBetween(v0, v1);
        const distVariation = random(-distance * .05, distance * .05);
      
        const mid = createVector(
            lerp(v0.x, v1.x, .5 + random(-.08, .08)),
            lerp(v0.y, v1.y, .5 + random(-.08, .08)),
        );
      
        // Bay or headland?
        const direction = random() > .5 ? 1 : -1; 
        
        const farAngle = angle - Math.PI * .5 * direction +  random(-.1, .1);
        const far = createVector(
            mid.x + Math.cos(farAngle) * distance * .3 + distVariation,
            mid.y + Math.sin(farAngle) * distance * .3 + distVariation,
        );
        const farBezier = this.createBezierPoint(
            far,
            angle + Math.PI + random(-.4, .4),
            distance * .15 * random(1, 2)
        );
        
        const b1Angle = farAngle - Math.PI * .4 * direction + random(-.1, .1);
        const b1 = createVector(
            mid.x + Math.cos(b1Angle) * distance * .1 + distVariation,
            mid.y + Math.sin(b1Angle) * distance * .1 + distVariation,
        );
        const bezier1 = this.createBezierPoint(
            b1,
            angle + Math.PI * .3 * direction + random(-.2, .2),
            distance * .5 * random(.1, .2)
        );
        
        const b2Angle = farAngle + Math.PI * .4 * direction +  random(-.1, .1);
        const b2 = createVector(
            mid.x + Math.cos(b2Angle) * distance * .1 + distVariation,
            mid.y + Math.sin(b2Angle) * distance * .1 + distVariation,
        );
        const bezier2 = this.createBezierPoint(
            b2,
            angle - Math.PI * .3 * direction + random(-.2, .2),
            distance * .5 * random(.1, .2)
        );
      
        const c0 = createVector(
            lerp(v0.x, v1.x, .2),
            lerp(v0.y, v1.y, .2),
        );
        const c1 = createVector(
            lerp(v0.x, v1.x, .8),
            lerp(v0.y, v1.y, .8),
        );
      
        return [v0, c0, ...bezier1, ...farBezier, ...bezier2, c1, v1];
    }
      
    private createBezierPoint(origin: p5.Vector, rotation: number, magnitude: number) {
        const c1 = createVector(
            origin.x + magnitude * cos(rotation),
            origin.y + magnitude * sin(rotation)
        );
        const c2 = createVector(
            origin.x - magnitude * cos(rotation),
            origin.y - magnitude * sin(rotation)
        );
        return [c1, origin, c2];
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
}