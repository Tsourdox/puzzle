/**
 * A two-dimensional array of points.
 * @typedef {Point[][]} Grid
 */

class Puzzle {
    constructor(x, y, image) {
        this.fidelity = 2;
        this.grid = [];
        this.size = { x, y };
        this.image = image;
        this.cellWidth = width / this.size.x;
        this.cellHeight = height / this.size.y;
        this.pieces = [];

        this.createGrid();
        this.offsetPoints();
        this.createAllPieces();

        this.inputHandler = new InputHandler(this.pieces, this.cellWidth);
    }

    createGrid() {
        for (let x = 0; x <= this.size.x; x++) {
            // create an array for y values
            this.grid[x] = [];

            for (let y = 0; y <= this.size.y; y++) {
                this.grid[x][y] = {
                    x: this.cellWidth * x,
                    y: this.cellHeight * y,
                };
            }
        }
    }

    offsetPoints() {
        const maxOffsetX = this.cellWidth / 10;
        const maxOffsetY = this.cellHeight / 10;

        for (let x = 0; x <= this.size.x; x++) {
            for (let y = 0; y <= this.size.y; y++) {
                const gridPoint = this.grid[x][y];
                if (x !== 0 && x !== this.size.x) {
                    gridPoint.x += random(-maxOffsetX, maxOffsetX);
                }
                if (y !== 0 && y !== this.size.y) {
                    gridPoint.y += random(-maxOffsetY, maxOffsetY);
                }
            }
        }
    }

    createAllPieces() {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                // All corners
                const origin = this.grid[x][y];
                const right = this.grid[x + 1][y];
                const bottom = this.grid[x][y + 1];
                const diagonal = this.grid[x + 1][y + 1];

                // Create sides based on the corners
                // todo: we need more points!! (ok for now)
                const sides = {
                    top: this.addPoints([origin, right]),
                    right: this.addPoints([right, diagonal]),
                    bottom: this.addPoints([diagonal, bottom]),
                    left: this.addPoints([bottom, origin]),
                };

                // todo: just for testing...
                if (this.pieces.length === 1) {
                    return;
                }

                const piece = new Piece(sides);
                this.pieces.push(piece)
            }
        }
    }

    addPoints(array, depth = 0) {
        if (depth >= this.fidelity) return array;
        
        const newPoints = [];
        for (let i = 0; i < array.length - 1; i++) {
            const a = array[i];
            const b = array[i + 1];
            
            // create point
            const midPoint = {
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            }
            
            // offset point
            const offsetX = (a.x - b.x) / 2
            const offsetY = (a.y - b.y) / 2
            if (offsetX < offsetY) {
                midPoint.x += random(-offsetX, offsetX);
            } else {
                midPoint.y += random(-offsetY, offsetY);
            }

            newPoints.push(midPoint);
        }
        
        const newArray = [];
        for (let i = 0; i < newPoints.length; i++) {
            newArray[i * 2] = array[i]
            newArray[i * 2 + 1] = newPoints[i]
        }
        newArray.push(array[newPoints.length]);
        return this.addPoints(newArray, depth + 1);
    }

    update() {
        this.inputHandler.update();
    }

    draw() {
        this.drawBackground();
        //this.drawFixedGrid();
        //this.drawGrid();
        //this.drawPoints();
        this.drawPieces();
    }

    drawBackground() {
        image(this.image, 0, 0);
    }

    drawFixedGrid() {
        strokeWeight(1);
        stroke(200);
        // Verical lines
        for (let i = 0; i <= this.size.x; i++) {
            const x = this.cellWidth * i;
            line(x, 0, x, height);
        }
        // Horizontal lines
        for (let i = 0; i <= this.size.y; i++) {
            const y = this.cellHeight * i;
            line(0, y, width, y);
        }
    }

    drawPoints() {
        stroke(0);
        strokeWeight(12);
        for (let x = 0; x <= this.size.x; x++) {
            for (let y = 0; y <= this.size.y; y++) {
                const gridPoint = this.grid[x][y];
                point(gridPoint.x, gridPoint.y);
            }
        }
    }

    drawGrid() {
        curveTightness(0);
        noFill();
        stroke(255);
        strokeWeight(2);
        // vertical
        for (let x = 0; x <= this.size.x; x++) {
            const firstPoint = this.grid[x][0];
            const lastPoint = this.grid[x][this.size.y];
            beginShape();
            curveVertex(firstPoint.x, firstPoint.y);
            for (let y = 0; y <= this.size.y; y++) {
                const gridPoint = this.grid[x][y];
                curveVertex(gridPoint.x, gridPoint.y);
            }
            curveVertex(lastPoint.x, lastPoint.y);
            endShape();
        }

        // horizontal
        for (let y = 0; y <= this.size.y; y++) {
            const firstPoint = this.grid[0][y];
            const lastPoint = this.grid[this.size.x][y];
            beginShape();
            curveVertex(firstPoint.x, firstPoint.y);
            for (let x = 0; x <= this.size.x; x++) {
                const gridPoint = this.grid[x][y];
                curveVertex(gridPoint.x, gridPoint.y);
            }
            curveVertex(lastPoint.x, lastPoint.y);
            endShape();
        }
    }

    drawPieces() {
        for (const piece of this.pieces) {
            piece.draw();
        }
    }
}