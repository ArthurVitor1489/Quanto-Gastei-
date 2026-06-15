import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import {
  useTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/features/transactions/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: transaction, isLoading } = useTransaction(id);
  const { mutate: updateTx, isPending: isUpdating } = useUpdateTransaction();
  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();

  const handleUpdateSuccess = () => {
    router.back();
  };

  const handleUpdateError = (err: any) => {
    Alert.alert('Erro ao Salvar', err.message || 'Não foi possível atualizar a transação.');
  };

  const handleSubmit = (data: any) => {
    if (!id || !transaction) return;

    const isInstallment = !!transaction.installment_group_id && (transaction.total_installments ?? 0) > 1;

    if (isInstallment) {
      Alert.alert(
        'Editar Transação Parcelada',
        'Esta despesa faz parte de uma compra parcelada. Deseja aplicar as alterações apenas a esta parcela ou a todas as parcelas deste grupo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Apenas esta parcela',
            onPress: () => {
              updateTx(
                { id, transaction: data, updateMode: 'single' },
                { onSuccess: handleUpdateSuccess, onError: handleUpdateError }
              );
            },
          },
          {
            text: 'Todo o parcelamento',
            style: 'destructive',
            onPress: () => {
              // Note: the service updates amount as per-installment, description, category etc.
              updateTx(
                { id, transaction: data, updateMode: 'group' },
                { onSuccess: handleUpdateSuccess, onError: handleUpdateError }
              );
            },
          },
        ]
      );
    } else {
      updateTx(
        { id, transaction: data, updateMode: 'single' },
        { onSuccess: handleUpdateSuccess, onError: handleUpdateError }
      );
    }
  };

  const handleDeleteSuccess = () => {
    router.back();
  };

  const handleDeleteError = (err: any) => {
    Alert.alert('Erro ao Excluir', err.message || 'Não foi possível excluir a transação.');
  };

  const handleDelete = () => {
    if (!id || !transaction) return;

    const isInstallment = !!transaction.installment_group_id && (transaction.total_installments ?? 0) > 1;

    if (isInstallment) {
      Alert.alert(
        'Excluir Transação Parcelada',
        'Deseja excluir apenas esta parcela ou todas as parcelas deste parcelamento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Apenas esta parcela',
            onPress: () => {
              deleteTx(
                { id, deleteMode: 'single' },
                { onSuccess: handleDeleteSuccess, onError: handleDeleteError }
              );
            },
          },
          {
            text: 'Todo o parcelamento',
            style: 'destructive',
            onPress: () => {
              deleteTx(
                { id, deleteMode: 'group' },
                { onSuccess: handleDeleteSuccess, onError: handleDeleteError }
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Excluir Transação',
        'Tem certeza de que deseja excluir esta transação permanentemente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deleteTx(
                { id, deleteMode: 'single' },
                { onSuccess: handleDeleteSuccess, onError: handleDeleteError }
              );
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!transaction) {
    return (
      <ScreenContainer scroll={false} padding>
        <Header title="Editar Transação" showBack onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>A transação solicitada não foi encontrada.</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Pre-map values for form
  const initialValues = {
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    asset_id: transaction.asset_id,
    category_id: transaction.category_id,
    payment_method: transaction.payment_method,
    date: transaction.date,
    notes: transaction.notes || '',
    is_recurring: transaction.is_recurring,
    credit_card_id: transaction.credit_card_id,
    installments: transaction.total_installments || 1,
  };

  const isInstallment = !!transaction.installment_group_id && (transaction.total_installments ?? 0) > 1;

  return (
    <ScreenContainer scroll={false} padding={false}>
      <Header title="Editar Transação" showBack onBack={() => router.back()} />
      {isInstallment && (
        <View style={styles.installmentBanner}>
          <Ionicons name="card-outline" size={18} color={colors.accent} style={styles.bannerIcon} />
          <Text style={styles.installmentBannerText}>
            Esta despesa é a parcela {transaction.installment_number} de {transaction.total_installments} do parcelamento.
          </Text>
        </View>
      )}
      <TransactionForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        loading={isUpdating || isDeleting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.expense,
    textAlign: 'center',
  },
  installmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}12`,
    borderColor: `${colors.accent}25`,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  installmentBannerText: {
    flex: 1,
    fontFamily,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});
