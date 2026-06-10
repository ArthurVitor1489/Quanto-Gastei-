import React, { useCallback, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { getShadowStyle } from '@/theme/shadows';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  size = 56,
  color = '#FFFFFF',
  backgroundColor = colors.accent,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: Platform.OS !== 'web',
      speed: 50,
    }).start();
  }, [scale]);

  const animateOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scale]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          transform: [{ scale }],
        },
        getShadowStyle('lg'),
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        style={[
          styles.pressable,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Ionicons name={icon} size={size * 0.45} color={color} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;
