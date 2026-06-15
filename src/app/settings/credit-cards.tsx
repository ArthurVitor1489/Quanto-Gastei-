import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useCreditCards } from '@/features/portfolio/hooks/useCreditCards';
import { CreditCard } from '@/types/creditCard';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { formatCurrency } from '@/utils/formatters';

export default function CreditCardsScreen() {
  const router = useRouter();
  const { creditCards, createCreditCard, updateCreditCard, deleteCreditCard } = useCreditCards();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setName('');
    setClosingDay('');
    setDueDay('');
    setLimitAmount('');
    setFormError(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (card: CreditCard) => {
    setEditingCard(card);
    setName(card.name);
    setClosingDay(card.closing_day.toString());
    setDueDay(card.due_day.toString());
    setLimitAmount(card.limit_amount !== null ? card.limit_amount.toString() : '');
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError(null);

    // Validations
    if (!name.trim()) {
      setFormError('O nome do cartão é obrigatório');
      return;
    }

    const closingNum = parseInt(closingDay, 10);
    if (isNaN(closingNum) || closingNum < 1 || closingNum > 31) {
      setFormError('O dia de fechamento deve ser entre 1 e 31');
      return;
    }

    const dueNum = parseInt(dueDay, 10);
    if (isNaN(dueNum) || dueNum < 1 || dueNum > 31) {
      setFormError('O dia de vencimento deve ser entre 1 e 31');
      return;
    }

    const limitNum = limitAmount.trim() ? parseFloat(limitAmount) : null;
    if (limitNum !== null && (isNaN(limitNum) || limitNum < 0)) {
      setFormError('O limite de crédito deve ser um valor positivo');
      return;
    }

    try {
      const cardData = {
        name: name.trim(),
        closing_day: closingNum,
        due_day: dueNum,
        limit_amount: limitNum,
      };

      if (editingCard) {
        await updateCreditCard({ id: editingCard.id, data: cardData });
      } else {
        await createCreditCard(cardData);
      }
      setModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar o cartão de crédito');
    }
  };

  const handleDelete = (card: CreditCard) => {
    Alert.alert(
      'Excluir Cartão',
      `Tem certeza que deseja excluir o cartão "${card.name}"? Isso não removerá suas transações passadas, mas elas perderão o vínculo com o cartão.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCreditCard(card.id);
            } catch (err: any) {
              Alert.alert('Erro ao excluir', err.message || 'Não foi possível excluir o cartão.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll padding={false} style={styles.container}>
      <Header title="Cartões de Crédito" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Gerencie os cartões de crédito usados para compras parceladas.</Text>
          <Button
            title="Novo Cartão"
            variant="secondary"
            size="sm"
            icon="add"
            onPress={handleOpenAddModal}
            style={styles.addBtn}
          />
        </View>

        {creditCards.length === 0 ? (
          <EmptyState
            title="Nenhum cartão cadastrado"
            description="Cadastre um cartão para poder lançar despesas parceladas de faturamento mensal."
            icon="card-outline"
          />
        ) : (
          creditCards.map((card) => (
            <Card key={card.id} padding="lg" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="card" size={24} color={colors.accent} style={styles.cardIcon} />
                  <Text style={styles.cardName}>{card.name}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => handleOpenEditModal(card)} style={styles.actionBtn}>
                    <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(card)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.expense} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fechamento:</Text>
                  <Text style={styles.detailValue}>Dia {card.closing_day}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vencimento:</Text>
                  <Text style={styles.detailValue}>Dia {card.due_day}</Text>
                </View>
                {card.limit_amount !== null && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Limite Total:</Text>
                    <Text style={[styles.detailValue, styles.limitText]}>
                      {formatCurrency(card.limit_amount, 'BRL')}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingCard ? 'Editar Cartão' : 'Novo Cartão'}
      >
        <ScrollView style={styles.formScroll}>
          {formError && <Text style={styles.formErrorText}>{formError}</Text>}

          <Input
            label="Nome do Cartão (ex: Nubank Visa)"
            value={name}
            onChangeText={setName}
            placeholder="Nome do cartão"
            autoFocus
          />

          <View style={styles.daysRow}>
            <View style={styles.dayCol}>
              <Input
                label="Dia de Fechamento"
                value={closingDay}
                onChangeText={setClosingDay}
                placeholder="Ex: 5"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={styles.dayCol}>
              <Input
                label="Dia de Vencimento"
                value={dueDay}
                onChangeText={setDueDay}
                placeholder="Ex: 12"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          <Input
            label="Limite de Crédito (Opcional)"
            value={limitAmount}
            onChangeText={setLimitAmount}
            placeholder="Ex: 5000.00"
            keyboardType="numeric"
          />

          <Button
            title={editingCard ? 'Salvar Alterações' : 'Criar Cartão'}
            variant="primary"
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },
  headerRow: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  subtitle: {
    fontFamily,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addBtn: {
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcon: {
    marginRight: 2,
  },
  cardName: {
    fontFamily,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  limitText: {
    color: colors.accent,
  },
  formScroll: {
    paddingBottom: spacing.massive,
  },
  formErrorText: {
    fontFamily,
    fontSize: fontSize.sm,
    color: colors.expense,
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dayCol: {
    flex: 1,
  },
  saveBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.massive,
  },
});
