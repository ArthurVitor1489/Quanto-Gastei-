import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { useCreditCards } from '@/features/portfolio/hooks/useCreditCards';
import { CreditCard } from '@/types/creditCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreditCardPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedCardId: string | null;
  onSelectCard: (card: CreditCard) => void;
}

const CreditCardPicker: React.FC<CreditCardPickerProps> = ({
  visible,
  onClose,
  selectedCardId,
  onSelectCard,
}) => {
  const { creditCards, isLoading } = useCreditCards();

  const handleSelect = (card: CreditCard) => {
    onSelectCard(card);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Selecionar Cartão de Crédito">
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : (
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {creditCards.map((card) => {
              const isSelected = card.id === selectedCardId;

              return (
                <Pressable
                  key={card.id}
                  onPress={() => handleSelect(card)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                    isSelected && styles.rowSelected,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="card" size={20} color={colors.accent} />
                  </View>
                  
                  <View style={styles.textContainer}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardDetails}>
                      Vence dia {card.due_day} • Fecha dia {card.closing_day}
                    </Text>
                  </View>

                  {isSelected && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.accent}
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.45,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowSelected: {
    backgroundColor: `${colors.accent}10`,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  cardName: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cardDetails: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: spacing.md,
  },
});

export default CreditCardPicker;
