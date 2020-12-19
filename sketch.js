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

    noFill();
    stroke('green');
    strokeWeight(5);
    curveTightness(0);
    strokeJoin(ROUND);
    beginShape();
    vertex(100, 100);
    bezierVertex(110, 130, 90, 180, 100, 200);
    bezierVertex(150, 240, 150, 240, 200, 200);
    // curveVertex(100, 200);
    // endShape();
    // beginShape();
    // curveVertex(100, 200);
    // vertex(100, 200);
    // vertex(200, 200);
    // vertex(200, 200);
    // endShape();
    // beginShape();
    // curveVertex(200, 200);
    // curveVertex(200, 200);
    // curveVertex(200, 100);
    // curveVertex(200, 100);
    // // endShape();
    // // beginShape();
    // curveVertex(200, 100);
    // curveVertex(200, 100);
    // curveVertex(100, 100);
    // curveVertex(100, 100);
    endShape();

    // puzzle.update();
    // puzzle.draw();
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