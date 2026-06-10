import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { ASSET_MAP } from '@/constants/assets';
import { getAssetSymbol } from '@/utils/currencyHelpers';

type IconSize = 'sm' | 'md' | 'lg';

interface AssetIconProps {
  code: string;
  size?: IconSize;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<IconSize, { container: number; font: number; borderRadius: number }> = {
  sm: { container: 28, font: 12, borderRadius: 14 },
  md: { container: 40, font: 16, borderRadius: 20 },
  lg: { container: 52, font: 20, borderRadius: 26 },
};

const AssetIcon: React.FC<AssetIconProps> = ({ code, size = 'md', style }) => {
  const asset = ASSET_MAP.get(code);
  const isCrypto = asset?.asset_type === 'crypto';
  const isFiat = asset?.asset_type === 'fiat';

  const themeColor = isCrypto
    ? colors.crypto
    : isFiat
    ? colors.fiat
    : colors.investment;

  const symbol = getAssetSymbol(code);
  const layout = sizeMap[size];

  const containerStyle: ViewStyle = {
    width: layout.container,
    height: layout.container,
    borderRadius: layout.borderRadius,
    backgroundColor: `${themeColor}15`,
    borderColor: `${themeColor}30`,
    borderWidth: 1,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Text style={[styles.symbolText, { fontSize: layout.font, color: themeColor }]}>
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontWeight: '600',
  },
});

export default AssetIcon;
