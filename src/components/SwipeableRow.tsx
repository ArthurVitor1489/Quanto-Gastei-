import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

const ACTION_WIDTH = 72;
const TOTAL_ACTIONS_WIDTH = ACTION_WIDTH * 2;
const SWIPE_THRESHOLD = TOTAL_ACTIONS_WIDTH / 2;

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onEdit,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        const newVal = Math.min(0, Math.max(-TOTAL_ACTIONS_WIDTH, lastOffset.current + gesture.dx));
        translateX.setValue(newVal);
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldOpen =
          gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -0.5;
        const toValue = shouldOpen ? -TOTAL_ACTIONS_WIDTH : 0;
        lastOffset.current = toValue;
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: Platform.OS !== 'web',
          speed: 20,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  const close = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
      speed: 20,
    }).start();
  };

  const handleEdit = () => {
    close();
    onEdit?.();
  };

  const handleDelete = () => {
    close();
    onDelete?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        {onEdit && (
          <Pressable
            onPress={handleEdit}
            style={[styles.action, styles.editAction]}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={handleDelete}
            style={[styles.action, styles.deleteAction]}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        )}
      </View>
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editAction: {
    backgroundColor: colors.accent,
  },
  deleteAction: {
    backgroundColor: colors.expense,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  actionText: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: '#FFFFFF',
  },
  content: {
    backgroundColor: colors.card,
  },
});

export default SwipeableRow;
