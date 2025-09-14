import { lightColors, darkColors, ColorScheme } from './colors';
import { typography, Typography } from './typography';

export interface Theme {
  colors: ColorScheme;
  typography: Typography;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  isDark: true,
};

export { lightColors, darkColors, typography };
export type { ColorScheme, Typography };