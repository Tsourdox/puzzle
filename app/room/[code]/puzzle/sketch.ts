//-----------------------------------------//
//----------------GLOBALS------------------//
let puzzle: Puzzle;
let music: IMusic;
let sounds: ISound;
let fonts: IFonts;
let scrollDelta = 0;
let theme: ITheme;
let isMobile: boolean;

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
            loadSound('../assets/sounds/snap/snap0.wav'),
            loadSound('../assets/sounds/snap/snap1.wav'),
            loadSound('../assets/sounds/snap/snap2.wav'),
            loadSound('../assets/sounds/snap/snap3.wav'),
        ],
        aboutToPuzzelin: loadSound('../assets/sounds/about-to-puzzelin.m4a'),
        puzzelin: loadSound('../assets/sounds/puzzelin.m4a'),
    }
    fonts = {
        primary: loadFont('../assets/fonts/black-ops-one.ttf'),
        icons: loadFont('../assets/fonts/font-awesome.otf')
    }
}

function setup() {
    preventDefaultEvents();
    createCanvas(windowWidth, windowHeight);
    frameRate(120);
    getThemeFromCSS();
    setSoundVolumes();
    isMobile = windowWidth < 600;

    puzzle = new Puzzle();
}

function draw() {
    if (window.innerWidth !== width || window.innerHeight !== height) {
        setFullScreenCanvas();
        isMobile = windowWidth < 600;
    }
    puzzle.update();
    puzzle.draw();
    scrollDelta = 0;
}

function setSoundVolumes() {
    sounds.snaps[0].setVolume(0.8);
    sounds.snaps[1].setVolume(0.1);
    sounds.snaps[2].setVolume(0.5);
    sounds.snaps[3].setVolume(0.1);
    sounds.aboutToPuzzelin.setVolume(0.5);
    sounds.puzzelin.setVolume(0.5);
}

function getThemeFromCSS() {
    const rootStyle = getComputedStyle(document.documentElement);
    theme = {
        primary: rootStyle.getPropertyValue('--primary'),
        darkened: rootStyle.getPropertyValue('--darkened'),
        neutral: rootStyle.getPropertyValue('--neutral'),
        background: rootStyle.getPropertyValue('--background'),
        backdrop: rootStyle.getPropertyValue('--backdrop'),
        darkdrop: rootStyle.getPropertyValue('--darkdrop'),
    };
}

function setFullScreenCanvas() {
    const main = document.querySelector('main');
    const width = main?.clientWidth || window.innerWidth;
    const height = main?.clientHeight || window.innerHeight;
    resizeCanvas(width, height, true);
}

//-----------------------------------------//
//----------------EVENTS-------------------//
function mouseWheel(event: any) {
    scrollDelta = event.delta;
    return false;
}

function mousePressed() {
    (window as any).userStartAudio();
    // if (!music.love.isPlaying()) {
    //     music.love.setVolume(0.5);
    //     music.love.loop();
    // }
}

function preventDefaultEvents() {
    // Prevent context menu when right clicking
    document.oncontextmenu = () => false;
    // Prenent magnifying glass
    document.querySelector('canvas')?.addEventListener("touchstart", (e) =>
        e.preventDefault()
    );
}