import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import SwipeableRow from '@/components/SwipeableRow';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import AssetIcon from '@/components/AssetIcon';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { formatRelativeDate } from '@/utils/formatters';
import { Transaction } from '@/types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.type === 'income';
  
  // Decide color based on type
  const amountColor = isIncome ? colors.income : colors.expense;

  // Decide if amount is negative
  const isNegative = transaction.type === 'expense';
  const displayAmount = isNegative ? -transaction.amount : transaction.amount;

  const displayDescription = transaction.description.trim() || (
    transaction.type === 'income' ? 'Receita' : 'Despesa'
  );

  const displayCategory = transaction.category?.name || 'Geral';

  const renderIcon = () => {
    if (transaction.category) {
      const catColor = transaction.category.color || '#8B949E';
      return (
        <View
          style={[
            styles.categoryIconCircle,
            {
              backgroundColor: `${catColor}15`,
              borderColor: `${catColor}30`,
            },
          ]}
        >
          <Ionicons
            name={transaction.category.icon as any}
            size={18}
            color={catColor}
          />
        </View>
      );
    }
    
    // Fallback to AssetIcon if no category is assigned (e.g. Transfers)
    return (
      <AssetIcon
        code={transaction.asset?.code || 'BRL'}
        size="md"
        style={styles.assetIcon}
      />
    );
  };

  return (
    <SwipeableRow onEdit={onEdit} onDelete={onDelete}>
      <Pressable onPress={onEdit} style={styles.container}>
        <View style={styles.leftContainer}>
          {renderIcon()}
          
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>
              {displayDescription}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.category}>{displayCategory}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.date}>
                {formatRelativeDate(transaction.date)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightContainer}>
          <CurrencyDisplay
            amount={displayAmount}
            assetCode={transaction.asset?.code || 'BRL'}
            color={amountColor}
            size="md"
          />
        </View>
      </Pressable>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  assetIcon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  category: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  dot: {
    color: colors.textSecondary,
    marginHorizontal: 4,
    fontSize: fontSize.xs,
  },
  date: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
});

export default TransactionItem;
