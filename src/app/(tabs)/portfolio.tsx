import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import CurrencySelector from '@/features/portfolio/components/CurrencySelector';
import PortfolioTotal from '@/features/portfolio/components/PortfolioTotal';
import AssetDistribution from '@/features/portfolio/components/AssetDistribution';
import AssetCard from '@/features/portfolio/components/AssetCard';
import { PortfolioHistoryChart } from '@/features/portfolio/components/PortfolioHistoryChart';
import { usePortfolio, usePortfolioHistory } from '@/features/portfolio/hooks/usePortfolio';
import { usePortfolioStore } from '@/store/portfolioStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

export default function PortfolioScreen() {
  const { data: summary, isLoading, isError, refetch } = usePortfolio();
  const { data: history, refetch: refetchHistory } = usePortfolioHistory();
  const { displayCurrency } = usePortfolioStore();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchHistory();
    }, [refetch, refetchHistory])
  );

  // Filter items that have a positive active balance
  const activeItems = summary?.items.filter((item) => item.balance > 0) || [];
  const hasAssets = activeItems.length > 0;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const renderHeader = () => {
    if (!summary) return null;
    return (
      <View style={styles.listHeader}>
        <PortfolioTotal summary={summary} />
        {history && history.length > 0 && (
          <PortfolioHistoryChart history={history} currencyCode={displayCurrency} />
        )}
        <AssetDistribution summary={summary} />
        <Text style={styles.sectionTitle}>Seus Ativos</Text>
      </View>
    );
  };


  return (
    <ScreenContainer padding={false}>
      {/* Custom Premium Header Row */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Patrimônio</Text>
        <CurrencySelector />
      </View>

      {summary && hasAssets ? (
        <FlatList
          data={activeItems}
          keyExtractor={(item) => item.asset.id}
          renderItem={({ item }) => <AssetCard item={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="wallet-outline"
            title="Nenhum ativo no momento"
            description="Seus ativos e investimentos aparecerão aqui assim que você registrar suas transações de receita ou investimentos."
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontFamily,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});
