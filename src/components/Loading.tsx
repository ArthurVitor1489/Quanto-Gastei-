import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, Platform } from 'react-native';
import { colors } from '@/theme/colors';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  size = 'large',
  color = colors.accent,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const content = (
    <Animated.View style={{ opacity: pulse }}>
      <ActivityIndicator size={size} color={color} />
    </Animated.View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.inline}>{content}</View>;
};

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

export default Loading;
