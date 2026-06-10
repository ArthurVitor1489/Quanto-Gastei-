import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { BalanceCard } from '@/features/dashboard/components/BalanceCard';
import { SummaryCards } from '@/features/dashboard/components/SummaryCards';
import { MonthlyChart } from '@/features/dashboard/components/MonthlyChart';
import { CategoryChart } from '@/features/dashboard/components/CategoryChart';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { getGreeting, parseLocalDate } from '@/utils/dateHelpers';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { Transaction } from '@/types/transaction';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { openTransactionModal, addNotification } = useUiStore();
  
  const { data, isLoading, error, refetch } = useDashboard();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleQuickAction = (type: 'income' | 'expense') => {
    router.push({
      pathname: '/transaction/new',
      params: { type },
    } as any);
    addNotification(`Abrindo formulário para: ${type === 'income' ? 'Receita' : 'Despesa'}`, 'info', 2000);
  };

  if (isLoading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Carregando painel...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.expense} />
        <Text style={styles.errorText}>Erro ao carregar dados do dashboard.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const currencyCode = profile?.default_currency || 'BRL';
  const recentTransactions = data?.recentTransactions || [];

  return (
    <ScreenContainer scroll padding>
      {/* Header Profile Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.username}>{profile?.display_name || 'Usuário'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={styles.avatarContainer}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Balance Summary Card */}
      <BalanceCard
        netCashflow={data?.netCashflow || 0}
        totalIncome={data?.totalIncome || 0}
        totalExpense={data?.totalExpense || 0}
        currencyCode={currencyCode}
      />

      {/* Side-by-side Flow Cards */}
      <SummaryCards
        totalIncome={data?.totalIncome || 0}
        totalExpense={data?.totalExpense || 0}
        currencyCode={currencyCode}
      />

      {/* Quick Action Button Panel */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.income}12`, borderColor: `${colors.income}30` }]}
            onPress={() => handleQuickAction('income')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.income }]}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionButtonText}>Receita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.expense}12`, borderColor: `${colors.expense}30` }]}
            onPress={() => handleQuickAction('expense')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.expense }]}>
              <Ionicons name="remove" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionButtonText}>Despesa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Chart Bar */}
      <MonthlyChart
        monthlyBreakdown={data?.monthlyBreakdown || []}
        currencyCode={currencyCode}
      />

      {/* Category Wise Spending Breakdown */}
      <CategoryChart
        categorySpending={data?.categorySpending || []}
        currencyCode={currencyCode}
      />

      {/* Recent Activity List */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
            <Text style={styles.viewAllText}>Ver Tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyTransactions}>Nenhuma transação recente registrada.</Text>
          ) : (
            recentTransactions.map((tx: Transaction) => {
              const color = tx.category?.color || colors.textSecondary;
              const isIncome = tx.type === 'income';
              
              let txColor: string = isIncome ? colors.incomeLight : colors.textPrimary;

              const displayAmount = isIncome ? tx.amount : -tx.amount;
              const formattedDate = parseLocalDate(tx.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              });

              return (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.transactionRow}
                  onPress={() =>
                    router.push({
                      pathname: '/transaction/[id]',
                      params: { id: tx.id },
                    } as any)
                  }
                >
                  <View style={styles.leftTx}>
                    <View style={[styles.txIconContainer, { backgroundColor: `${color}15`, borderColor: `${color}25` }]}>
                      <Ionicons
                        name={tx.category?.icon as any || 'ellipsis-horizontal'}
                        size={20}
                        color={color}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDescription} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={styles.txMeta}>
                        {tx.category?.name || 'Sem categoria'} • {formattedDate}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rightTx}>
                    <CurrencyDisplay
                      amount={displayAmount}
                      assetCode={tx.asset?.code || 'BRL'}
                      size="md"
                      color={txColor}
                      bold
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.expenseLight,
    textAlign: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  username: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  actionSection: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  recentSection: {
    marginVertical: spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  transactionsList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyTransactions: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftTx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txDescription: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  txMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rightTx: {
    alignItems: 'flex-end',
  },
});
