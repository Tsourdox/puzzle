import { ITheme } from '../../../../puzzle/interfaces';

interface Globals {
  scrollDelta: number;
  theme: ITheme;
  isMobile: boolean;
}

export const globals: Globals = {
  scrollDelta: 0,
  theme: {} as ITheme,
  isMobile: {} as boolean,
};
