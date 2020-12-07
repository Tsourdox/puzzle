//-----------------------------------------//
//----------------GLOBALS------------------//
let puzzle;
let puzzleImage;
let scrollDelta = 0;
const SPACE = 32;
const COMMA = 188;
const DOT = 190;

//-----------------------------------------//
//----------------MAIN---------------------//

/** P5 calls this function */
function preload() {
    puzzleImage = loadImage('photo.png');
}

/** P5 calls this function */
function setup() {
    createCanvas(windowWidth, windowHeight);
    puzzle = new Puzzle(4, 6, puzzleImage);
}

/** P5 calls this function */
function draw() {
    background(20);
    // Separate logic (update) from ui (draw)!
    puzzle.update();
    puzzle.draw();
    scrollDelta = 0;
}

//-----------------------------------------//
//----------------EVENTS-------------------//

/** P5 calls this function */
function doubleClicked() {
    fullscreen(!fullscreen());
}

/** P5 calls this function */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/** P5 calls this function */
function mouseWheel(event) {
    scrollDelta = event.delta
}