/**
 * Clean Watercolor Design Tokens
 * Design Token System for React Native
 * Focus: clean, watercolor, grainy, calm motion
 */

export const ColorTokens = {
  bg: {
    canvas: '#F6F4F1',
    surface: '#FFFFFF',
    soft: '#EEEAE5',
  },
  text: {
    primary: '#2E2E2E',
    secondary: '#6B6B6B',
    muted: '#9A9A9A',
  },
  accent: {
    mauve: '#7A6EAA',
    olive: '#8A8C68',
    terracotta: '#C47A5A',
    mint: '#A7C4B8',
  },
  state: {
    success: '#7FAF9B',
    warning: '#E1B07E',
    error: '#D17C7C',
  },
};

export const FontTokens = {
  family: {
    heading: 'System',
    body: 'System',
  },
  size: {
    h1: 48,
    h2: 32,
    h3: 24,
    body: 16,
    caption: 12,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.7,
  },
};

export const SpaceTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const RadiusTokens = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const ShadowTokens = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  hover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const TextureTokens = {
  grain: {
    light: {
      opacity: 0.05,
    },
    medium: {
      opacity: 0.08,
    },
  },
};

export const ComponentTokens = {
  button: {
    height: 44,
    paddingX: 20,
    fontWeight: '500',
  },
  card: {
    padding: 24,
    radius: RadiusTokens.md,
    shadow: ShadowTokens.soft,
  },
};

export const MotionTokens = {
  duration: {
    fast: 120,
    normal: 280,
    slow: 500,
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1],
  },
  transform: {
    driftY: 12,
    scaleSoft: 0.98,
  },
};

export const IconTokens = {
  stroke: 1.5,
  radius: 2,
  style: 'rounded-outline',
};

export default {
  colors: ColorTokens,
  fonts: FontTokens,
  space: SpaceTokens,
  radius: RadiusTokens,
  shadow: ShadowTokens,
  texture: TextureTokens,
  component: ComponentTokens,
  motion: MotionTokens,
  icon: IconTokens,
};
