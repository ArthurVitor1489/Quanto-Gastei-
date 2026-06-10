import React from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import Header from '@/components/Header';
import TransactionForm from '@/features/transactions/components/TransactionForm';
import { useCreateTransaction } from '@/features/transactions/hooks/useTransactions';

export default function NewTransactionScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { mutate: createTx, isPending } = useCreateTransaction();

  const handleSubmit = (data: any) => {
    createTx(data, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        Alert.alert('Erro ao Salvar', err.message || 'Não foi possível salvar a transação.');
      },
    });
  };

  return (
    <ScreenContainer scroll={false} padding={false}>
      <Header title="Nova Transação" showBack onBack={() => router.back()} />
      <TransactionForm
        onSubmit={handleSubmit}
        loading={isPending}
        initialValues={{ type: type as any }}
      />
    </ScreenContainer>
  );
}
