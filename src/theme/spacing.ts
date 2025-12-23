export const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  base: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export type Spacing = keyof typeof spacing;
