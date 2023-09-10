import { IFonts, IMusic, ISound, ITheme } from './puzzle/interfaces';

interface Globals {
  music: IMusic;
  sounds: ISound;
  fonts: IFonts;
  scrollDelta: number;
  theme: ITheme;
  isMobile: boolean;
}

export const globals = {
  music: {} as IMusic,
  sounds: {} as ISound,
  fonts: {} as IFonts,
  scrollDelta: 0,
  theme: {} as ITheme,
  isMobile: {} as boolean,
};
