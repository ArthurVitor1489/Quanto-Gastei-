import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  currencyCode: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  currencyCode,
}) => {
  return (
    <View style={styles.container}>
      <Card padding="md" style={[styles.card, styles.incomeCard]}>
        <Text style={styles.label}>Entradas</Text>
        <View style={styles.valueRow}>
          <CurrencyDisplay
            amount={totalIncome}
            assetCode={currencyCode}
            size="lg"
            color={colors.incomeLight}
            bold
          />
        </View>
      </Card>

      <Card padding="md" style={[styles.card, styles.expenseCard]}>
        <Text style={styles.label}>Saídas</Text>
        <View style={styles.valueRow}>
          <CurrencyDisplay
            amount={totalExpense}
            assetCode={currencyCode}
            size="lg"
            color={colors.expenseLight}
            bold
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  card: {
    flex: 1,
    borderWidth: 1,
  },
  incomeCard: {
    borderColor: `${colors.income}30`,
    backgroundColor: `${colors.income}08`,
  },
  expenseCard: {
    borderColor: `${colors.expense}30`,
    backgroundColor: `${colors.expense}08`,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
