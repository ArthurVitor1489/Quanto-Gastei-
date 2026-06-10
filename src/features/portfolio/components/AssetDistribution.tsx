import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/components/Card';
import { PortfolioSummary } from '@/types/portfolio';
import { usePortfolioStore } from '@/store/portfolioStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { formatCurrency } from '@/utils/formatters';

interface AssetDistributionProps {
  summary: PortfolioSummary;
}

// Map standard asset codes to specific colors for visual appeal
const ASSET_COLORS: Record<string, string> = {
  BRL: '#2EA043', // Real: Green
  USD: '#58A6FF', // Dollar: Blue
  EUR: '#A371F7', // Euro: Violet
  BTC: '#F7931A', // Bitcoin: Orange
  ETH: '#627EEA', // Ethereum: Indigo
  SOL: '#14F195', // Solana: Teal/Cyan
};

export const getAssetColor = (code: string): string => {
  return ASSET_COLORS[code] || colors.textSecondary;
};

const AssetDistribution: React.FC<AssetDistributionProps> = ({ summary }) => {
  const { displayCurrency } = usePortfolioStore();
  const { items } = summary;

  // Filter items with active balances to show in distribution
  const activeItems = items.filter((item) => item.balance > 0);
  const hasAssets = activeItems.length > 0;

  return (
    <Card style={styles.cardContainer} padding="lg">
      <Text style={styles.title}>Distribuição de Ativos</Text>

      {/* Horizontal Stacked Bar */}
      <View style={styles.barContainer}>
        {hasAssets ? (
          activeItems.map((item, index) => {
            const assetColor = getAssetColor(item.asset.code);
            const isFirst = index === 0;
            const isLast = index === activeItems.length - 1;

            return (
              <View
                key={item.asset.code}
                style={[
                  styles.barSegment,
                  {
                    flex: item.percentage,
                    backgroundColor: assetColor,
                    borderTopLeftRadius: isFirst ? 8 : 0,
                    borderBottomLeftRadius: isFirst ? 8 : 0,
                    borderTopRightRadius: isLast ? 8 : 0,
                    borderBottomRightRadius: isLast ? 8 : 0,
                  },
                ]}
              />
            );
          })
        ) : (
          <View style={[styles.barSegment, { flex: 1, backgroundColor: colors.border }]} />
        )}
      </View>

      {/* Legend Grid */}
      <View style={styles.legendContainer}>
        {hasAssets ? (
          activeItems.map((item) => {
            const assetColor = getAssetColor(item.asset.code);
            const displayValue =
              displayCurrency === 'BRL'
                ? item.value_brl
                : displayCurrency === 'USD'
                ? item.value_usd
                : item.value_brl / 5.65; // EUR_BRL is 5.65

            return (
              <View key={item.asset.code} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.colorDot, { backgroundColor: assetColor }]} />
                  <Text style={styles.assetCode}>{item.asset.code}</Text>
                  <Text style={styles.assetName} numberOfLines={1}>
                    {item.asset.name}
                  </Text>
                </View>

                <View style={styles.legendRight}>
                  <Text style={styles.assetValue}>
                    {formatCurrency(displayValue, displayCurrency)}
                  </Text>
                  <Text style={styles.assetPercentage}>{item.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Nenhum ativo para exibir distribuição.</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  barContainer: {
    height: 16,
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    marginTop: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}50`,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  assetCode: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  assetName: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  assetPercentage: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyText: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

export default AssetDistribution;
