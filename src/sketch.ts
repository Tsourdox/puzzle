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
const KEY_A = 65;
const KEY_W = 87;
const KEY_D = 68;
const KEY_S = 83;

//-----------------------------------------//
//------------MAIN P5 FUNCTIONS------------//
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

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    puzzle = new Puzzle(4, 6, images.background);
}

function draw() {
    puzzle.update();
    puzzle.draw();
    scrollDelta = 0;
}


//-----------------------------------------//
//----------------EVENTS-------------------//
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel(event: any) {
    scrollDelta = event.delta
}

function mousePressed() {
    // if (!music.love.isPlaying()) {
    //     music.love.setVolume(0.5);
    //     music.love.loop();
    // }
}