import React from 'react';
import { StyleSheet, Text, TextStyle, View, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { ASSET_MAP } from '@/constants/assets';
import { fontSize, fontWeight } from '@/theme/typography';
import { formatCurrency } from '@/utils/formatters';

type DisplaySize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface CurrencyDisplayProps {
  amount: number;
  assetCode: string;
  showSymbol?: boolean;
  size?: DisplaySize;
  color?: string;
  bold?: boolean;
  style?: StyleProp<TextStyle>;
}

const sizeMap: Record<DisplaySize, { valueSize: number; symbolSize: number }> = {
  sm: { valueSize: 12, symbolSize: 10 },
  md: { valueSize: 16, symbolSize: 12 },
  lg: { valueSize: 20, symbolSize: 14 },
  xl: { valueSize: 26, symbolSize: 18 },
  xxl: { valueSize: 32, symbolSize: 22 },
};

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  assetCode = 'BRL',
  showSymbol = true,
  size = 'md',
  color = colors.textPrimary,
  bold = true,
  style,
}) => {
  const asset = ASSET_MAP.get(assetCode);
  const symbol = asset?.symbol ?? assetCode;
  const isCrypto = asset?.asset_type === 'crypto';
  const decimals = isCrypto ? 8 : 2;

  // Format value
  const locale = assetCode === 'BRL' ? 'pt-BR' : 'en-US';
  const absAmount = Math.abs(amount);
  const formattedValue = absAmount.toLocaleString(locale, {
    minimumFractionDigits: isCrypto ? 2 : decimals,
    maximumFractionDigits: decimals,
  });

  const sizes = sizeMap[size];
  const isNegative = amount < 0;

  const fontStyle = {
    color,
    fontSize: sizes.valueSize,
    fontWeight: bold ? fontWeight.bold : fontWeight.regular,
  };

  const symbolStyle = {
    color: colors.textSecondary,
    fontSize: sizes.symbolSize,
    marginRight: 2,
    fontWeight: fontWeight.medium,
  };

  return (
    <View style={styles.container}>
      {isNegative && (
        <Text style={[styles.value, fontStyle, style]}>-</Text>
      )}
      {showSymbol && (
        <Text style={[styles.symbol, symbolStyle, { color: color === colors.textPrimary ? colors.textSecondary : color }]}>
          {symbol}
        </Text>
      )}
      <Text style={[styles.value, fontStyle, style]}>
        {formattedValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  symbol: {
    fontFamily: undefined, // System font
  },
  value: {
    fontFamily: undefined,
  },
});

export default CurrencyDisplay;
