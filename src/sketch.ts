interface IMusic {
    dreaming: p5.SoundFile;
    love: p5.SoundFile;
    journey: p5.SoundFile;
}
interface ISound {
    snaps: p5.SoundFile[];
}
interface IImages {
    face: p5.Image;
    scull: p5.Image;
}
interface IFonts {
    icons: p5.Font;
}

//-----------------------------------------//
//----------------GLOBALS------------------//
const IS_DEV_MODE = false;
let puzzle: Puzzle;
let music: IMusic;
let sounds: ISound;
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
    sounds = {
        snaps: [
            loadSound('../assets/sounds/snap0.wav'),
            loadSound('../assets/sounds/snap1.wav'),
            loadSound('../assets/sounds/snap2.wav'),
            loadSound('../assets/sounds/snap3.wav'),
        ]
    }
    images = {
        face: loadImage('../assets/images/face.png'),
        scull: loadImage('../assets/images/scull.png')
    }
    fonts = {
        icons: loadFont('../assets/fonts/font-awesome.otf')
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);
    sounds.snaps[0].setVolume(0.8);
    sounds.snaps[1].setVolume(0.1);
    sounds.snaps[2].setVolume(0.5);
    sounds.snaps[3].setVolume(0.1);

    puzzle = new Puzzle();
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
    scrollDelta = event.delta;
    return false;
}

function mousePressed() {
    // if (!music.love.isPlaying()) {
    //     music.love.setVolume(0.5);
    //     music.love.loop();
    // }
}

// Prevent context menu when right clicking
document.oncontextmenu = () => false;