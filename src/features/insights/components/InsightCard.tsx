import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { Insight, InsightSeverity } from '@/types/insight';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
}

const severityColorMap: Record<InsightSeverity, string> = {
  info: colors.info,
  warning: colors.warning,
  negative: colors.expense,
  positive: colors.success,
};

const severityIconMap: Record<InsightSeverity, string> = {
  info: 'bulb-outline',
  warning: 'warning-outline',
  negative: 'trending-down-outline',
  positive: 'trending-up-outline',
};

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onDismiss,
}) => {
  const severityColor = severityColorMap[insight.severity] || colors.textSecondary;
  const iconName = severityIconMap[insight.severity] || 'bulb-outline';

  const cardBorderColor: ViewStyle = {
    borderColor: `${severityColor}40`,
    borderLeftWidth: 4,
    borderLeftColor: severityColor,
  };

  return (
    <Card padding="md" style={[styles.card, cardBorderColor]}>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${severityColor}12` }]}>
          <Ionicons name={iconName as any} size={20} color={severityColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.description}>{insight.description}</Text>
        </View>

        {onDismiss && (
          <Ionicons
            name="close"
            size={18}
            color={colors.textSecondary}
            onPress={() => onDismiss(insight.id)}
            style={styles.closeIcon}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  closeIcon: {
    padding: 2,
  },
});
