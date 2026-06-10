import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { CategoryReportItem } from '@/types/report';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface CategoryReportProps {
  categories: CategoryReportItem[];
  currencyCode: string;
}

export const CategoryReport: React.FC<CategoryReportProps> = ({
  categories,
  currencyCode,
}) => {
  if (categories.length === 0) {
    return (
      <Card padding="lg" style={styles.card}>
        <Text style={styles.emptyText}>Sem despesas registradas no período.</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {categories.map((item) => {
        const color = item.category_color || colors.textSecondary;

        return (
          <Card key={item.category_id} padding="md" style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.leftInfo}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
                  <MaterialIcons
                    name={item.category_icon as any || 'more-horiz'}
                    size={18}
                    color={color}
                  />
                </View>
                <View>
                  <Text style={styles.nameText}>{item.category_name}</Text>
                  <Text style={styles.metaText}>
                    {item.transaction_count} {item.transaction_count === 1 ? 'transação' : 'transações'}
                  </Text>
                </View>
              </View>

              <View style={styles.rightInfo}>
                <CurrencyDisplay
                  amount={item.total}
                  assetCode={currencyCode}
                  size="md"
                  color={colors.textPrimary}
                  bold
                />
                <Text style={styles.percentageText}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Progress bar track */}
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: color,
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                  },
                ]}
              />
            </View>

            {/* Sub-meta details */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Média por transação:</Text>
              <CurrencyDisplay
                amount={item.average_per_transaction}
                assetCode={currencyCode}
                size="sm"
                color={colors.textSecondary}
                bold={false}
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  nameText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  percentageText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  track: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.round,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: spacing.sm,
  },
  footerLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
