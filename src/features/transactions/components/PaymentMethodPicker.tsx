import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { PAYMENT_METHODS } from '@/constants/paymentMethods';
import { PaymentMethod } from '@/types/transaction';

interface PaymentMethodPickerProps {
  selectedMethod: PaymentMethod | null;
  onChange: (method: PaymentMethod | null) => void;
  error?: string;
}

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedMethod,
  onChange,
  error,
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Método de Pagamento</Text>
      <View style={styles.container}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.value;

          return (
            <Pressable
              key={method.value}
              onPress={() => onChange(isSelected ? null : method.value)}
              style={[
                styles.item,
                isSelected ? styles.itemSelected : styles.itemUnselected,
                error ? { borderColor: colors.expense } : null,
              ]}
            >
              <MaterialIcons
                name={method.icon as any}
                size={20}
                color={isSelected ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[
                  styles.itemLabel,
                  isSelected ? styles.itemLabelSelected : styles.itemLabelUnselected,
                ]}
              >
                {method.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={13} color={colors.expense} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    height: 58,
    gap: 4,
  },
  itemUnselected: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  itemSelected: {
    backgroundColor: `${colors.accent}15`,
    borderColor: colors.accent,
  },
  itemLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  itemLabelUnselected: {
    color: colors.textSecondary,
  },
  itemLabelSelected: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  errorText: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.expense,
  },
});

export default PaymentMethodPicker;
