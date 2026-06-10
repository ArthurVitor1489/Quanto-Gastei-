import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/Card';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { CategoryReport } from '@/features/reports/components/CategoryReport';
import { useReports } from '@/features/reports/hooks/useReports';
import { PeriodType } from '@/features/reports/services/reportService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

interface PeriodOption {
  label: string;
  value: PeriodType;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: 'Este Mês', value: 'month' },
  { label: '3 Meses', value: '3months' },
  { label: '6 Meses', value: '6months' },
  { label: 'Este Ano', value: 'year' },
];

export default function ReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const { profile } = useAuthStore();
  const currencyCode = profile?.default_currency || 'BRL';

  const { data, isLoading, error, refetch } = useReports(selectedPeriod);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderPeriodSelector = () => {
    return (
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {PERIOD_OPTIONS.map((option) => {
            const isSelected = selectedPeriod === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pill,
                  isSelected && styles.pillSelected,
                ]}
                onPress={() => setSelectedPeriod(option.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected && styles.pillTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderSummaryCard = () => {
    if (!data) return null;

    const isPositive = data.net_balance >= 0;

    return (
      <Card padding="lg" style={styles.summaryCard}>
        <Text style={styles.periodLabel}>{data.period.label}</Text>
        
        <View style={styles.balanceSection}>
          <Text style={styles.balanceTitle}>Resultado Líquido</Text>
          <CurrencyDisplay
            amount={data.net_balance}
            assetCode={currencyCode}
            size="xl"
            color={isPositive ? colors.incomeLight : colors.expenseLight}
            bold
          />
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.gridItem}>
            <View style={styles.rowAlign}>
              <View style={[styles.dot, { backgroundColor: colors.income }]} />
              <Text style={styles.gridLabel}>Total Recebido</Text>
            </View>
            <CurrencyDisplay
              amount={data.total_income}
              assetCode={currencyCode}
              size="md"
              color={colors.incomeLight}
              bold
            />
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.gridItem}>
            <View style={styles.rowAlign}>
              <View style={[styles.dot, { backgroundColor: colors.expense }]} />
              <Text style={styles.gridLabel}>Total Gasto</Text>
            </View>
            <CurrencyDisplay
              amount={data.total_expense}
              assetCode={currencyCode}
              size="md"
              color={colors.expenseLight}
              bold
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer scroll padding>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {renderPeriodSelector()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Calculando relatórios...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.expense} />
          <Text style={styles.errorText}>Erro ao carregar os relatórios.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {renderSummaryCard()}

          <Text style={styles.sectionTitle}>Distribuição por Categorias</Text>
          <CategoryReport
            categories={data?.categories || []}
            currencyCode={currencyCode}
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
    marginVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterWrapper: {
    marginBottom: spacing.lg,
  },
  filterScroll: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
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
  content: {
    gap: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  periodLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  balanceSection: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  balanceTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  gridItem: {
    flex: 1,
    gap: spacing.xs,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gridLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
