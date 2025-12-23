const palette = {
  background: "#FFFFFF",
  foreground: "hsl(222.2 84% 4.9%)",

  primary: "#F97216",
  black: "#000000",
  white: "#FFFFFF",
  primaryForeground: "#E7FDF3",
  primaryDisabled: "hsla(24, 95%, 53%, 0.5)",

  secondary: "hsl(220 14.3% 95.9%)",
  secondaryForeground: "hsl(220.9 39.3% 11%)",

  accent: "hsla(285 33% 47% / 0.05)",

  muted: "hsl(220 14.3% 95.9%)",
  mutedForeground: "hsl(220 8.9% 46.1%)",

  destructive: "#E73323",
  destructiveForeground: "hsl(0 79% 63%)",

  info: "rgba(30, 131, 197, 1)",
  infoForeground: "rgba(30, 131, 197, 0.05)",

  success: "hsla(116 45% 50% 1)",
  successForeground: "hsl(155 100% 40%)",

  border: "rgba(99, 99, 99, 0.1)",
  input: "hsl(220 13% 91%)",
  ring: "hsl(224 71.4% 4.1%)",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const;

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  lightColor:'#63636380',

  background: palette.background,
  foreground: palette.foreground,

  primary: palette.primary,
  white: palette.white,
  black: palette.black,
  primaryForeground: palette.primaryForeground,

  secondary: palette.secondary,
  secondaryForeground: palette.secondaryForeground,

  accent: palette.accent,
  accentForeground: palette.primary,

  muted: palette.muted,
  mutedForeground: palette.mutedForeground,

  destructive: palette.destructive,
  destructiveForeground: palette.destructiveForeground,

  success: palette.success,
  successForeground: palette.successForeground,

  info: palette.info,
  infoForeground: palette.infoForeground,

  border: palette.border,
};
