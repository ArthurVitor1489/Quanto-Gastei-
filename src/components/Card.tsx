import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { getShadowStyle } from '@/theme/shadows';

type PaddingVariant = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  padding?: PaddingVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const paddingMap: Record<PaddingVariant, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.lg,
  lg: spacing.xxl,
};

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  style,
  onPress,
}) => {
  const cardStyle: ViewStyle = {
    padding: paddingMap[padding],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, cardStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...getShadowStyle('sm'),
  },
  pressed: {
    backgroundColor: colors.cardHover,
  },
});

export default Card;
