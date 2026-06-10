import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface BalanceCardProps {
  netCashflow: number;
  totalIncome: number;
  totalExpense: number;
  currencyCode: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  netCashflow,
  totalIncome,
  totalExpense,
  currencyCode,
}) => {
  const isPositive = netCashflow >= 0;

  return (
    <Card padding="lg" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Saldo do Mês</Text>
        <View style={[styles.pill, { backgroundColor: isPositive ? `${colors.income}20` : `${colors.expense}20` }]}>
          <Text style={[styles.pillText, { color: isPositive ? colors.incomeLight : colors.expenseLight }]}>
            {isPositive ? 'Positivo' : 'Negativo'}
          </Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <CurrencyDisplay
          amount={netCashflow}
          assetCode={currencyCode}
          size="xxl"
          color={isPositive ? colors.textPrimary : colors.expenseLight}
          bold
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <View>
            <Text style={styles.statLabel}>Receitas</Text>
            <CurrencyDisplay
              amount={totalIncome}
              assetCode={currencyCode}
              size="md"
              color={colors.incomeLight}
              bold
            />
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.statItem}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <View>
            <Text style={styles.statLabel}>Despesas</Text>
            <CurrencyDisplay
              amount={totalExpense}
              assetCode={currencyCode}
              size="md"
              color={colors.expenseLight}
              bold
            />
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.xs,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  balanceContainer: {
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
