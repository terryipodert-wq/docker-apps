import { StyleSheet } from 'react-native';
import tokens, {
  ColorTokens,
  FontTokens,
  SpaceTokens,
  RadiusTokens,
  ShadowTokens,
  ComponentTokens,
  MotionTokens,
} from './tokens';

export const lightTheme = {
  dark: false,
  colors: {
    primary: ColorTokens.accent.mauve,
    background: ColorTokens.bg.canvas,
    card: ColorTokens.bg.surface,
    text: ColorTokens.text.primary,
    border: ColorTokens.bg.soft,
    notification: ColorTokens.accent.terracotta,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: ColorTokens.accent.mauve,
    background: '#1A1A1A',
    card: '#2E2E2E',
    text: '#F6F4F1',
    border: '#3E3E3E',
    notification: ColorTokens.accent.terracotta,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  safeArea: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: ColorTokens.bg.canvas,
    padding: SpaceTokens.md,
  },
  card: {
    backgroundColor: ColorTokens.bg.surface,
    borderRadius: RadiusTokens.md,
    padding: ComponentTokens.card.padding,
    ...ShadowTokens.soft,
  },
  cardPressed: {
    ...ShadowTokens.hover,
    transform: [{ scale: MotionTokens.transform.scaleSoft }],
  },
  h1: {
    fontSize: FontTokens.size.h1,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    lineHeight: FontTokens.size.h1 * FontTokens.lineHeight.tight,
  },
  h2: {
    fontSize: FontTokens.size.h2,
    fontWeight: FontTokens.weight.semibold,
    color: ColorTokens.text.primary,
    lineHeight: FontTokens.size.h2 * FontTokens.lineHeight.tight,
  },
  h3: {
    fontSize: FontTokens.size.h3,
    fontWeight: FontTokens.weight.medium,
    color: ColorTokens.text.primary,
    lineHeight: FontTokens.size.h3 * FontTokens.lineHeight.normal,
  },
  body: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.regular,
    color: ColorTokens.text.primary,
    lineHeight: FontTokens.size.body * FontTokens.lineHeight.normal,
  },
  bodySecondary: {
    fontSize: FontTokens.size.body,
    fontWeight: FontTokens.weight.regular,
    color: ColorTokens.text.secondary,
    lineHeight: FontTokens.size.body * FontTokens.lineHeight.normal,
  },
  caption: {
    fontSize: FontTokens.size.caption,
    fontWeight: FontTokens.weight.regular,
    color: ColorTokens.text.muted,
    lineHeight: FontTokens.size.caption * FontTokens.lineHeight.normal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: ColorTokens.bg.soft,
    marginVertical: SpaceTokens.md,
  },
});

export { tokens, ColorTokens, FontTokens, SpaceTokens, RadiusTokens, ShadowTokens, ComponentTokens, MotionTokens };

export default tokens;
