import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface CategorySpendingItem {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
}

interface CategoryChartProps {
  categorySpending: CategorySpendingItem[];
  currencyCode: string;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categorySpending,
  currencyCode,
}) => {
  if (categorySpending.length === 0) {
    return (
      <Card padding="lg" style={styles.card}>
        <Text style={styles.title}>Gastos por Categoria</Text>
        <Text style={styles.emptyText}>Nenhuma despesa registrada este mês.</Text>
      </Card>
    );
  }

  return (
    <Card padding="lg" style={styles.card}>
      <Text style={styles.title}>Gastos por Categoria</Text>
      
      <View style={styles.list}>
        {categorySpending.map((item) => {
          const color = item.category_color || colors.textSecondary;
          
          return (
            <View key={item.category_id} style={styles.itemContainer}>
              <View style={styles.metaRow}>
                <View style={styles.leftMeta}>
                  <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
                    <MaterialIcons
                      name={item.category_icon as any || 'more-horiz'}
                      size={16}
                      color={color}
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                </View>
                
                <View style={styles.rightMeta}>
                  <CurrencyDisplay
                    amount={item.total}
                    assetCode={currencyCode}
                    size="sm"
                    color={colors.textPrimary}
                    bold
                  />
                  <Text style={styles.percentageText}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
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
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  list: {
    gap: spacing.lg,
  },
  itemContainer: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  rightMeta: {
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
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.round,
  },
});
