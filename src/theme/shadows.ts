/**
 * Quanto Gastei? - Shadows
 * Dark theme shadow presets for card elevation.
 */

import { Platform, ViewStyle } from 'react-native';

interface ShadowPreset {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ShadowPreset => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows = {
  sm: createShadow(1, 0.3, 2, 2),
  md: createShadow(2, 0.4, 4, 4),
  lg: createShadow(4, 0.5, 8, 8),
} as const;

export type ShadowToken = keyof typeof shadows;

/**
 * Returns platform-appropriate shadow styles.
 * Android uses elevation; iOS uses shadow* properties.
 */
export const getShadowStyle = (size: ShadowToken): ViewStyle => {
  const shadow = shadows[size];

  if (Platform.OS === 'android') {
    return { elevation: shadow.elevation };
  }

  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${shadow.shadowOffset.height}px ${shadow.shadowRadius}px rgba(0, 0, 0, ${shadow.shadowOpacity})`,
    } as any;
  }

  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
  };
};
