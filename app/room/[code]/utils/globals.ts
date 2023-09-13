import { ITheme } from '../../../../puzzle/interfaces';

interface Globals {
  scrollDelta: number;
  theme: ITheme;
  isMobile: boolean;
  imageSrc: string;
  imageSmallSrc: string;
  size: string;
}

export const globals: Globals = {
  scrollDelta: 0,
  theme: {} as ITheme,
  isMobile: {} as boolean,
  imageSrc: '',
  imageSmallSrc: '',
  size: 'S',
};
