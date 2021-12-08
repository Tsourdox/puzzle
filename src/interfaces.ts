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
    primary: p5.Font;
    icons: p5.Font;
}

interface ITheme {
    primary: string;
    darkened: string;
    neutral: string;
    background: string;
    backdrop: string;
}