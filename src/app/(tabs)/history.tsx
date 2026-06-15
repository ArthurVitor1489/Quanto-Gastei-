import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import FloatingActionButton from '@/components/FloatingActionButton';
import Modal from '@/components/Modal';
import TransactionItem from '@/features/transactions/components/TransactionItem';
import AssetPicker from '@/features/transactions/components/AssetPicker';
import CategoryPicker from '@/features/transactions/components/CategoryPicker';
import {
  useTransactions,
  useDeleteTransaction,
  useCategories,
  useAssets,
} from '@/features/transactions/hooks/useTransactions';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { formatRelativeDate } from '@/utils/formatters';
import { toLocalISOString } from '@/utils/dateHelpers';
import { Transaction, TransactionType } from '@/types/transaction';
import { Asset } from '@/types/asset';
import { Category } from '@/types/category';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const periods = [
  { value: 'all', label: 'Todo o Período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'month', label: 'Este Mês' },
  { value: 'year', label: 'Este Ano' },
] as const;

const txTypes = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
] as const;

export default function HistoryScreen() {
  const router = useRouter();

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Picker visibility states
  const [assetPickerVisible, setAssetPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [periodPickerVisible, setPeriodPickerVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // Debounce search string
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync details names for badges
  const { data: categories = [] } = useCategories();
  const { data: assets = [] } = useAssets();

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  // Compute dates filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (selectedPeriod === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = toLocalISOString(d);
    } else if (selectedPeriod === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = toLocalISOString(d);
    } else if (selectedPeriod === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = toLocalISOString(d);
    } else if (selectedPeriod === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      startDate = toLocalISOString(d);
    }

    return { startDate, endDate };
  }, [selectedPeriod]);

  // Hook filters query
  const queryFilters = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      type: selectedType === 'all' ? undefined : (selectedType as TransactionType),
      assetId: selectedAssetId || undefined,
      categoryId: selectedCategoryId || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }, [debouncedSearch, selectedType, selectedAssetId, selectedCategoryId, dateRange]);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useTransactions(queryFilters);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const { mutate: deleteTx } = useDeleteTransaction();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteTx(
              { id },
              {
                onError: (err: any) => {
                  Alert.alert(
                    'Erro ao Excluir',
                    err.message || 'Não foi possível excluir a transação.'
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedAssetId(null);
    setSelectedCategoryId(null);
    setSelectedType('all');
    setSelectedPeriod('all');
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      const dateKey = tx.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const totalFilteredCount = transactions.length;

  return (
    <ScreenContainer scroll={false} padding={false} style={styles.container}>
      <Header title="Histórico" />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por descrição..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Badges Row */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {/* Asset Badge */}
          <Pressable
            onPress={() => setAssetPickerVisible(true)}
            style={[
              styles.badge,
              selectedAssetId ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={14}
              color={selectedAssetId ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeText,
                selectedAssetId ? styles.badgeTextActive : null,
              ]}
            >
              {selectedAsset ? selectedAsset.code : 'Todos Ativos'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={selectedAssetId ? colors.accent : colors.textSecondary}
            />
          </Pressable>

          {/* Type Badge */}
          <Pressable
            onPress={() => setTypePickerVisible(true)}
            style={[
              styles.badge,
              selectedType !== 'all' ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Ionicons
              name="filter-outline"
              size={14}
              color={selectedType !== 'all' ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeText,
                selectedType !== 'all' ? styles.badgeTextActive : null,
              ]}
            >
              {selectedType !== 'all'
                ? txTypes.find((t) => t.value === selectedType)?.label
                : 'Todos Tipos'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={selectedType !== 'all' ? colors.accent : colors.textSecondary}
            />
          </Pressable>

          {/* Category Badge */}
          <Pressable
            onPress={() => setCategoryPickerVisible(true)}
            style={[
              styles.badge,
              selectedCategoryId ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Ionicons
              name="grid-outline"
              size={14}
              color={selectedCategoryId ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeText,
                selectedCategoryId ? styles.badgeTextActive : null,
              ]}
            >
              {selectedCategory ? selectedCategory.name : 'Todas Categorias'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={selectedCategoryId ? colors.accent : colors.textSecondary}
            />
          </Pressable>

          {/* Period Badge */}
          <Pressable
            onPress={() => setPeriodPickerVisible(true)}
            style={[
              styles.badge,
              selectedPeriod !== 'all' ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={selectedPeriod !== 'all' ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeText,
                selectedPeriod !== 'all' ? styles.badgeTextActive : null,
              ]}
            >
              {selectedPeriod !== 'all'
                ? periods.find((p) => p.value === selectedPeriod)?.label
                : 'Todo o Período'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={selectedPeriod !== 'all' ? colors.accent : colors.textSecondary}
            />
          </Pressable>
        </ScrollView>
      </View>

      {/* Transactions List */}
      {isLoading ? (
        <Loading fullScreen={false} />
      ) : totalFilteredCount === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Nenhuma transação"
          description="Nenhum registro encontrado para os filtros selecionados."
          actionLabel="Limpar Filtros"
          onAction={handleClearFilters}
        />
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {groupedTransactions.map(([date, items]) => (
            <View key={date} style={styles.groupContainer}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupDate}>{formatRelativeDate(date)}</Text>
                <Text style={styles.groupCount}>
                  {items.length} {items.length === 1 ? 'transação' : 'transações'}
                </Text>
              </View>
              <View style={styles.groupItems}>
                {items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onEdit={() =>
                      router.push({
                        pathname: '/transaction/[id]',
                        params: { id: tx.id },
                      })
                    }
                    onDelete={() => handleDelete(tx.id)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* FAB to Add New Transaction */}
      <FloatingActionButton
        onPress={() => router.push('/transaction/new')}
        icon="add"
        backgroundColor={colors.accent}
        style={styles.fab}
      />

      {/* Picker Modals */}
      <AssetPicker
        visible={assetPickerVisible}
        onClose={() => setAssetPickerVisible(false)}
        selectedAssetId={selectedAssetId}
        onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
      />

      <CategoryPicker
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(cat) => setSelectedCategoryId(cat ? cat.id : null)}
      />

      {/* Type Selection Modal */}
      <Modal
        visible={typePickerVisible}
        onClose={() => setTypePickerVisible(false)}
        title="Selecionar Tipo"
      >
        <View style={styles.pickerContent}>
          {txTypes.map((type) => {
            const isSelected = selectedType === type.value;
            return (
              <Pressable
                key={type.value}
                onPress={() => {
                  setSelectedType(type.value);
                  setTypePickerVisible(false);
                }}
                style={styles.pickerRow}
              >
                <Text
                  style={[
                    styles.pickerLabel,
                    isSelected ? styles.pickerLabelActive : null,
                  ]}
                >
                  {type.label}
                </Text>
                {isSelected && (
                  <MaterialIcons name="check" size={20} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Modal>

      {/* Period Selection Modal */}
      <Modal
        visible={periodPickerVisible}
        onClose={() => setPeriodPickerVisible(false)}
        title="Selecionar Período"
      >
        <View style={styles.pickerContent}>
          {periods.map((p) => {
            const isSelected = selectedPeriod === p.value;
            return (
              <Pressable
                key={p.value}
                onPress={() => {
                  setSelectedPeriod(p.value);
                  setPeriodPickerVisible(false);
                }}
                style={styles.pickerRow}
              >
                <Text
                  style={[
                    styles.pickerLabel,
                    isSelected ? styles.pickerLabelActive : null,
                  ]}
                >
                  {p.label}
                </Text>
                {isSelected && (
                  <MaterialIcons name="check" size={20} color={colors.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: 0,
  },
  filtersWrapper: {
    paddingVertical: spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    gap: 4,
  },
  badgeInactive: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  badgeActive: {
    backgroundColor: `${colors.accent}15`,
    borderColor: colors.accent,
  },
  badgeText: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  badgeTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive + 40, // padding to clear FAB and Tab Bar
  },
  groupContainer: {
    marginBottom: spacing.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  groupDate: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  groupCount: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  groupItems: {
    gap: spacing.xs,
  },
  fab: {
    bottom: 32, // Adjust bottom style to elevate above Tab bar safely
  },
  pickerContent: {
    maxHeight: SCREEN_HEIGHT * 0.45,
    paddingBottom: spacing.xl,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerLabel: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  pickerLabelActive: {
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
});
