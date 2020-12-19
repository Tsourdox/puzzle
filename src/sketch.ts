interface IMusic {
    dreaming: p5.SoundFile;
    love: p5.SoundFile;
    journey: p5.SoundFile;
}
interface IImages {
    background: p5.Image;
}

//-----------------------------------------//
//----------------GLOBALS------------------//
let puzzle: Puzzle;
let music: IMusic;
let images: IImages;
let scrollDelta = 0;
const SPACE = 32;
const COMMA = 188;
const DOT = 190;


/**
 * Built in preload function in P5
 * This is a good place to load assets such as
 * sound files, images etc...
 */
function preload() {
    music = {
        dreaming: loadSound('../assets/music/dreaming-big.mp3'),
        love: loadSound('../assets/music/love-in-the-air.mp3'),
        journey: loadSound('../assets/music/the-journey.mp3')
    }

    images = {
        background: loadImage('../assets/images/photo.png')
    }
}

/**
 * Built in setup function in P5
 * This is a good place to create your first class object
 * and save it as a global variable so it can be used
 * in the draw function below
 */
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    puzzle = new Puzzle(4, 6, images.background);
}

/**
 * Built in draw function in P5
 * This is a good place to call public methods of the object
 * you created in the setup function above
 */
function draw() {
    puzzle.update();
    puzzle.draw();
}


/**
 *  Built in windowResize listener function in P5
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    music.dreaming.play();
}