import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AssetIcon from '@/components/AssetIcon';
import { PortfolioItem } from '@/types/portfolio';
import { usePortfolioStore } from '@/store/portfolioStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { getAssetSymbol, formatAssetAmount } from '@/utils/currencyHelpers';
import { formatCurrency } from '@/utils/formatters';

interface AssetCardProps {
  item: PortfolioItem;
}

const AssetCard: React.FC<AssetCardProps> = ({ item }) => {
  const { displayCurrency } = usePortfolioStore();

  // Convert the asset value to display currency
  const displayValue =
    displayCurrency === 'BRL'
      ? item.value_brl
      : displayCurrency === 'USD'
      ? item.value_usd
      : item.value_brl / 5.65; // EUR_BRL is 5.65

  const formattedDisplayValue = formatCurrency(displayValue, displayCurrency);
  const assetSymbol = getAssetSymbol(item.asset.code);
  const formattedNativeBalance = `${assetSymbol} ${formatAssetAmount(item.balance, item.asset.code)}`;

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <AssetIcon code={item.asset.code} size="md" />
        <View style={styles.textContainer}>
          <Text style={styles.codeText}>{item.asset.code}</Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.asset.name}
          </Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text style={styles.valueText}>{formattedDisplayValue}</Text>
        <Text style={styles.detailsText} numberOfLines={1}>
          {formattedNativeBalance} <Text style={styles.percentageText}>({item.percentage.toFixed(1)}%)</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  codeText: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  nameText: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  detailsText: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  percentageText: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
});

export default AssetCard;
