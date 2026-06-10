import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import EmptyState from '@/components/EmptyState';
import { InsightCard } from '@/features/insights/components/InsightCard';
import { useInsights } from '@/features/insights/hooks/useInsights';
import { useUiStore } from '@/store/uiStore';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { Insight } from '@/types/insight';

export default function InsightsScreen() {
  const { data: insightsData, isLoading, error, refetch } = useInsights();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [activeInsights, setActiveInsights] = useState<Insight[]>([]);
  const { addNotification } = useUiStore();

  // Update local state when query data changes
  useEffect(() => {
    if (insightsData) {
      setActiveInsights(insightsData);
    }
  }, [insightsData]);

  const handleDismiss = (id: string) => {
    setActiveInsights((prev) => prev.filter((item) => item.id !== id));
    addNotification('Recomendação ocultada', 'info', 1500);
  };

  const handleRefresh = async () => {
    await refetch();
    addNotification('Insights atualizados', 'success', 1500);
  };

  return (
    <ScreenContainer scroll padding>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights IA</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Analisando seu patrimônio...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.expense} />
          <Text style={styles.errorText}>Erro ao carregar análises financeiras.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : activeInsights.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="bulb"
            title="Tudo em Ordem"
            description="Não detectamos nenhum comportamento de risco ou anormalidade no seu perfil financeiro. Continue controlando suas despesas!"
          />
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.subtitle}>
            Análise em tempo real de seus hábitos de consumo e alocação de portfólio.
          </Text>
          {activeInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: spacing.huge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  errorContainer: {
    paddingVertical: spacing.huge,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.expenseLight,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    marginTop: spacing.xl,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
});
