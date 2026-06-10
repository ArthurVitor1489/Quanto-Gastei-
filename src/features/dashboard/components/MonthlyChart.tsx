import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface MonthlyBreakdownItem {
  month: string;
  monthKey: string;
  income: number;
  expense: number;
}

interface MonthlyChartProps {
  monthlyBreakdown: MonthlyBreakdownItem[];
  currencyCode: string;
}

const CHART_HEIGHT = 140;

export const MonthlyChart: React.FC<MonthlyChartProps> = ({
  monthlyBreakdown,
  currencyCode,
}) => {
  // Find maximum value to scale heights properly
  const maxAmount = Math.max(
    ...monthlyBreakdown.flatMap((item) => [item.income, item.expense]),
    1 // fallback to avoid division by zero
  );

  return (
    <Card padding="lg" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico Mensal</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={styles.legendText}>Entradas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={styles.legendText}>Saídas</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {monthlyBreakdown.map((item) => {
            const incomeHeight = (item.income / maxAmount) * CHART_HEIGHT;
            const expenseHeight = (item.expense / maxAmount) * CHART_HEIGHT;
            const shortMonth = item.month.split(' ')[0].slice(0, 3);

            return (
              <View key={item.monthKey} style={styles.column}>
                {/* Visual columns representation container */}
                <View style={styles.barsRow}>
                  {/* Income bar */}
                  <View style={styles.barWrapper}>
                    {item.income > 0 && (
                      <View
                        style={[
                          styles.bar,
                          {
                            backgroundColor: colors.income,
                            height: Math.max(4, incomeHeight),
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* Expense bar */}
                  <View style={styles.barWrapper}>
                    {item.expense > 0 && (
                      <View
                        style={[
                          styles.bar,
                          {
                            backgroundColor: colors.expense,
                            height: Math.max(4, expenseHeight),
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>

                {/* X-axis labels */}
                <Text style={styles.xAxisLabel}>
                  {shortMonth}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Mini summary for current month */}
      {monthlyBreakdown.length > 0 && (
        <View style={styles.footerSummary}>
          <Text style={styles.footerText}>
            Diferença no último mês:{' '}
          </Text>
          <CurrencyDisplay
            amount={
              monthlyBreakdown[monthlyBreakdown.length - 1].income -
              monthlyBreakdown[monthlyBreakdown.length - 1].expense
            }
            assetCode={currencyCode}
            size="sm"
            color={
              monthlyBreakdown[monthlyBreakdown.length - 1].income >=
              monthlyBreakdown[monthlyBreakdown.length - 1].expense
                ? colors.incomeLight
                : colors.expenseLight
            }
            bold
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chartContainer: {
    height: CHART_HEIGHT + 30,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: CHART_HEIGHT,
  },
  barWrapper: {
    height: '100%',
    justifyContent: 'flex-end',
    width: 14,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: borderRadius.xs,
    borderTopRightRadius: borderRadius.xs,
  },
  xAxisLabel: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
