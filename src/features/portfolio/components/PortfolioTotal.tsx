import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { usePortfolioStore } from '@/store/portfolioStore';
import { PortfolioSummary } from '@/types/portfolio';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { formatCurrency } from '@/utils/formatters';

interface PortfolioTotalProps {
  summary: PortfolioSummary;
}

const PortfolioTotal: React.FC<PortfolioTotalProps> = ({ summary }) => {
  const { displayCurrency } = usePortfolioStore();

  // Determine the net worth amount based on the selected display currency
  const totalAmount =
    displayCurrency === 'BRL'
      ? summary.total_brl
      : displayCurrency === 'USD'
      ? summary.total_usd
      : summary.total_eur;

  // Format cash and investment totals
  const formattedCash = formatCurrency(summary.cash_total, displayCurrency);
  const formattedInvestments = formatCurrency(summary.investment_total, displayCurrency);

  return (
    <Card style={styles.cardContainer} padding="lg">
      <View style={styles.header}>
        <Text style={styles.title}>Patrimônio Líquido</Text>
      </View>

      <View style={styles.amountContainer}>
        <CurrencyDisplay
          amount={totalAmount}
          assetCode={displayCurrency}
          size="xxl"
          color={colors.textPrimary}
          bold
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Saldo</Text>
          <Text style={styles.breakdownValue}>{formattedCash}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Investimentos</Text>
          <Text style={styles.breakdownValue}>{formattedInvestments}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: `${colors.accent}40`, // Subtle premium accent blue border tint
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountContainer: {
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
});

export default PortfolioTotal;
