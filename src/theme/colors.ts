export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  sage: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primaryTint: string;
  gold: string;
  goldTint: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  danger: string;
  dangerTint: string;
  success: string;
  canvas: string;
  canvasLine: string;
  guide: string;
  shadow: string;
  tabBar: string;
};

export const brand = {
  emerald: '#145C45',
  ivory: '#F8F5EC',
  gold: '#C6A15B',
  charcoal: '#252A27',
  sage: '#DCE8DF',
  white: '#FFFFFF',
};

export const light: Palette = {
  bg: brand.ivory,
  surface: brand.white,
  surfaceAlt: '#F1EDE1',
  sage: brand.sage,
  primary: brand.emerald,
  primaryPressed: '#0E4433',
  onPrimary: brand.white,
  primaryTint: '#E3EEE7',
  gold: '#A9843F',
  goldTint: '#F4EAD3',
  text: brand.charcoal,
  textMuted: '#5C655F',
  textFaint: '#8C948E',
  border: '#E7E1D2',
  danger: '#A63A2B',
  dangerTint: '#F7E3DF',
  success: '#23744F',
  canvas: '#FFFDF7',
  canvasLine: '#EFE8D6',
  guide: brand.charcoal,
  shadow: '#1B2A22',
  tabBar: brand.white,
};

export const dark: Palette = {
  bg: '#0F1513',
  surface: '#17201C',
  surfaceAlt: '#1D2823',
  sage: '#22332B',
  primary: '#2E8A66',
  primaryPressed: '#24714F',
  onPrimary: brand.white,
  primaryTint: '#1C3229',
  gold: '#D6B676',
  goldTint: '#2D2719',
  text: '#ECE8DD',
  textMuted: '#A6AEA8',
  textFaint: '#6F7872',
  border: '#28332E',
  danger: '#E07A68',
  dangerTint: '#3A221D',
  success: '#5CC294',
  // The writing slate stays paper-coloured in dark mode so ink colours read the same.
  canvas: '#F6F1E3',
  canvasLine: '#E6DDC6',
  guide: brand.charcoal,
  shadow: '#000000',
  tabBar: '#141C19',
};

export const inkColors = [
  { name: 'Emerald', value: '#145C45' },
  { name: 'Ink', value: '#252A27' },
  { name: 'Gold', value: '#9C7630' },
  { name: 'Indigo', value: '#2E4A8C' },
  { name: 'Crimson', value: '#9B2F3A' },
];

export const penSizes = [
  { name: 'Fine', value: 5 },
  { name: 'Medium', value: 9 },
  { name: 'Bold', value: 14 },
];
