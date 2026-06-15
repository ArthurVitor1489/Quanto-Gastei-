import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import AssetIcon from '@/components/AssetIcon';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AssetPicker from './AssetPicker';
import CategoryPicker from './CategoryPicker';
import PaymentMethodPicker from './PaymentMethodPicker';
import CreditCardPicker from './CreditCardPicker';
import { useAssets, useCategories } from '../hooks/useTransactions';
import { useCreditCards } from '@/features/portfolio/hooks/useCreditCards';
import { Asset } from '@/types/asset';
import { Category } from '@/types/category';
import { CreditCard } from '@/types/creditCard';
import { TransactionType, PaymentMethod } from '@/types/transaction';
import { formatRelativeDate } from '@/utils/formatters';
import { toLocalISOString } from '@/utils/dateHelpers';

const transactionTypes = [
  { value: 'expense', label: 'Despesa', icon: 'remove-circle-outline', color: colors.expense },
  { value: 'income', label: 'Receita', icon: 'add-circle-outline', color: colors.income },
] as const;

interface TransactionFormProps {
  initialValues?: {
    type?: TransactionType;
    amount?: number;
    description?: string;
    asset_id?: string;
    category_id?: string | null;
    payment_method?: PaymentMethod | null;
    date?: string;
    notes?: string;
    is_recurring?: boolean;
    credit_card_id?: string | null;
    installments?: number;
  };
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  loading?: boolean;
}

// Validation schema for local form usage
const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine(
    (val) => {
      const parsed = parseFloat(val.replace(',', '.'));
      return !isNaN(parsed) && parsed > 0;
    },
    { message: 'Insira um valor maior que zero' }
  ),
  description: z.string().max(200, { message: 'Máximo 200 caracteres' }).optional().or(z.literal('')),
  asset_id: z.string().uuid({ message: 'Selecione um ativo' }),
  category_id: z.string().uuid().nullable().optional(),
  payment_method: z.enum(['pix', 'credit', 'debit', 'cash']).nullable().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data inválida' }),
  notes: z.string().max(500, { message: 'Máximo 500 caracteres' }).optional().or(z.literal('')),
  is_recurring: z.boolean().optional(),
  credit_card_id: z.string().nullable().optional(),
  installments: z.string().optional().or(z.literal('')),
});

type FormSchemaInput = z.infer<typeof formSchema>;

const getTodayDbString = () => {
  return toLocalISOString(new Date());
};

const getYesterdayDbString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalISOString(d);
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  loading = false,
}) => {
  const { data: assets = [] } = useAssets();
  const { creditCards = [] } = useCreditCards();
  
  const [assetPickerVisible, setAssetPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [creditCardPickerVisible, setCreditCardPickerVisible] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCard | null>(null);
  
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDateInput, setCustomDateInput] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormSchemaInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialValues?.type || 'expense',
      amount: initialValues?.amount ? String(initialValues.amount) : '',
      description: initialValues?.description || '',
      asset_id: initialValues?.asset_id || '',
      category_id: initialValues?.category_id || null,
      payment_method: initialValues?.payment_method || null,
      date: initialValues?.date || getTodayDbString(),
      notes: initialValues?.notes || '',
      is_recurring: initialValues?.is_recurring || false,
      credit_card_id: initialValues?.credit_card_id || null,
      installments: initialValues?.installments ? String(initialValues.installments) : '1',
    },
  });

  const watchType = watch('type');
  const watchAssetId = watch('asset_id');
  const watchCategoryId = watch('category_id');
  const watchPaymentMethod = watch('payment_method');
  const watchCreditCardId = watch('credit_card_id');
  const watchDate = watch('date');

  // Handle selected asset sync
  useEffect(() => {
    if (assets.length > 0) {
      if (initialValues?.asset_id) {
        const found = assets.find((a) => a.id === initialValues.asset_id);
        if (found) setSelectedAsset(found);
      } else if (!watchAssetId) {
        const brl = assets.find((a) => a.code === 'BRL') || assets[0];
        setValue('asset_id', brl.id);
        setSelectedAsset(brl);
      } else {
        const found = assets.find((a) => a.id === watchAssetId);
        if (found) setSelectedAsset(found);
      }
    }
  }, [assets, watchAssetId, initialValues]);

  const { data: categories = [] } = useCategories();

  // Handle category sync
  useEffect(() => {
    if (categories.length > 0) {
      if (initialValues?.category_id) {
        const found = categories.find((c) => c.id === initialValues.category_id);
        if (found) setSelectedCategory(found);
      } else if (watchCategoryId) {
        const found = categories.find((c) => c.id === watchCategoryId);
        if (found) setSelectedCategory(found);
      } else {
        setSelectedCategory(null);
      }
    }
  }, [categories, watchCategoryId, initialValues]);

  // Handle credit card sync
  useEffect(() => {
    if (creditCards.length > 0) {
      if (initialValues?.credit_card_id) {
        const found = creditCards.find((c) => c.id === initialValues.credit_card_id);
        if (found) setSelectedCreditCard(found);
      } else if (watchCreditCardId) {
        const found = creditCards.find((c) => c.id === watchCreditCardId);
        if (found) setSelectedCreditCard(found);
      } else {
        setSelectedCreditCard(null);
      }
    }
  }, [creditCards, watchCreditCardId, initialValues]);

  // Date selection logic
  useEffect(() => {
    const today = getTodayDbString();
    const yesterday = getYesterdayDbString();
    
    if (watchDate === today) {
      setDateMode('today');
    } else if (watchDate === yesterday) {
      setDateMode('yesterday');
    } else {
      setDateMode('custom');
      // Format to display format (DD/MM/YYYY)
      const parts = watchDate.split('-');
      if (parts.length === 3) {
        setCustomDateInput(`${parts[2]}/${parts[1]}/${parts[0]}`);
      } else {
        setCustomDateInput(watchDate);
      }
    }
  }, [watchDate]);

  const handleCustomDateChange = (text: string) => {
    setCustomDateInput(text);
    // Parse DD/MM/YYYY to YYYY-MM-DD
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = text.match(regex);
    if (match) {
      const [_, day, month, year] = match;
      setValue('date', `${year}-${month}-${day}`);
    }
  };

  const onFormSubmit = (data: FormSchemaInput) => {
    const numericAmount = parseFloat(data.amount.replace(',', '.'));
    onSubmit({
      ...data,
      amount: numericAmount,
    });
  };

  const showCategorySelector = true;
  const showPaymentMethod = watchType === 'expense' && selectedAsset?.asset_type === 'fiat';

  const activeTypeInfo = transactionTypes.find((t) => t.value === watchType);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Transaction Type Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            {transactionTypes.map((t) => {
              const isSelected = watchType === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => {
                    setValue('type', t.value);
                  }}
                  style={[
                    styles.tab,
                    isSelected
                      ? { backgroundColor: `${t.color}15`, borderColor: t.color }
                      : styles.tabUnselected,
                  ]}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={18}
                    color={isSelected ? t.color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      isSelected ? { color: t.color, fontWeight: fontWeight.bold } : null,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Big Amount Input */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Valor da Transação</Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.amountSymbol, activeTypeInfo ? { color: activeTypeInfo.color } : null]}>
              {selectedAsset?.symbol ?? 'R$'}
            </Text>
            <Controller
              name="amount"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  style={[
                    styles.amountInput,
                    activeTypeInfo ? { color: activeTypeInfo.color } : null,
                  ]}
                  autoFocus={!initialValues?.amount}
                />
              )}
            />
          </View>
          {errors.amount && (
            <Text style={styles.amountError}>{errors.amount.message}</Text>
          )}
        </View>

        {/* Asset & Category Pickers */}
        <View style={styles.pickersCard}>
          {/* Asset Picker Row */}
          <Pressable
            onPress={() => setAssetPickerVisible(true)}
            style={styles.pickerRow}
          >
            <View style={styles.pickerRowLeft}>
              <View style={styles.pickerIconCircle}>
                <Ionicons name="cash-outline" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.pickerRowLabel}>Ativo / Moeda</Text>
                <Text style={styles.pickerRowValue}>
                  {selectedAsset ? `${selectedAsset.name} (${selectedAsset.code})` : 'Selecionar Ativo'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>

          {/* Category Picker Row */}
          {showCategorySelector && (
            <>
              <View style={styles.pickerDivider} />
              <Pressable
                onPress={() => setCategoryPickerVisible(true)}
                style={styles.pickerRow}
              >
                <View style={styles.pickerRowLeft}>
                  {selectedCategory ? (
                    <View
                      style={[
                        styles.pickerIconCircle,
                        {
                          backgroundColor: `${selectedCategory.color}15`,
                          borderColor: `${selectedCategory.color}30`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={selectedCategory.icon as any}
                        size={18}
                        color={selectedCategory.color}
                      />
                    </View>
                  ) : (
                    <View style={styles.pickerIconCircle}>
                      <Ionicons name="grid-outline" size={20} color={colors.warning} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.pickerRowLabel}>Categoria</Text>
                    <Text style={styles.pickerRowValue}>
                      {selectedCategory ? selectedCategory.name : 'Selecionar Categoria'}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
            </>
          )}
        </View>

        {/* Payment Method Picker (fiat expenses) */}
        {showPaymentMethod && (
          <Controller
            name="payment_method"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PaymentMethodPicker
                selectedMethod={value ?? null}
                onChange={(method) => {
                  onChange(method);
                  // Reset credit card and installments if method changes from credit
                  if (method !== 'credit') {
                    setValue('credit_card_id', null);
                    setValue('installments', '1');
                    setSelectedCreditCard(null);
                  }
                }}
                error={errors.payment_method?.message}
              />
            )}
          />
        )}

        {/* Credit Card & Installments Configuration */}
        {showPaymentMethod && watchPaymentMethod === 'credit' && (
          <View style={[styles.pickersCard, { marginTop: spacing.md }]}>
            {/* Credit Card Picker Row */}
            <Pressable
              onPress={() => setCreditCardPickerVisible(true)}
              style={styles.pickerRow}
            >
              <View style={styles.pickerRowLeft}>
                <View style={styles.pickerIconCircle}>
                  <Ionicons name="card-outline" size={20} color={colors.accent} />
                </View>
                <View>
                  <Text style={styles.pickerRowLabel}>Cartão de Crédito</Text>
                  <Text style={styles.pickerRowValue}>
                    {selectedCreditCard ? selectedCreditCard.name : 'Selecionar Cartão'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Installments Count Input (Only on creation) */}
            {!initialValues && (
              <>
                <View style={styles.pickerDivider} />
                <View style={styles.installmentsRow}>
                  <View style={styles.installmentsLeft}>
                    <View style={styles.pickerIconCircle}>
                      <Ionicons name="calendar-outline" size={20} color={colors.income} />
                    </View>
                    <View>
                      <Text style={styles.pickerRowLabel}>Número de Parcelas</Text>
                      <Text style={styles.pickerRowValue}>Digite a quantidade de vezes</Text>
                    </View>
                  </View>
                  <Controller
                    name="installments"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        style={styles.installmentsInput}
                        maxLength={2}
                      />
                    )}
                  />
                </View>
              </>
            )}
          </View>
        )}

        {/* Date Selection widget */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Data da Transação</Text>
          <View style={styles.dateButtonsRow}>
            <Pressable
              onPress={() => setValue('date', getTodayDbString())}
              style={[
                styles.dateBtn,
                dateMode === 'today' ? styles.dateBtnActive : styles.dateBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.dateBtnLabel,
                  dateMode === 'today' ? styles.dateBtnLabelActive : null,
                ]}
              >
                Hoje
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setValue('date', getYesterdayDbString())}
              style={[
                styles.dateBtn,
                dateMode === 'yesterday' ? styles.dateBtnActive : styles.dateBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.dateBtnLabel,
                  dateMode === 'yesterday' ? styles.dateBtnLabelActive : null,
                ]}
              >
                Ontem
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDateMode('custom')}
              style={[
                styles.dateBtn,
                dateMode === 'custom' ? styles.dateBtnActive : styles.dateBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.dateBtnLabel,
                  dateMode === 'custom' ? styles.dateBtnLabelActive : null,
                ]}
              >
                Outra Data
              </Text>
            </Pressable>
          </View>

          {dateMode === 'custom' && (
            <View style={styles.customDateWrapper}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.accent}
                style={styles.customDateIcon}
              />
              <TextInput
                value={customDateInput}
                onChangeText={handleCustomDateChange}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={10}
                style={styles.customDateInput}
              />
            </View>
          )}
          {errors.date && (
            <Text style={styles.fieldError}>{errors.date.message}</Text>
          )}
        </View>

        {/* Description & Notes */}
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Descrição"
              placeholder="Ex: Almoço de domingo, Salário..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Observações (opcional)"
              placeholder="Adicione detalhes adicionais..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={3}
              error={errors.notes?.message}
            />
          )}
        />

        {/* Save Button */}
        <Button
          title={initialValues?.amount !== undefined ? 'Salvar Alterações' : 'Salvar Transação'}
          onPress={handleSubmit(onFormSubmit as any)}
          loading={loading}
          variant="primary"
          size="lg"
          style={styles.saveBtn}
        />

        {onDelete && (
          <Button
            title="Excluir Transação"
            onPress={onDelete}
            variant="danger"
            size="lg"
            style={styles.deleteBtn}
          />
        )}
      </ScrollView>

      {/* Asset Picker Modal */}
      <AssetPicker
        visible={assetPickerVisible}
        onClose={() => setAssetPickerVisible(false)}
        selectedAssetId={watchAssetId}
        onSelectAsset={(asset) => {
          setValue('asset_id', asset.id);
          setSelectedAsset(asset);
        }}
      />

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        selectedCategoryId={watchCategoryId ?? null}
        onSelectCategory={(category) => {
          setValue('category_id', category ? category.id : null);
          setSelectedCategory(category);
        }}
      />

      {/* Credit Card Picker Modal */}
      <CreditCardPicker
        visible={creditCardPickerVisible}
        onClose={() => setCreditCardPickerVisible(false)}
        selectedCardId={watchCreditCardId ?? null}
        onSelectCard={(card) => {
          setValue('credit_card_id', card.id);
          setSelectedCreditCard(card);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  tabsWrapper: {
    marginBottom: spacing.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    gap: 6,
  },
  tabUnselected: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  tabLabel: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  amountCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSymbol: {
    fontFamily,
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
    marginTop: 2,
  },
  amountInput: {
    fontFamily,
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    minWidth: 120,
    textAlign: 'left',
    padding: 0,
  },
  amountError: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.expense,
    marginTop: spacing.sm,
  },
  pickersCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRowLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  pickerRowValue: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  installmentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  installmentsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  installmentsInput: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    width: 60,
    height: 40,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  dateButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  dateBtnInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  dateBtnActive: {
    backgroundColor: `${colors.accent}15`,
    borderColor: colors.accent,
  },
  dateBtnLabel: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  dateBtnLabelActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  customDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    height: 44,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  customDateIcon: {
    marginRight: spacing.sm,
  },
  customDateInput: {
    flex: 1,
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: 0,
  },
  fieldError: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.expense,
    marginTop: spacing.xs,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
  deleteBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});

export default TransactionForm;
