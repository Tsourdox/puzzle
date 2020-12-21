(p5 as any).disableFriendlyErrors = false; // disables FES

interface IMusic {
    dreaming: p5.SoundFile;
    love: p5.SoundFile;
    journey: p5.SoundFile;
}
interface IImages {
    background: p5.Image;
}

interface IFonts {
    icons: p5.Font;
}

//-----------------------------------------//
//----------------GLOBALS------------------//
const IS_DEV_MODE = false;
let puzzle: Puzzle;
let music: IMusic;
let images: IImages;
let fonts: IFonts;
let scrollDelta = 0;

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
    fonts = {
        icons: loadFont('../assets/fonts/font-awesome.otf')
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    puzzle = new Puzzle(30, 30, images.background);
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