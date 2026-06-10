import React from 'react';
import { StyleSheet, Text, Pressable, View, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { usePortfolioStore } from '@/store/portfolioStore';
import { DisplayCurrency } from '@/types/portfolio';

const CURRENCIES: DisplayCurrency[] = ['BRL', 'USD', 'EUR'];

const CurrencySelector: React.FC = () => {
  const { displayCurrency, setDisplayCurrency } = usePortfolioStore();

  return (
    <View style={styles.container}>
      {CURRENCIES.map((currency) => {
        const isActive = displayCurrency === currency;
        return (
          <Pressable
            key={currency}
            onPress={() => setDisplayCurrency(currency)}
            style={[
              styles.pill,
              isActive ? styles.activePill : styles.inactivePill
            ]}
          >
            <Text
              style={[
                styles.text,
                isActive ? styles.activeText : styles.inactiveText
              ]}
            >
              {currency}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  activePill: {
    backgroundColor: colors.accent,
    // Accent shadow/glow
    elevation: 3,
    ...Platform.select({
      web: {
        boxShadow: `0px 2px 4px rgba(88, 166, 255, 0.3)`,
      },
      default: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  inactivePill: {
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  activeText: {
    color: '#0D1117', // Dark contrast color for readability on light blue
  },
  inactiveText: {
    color: colors.textSecondary,
  },
});

export default CurrencySelector;
