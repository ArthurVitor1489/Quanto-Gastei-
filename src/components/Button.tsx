import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

const variantStyles: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.income, text: '#FFFFFF', border: 'transparent' },
  secondary: { bg: colors.accent, text: '#FFFFFF', border: 'transparent' },
  outline: { bg: 'transparent', text: colors.accent, border: colors.accent },
  ghost: { bg: 'transparent', text: colors.textSecondary, border: 'transparent' },
  danger: { bg: colors.expense, text: '#FFFFFF', border: 'transparent' },
};

const sizeConfig: Record<Size, { h: number; px: number; fs: number; icon: number }> = {
  sm: { h: 36, px: spacing.md, fs: fontSize.sm, icon: 14 },
  md: { h: 44, px: spacing.lg, fs: fontSize.md, icon: 18 },
  lg: { h: 52, px: spacing.xxl, fs: fontSize.lg, icon: 20 },
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const vStyle = variantStyles[variant];
  const sConfig = sizeConfig[size];
  const isDisabled = disabled || loading;

  const animateIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: Platform.OS !== 'web', speed: 50 }).start();
  }, [scale]);

  const animateOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 50 }).start();
  }, [scale]);

  const containerStyle: ViewStyle = {
    height: sConfig.h,
    paddingHorizontal: sConfig.px,
    backgroundColor: isDisabled ? colors.surface : vStyle.bg,
    borderColor: isDisabled ? colors.border : vStyle.border,
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderRadius: 10,
  };

  const textColor = isDisabled ? colors.textSecondary : vStyle.text;

  const renderIcon = () => {
    if (!icon || loading) return null;
    return (
      <Ionicons
        name={icon}
        size={sConfig.icon}
        color={textColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        disabled={isDisabled}
        style={[styles.container, containerStyle]}
      >
        {iconPosition === 'left' && renderIcon()}
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[styles.text, { color: textColor, fontSize: sConfig.fs }]}>
            {title}
          </Text>
        )}
        {iconPosition === 'right' && renderIcon()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily,
    fontWeight: fontWeight.semibold,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
