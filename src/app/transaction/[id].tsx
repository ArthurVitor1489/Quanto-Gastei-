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
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize } from '@/theme/typography';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: transaction, isLoading } = useTransaction(id);
  const { mutate: updateTx, isPending: isUpdating } = useUpdateTransaction();
  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();

  const handleSubmit = (data: any) => {
    if (!id) return;
    updateTx(
      { id, transaction: data },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err: any) => {
          Alert.alert('Erro ao Salvar', err.message || 'Não foi possível atualizar a transação.');
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    
    Alert.alert(
      'Excluir Transação',
      'Tem certeza de que deseja excluir esta transação permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteTx(id, {
              onSuccess: () => {
                router.back();
              },
              onError: (err: any) => {
                Alert.alert('Erro ao Excluir', err.message || 'Não foi possível excluir a transação.');
              },
            });
          },
        },
      ]
    );
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
  };

  return (
    <ScreenContainer scroll={false} padding={false}>
      <Header title="Editar Transação" showBack onBack={() => router.back()} />
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
});
