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
import { MaterialIcons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import AssetIcon from '@/components/AssetIcon';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { useAssets } from '../hooks/useTransactions';
import { Asset } from '@/types/asset';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AssetPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedAssetId: string | null;
  onSelectAsset: (asset: Asset) => void;
}

const AssetPicker: React.FC<AssetPickerProps> = ({
  visible,
  onClose,
  selectedAssetId,
  onSelectAsset,
}) => {
  const { data: assets = [], isLoading } = useAssets();

  const handleSelect = (asset: Asset) => {
    onSelectAsset(asset);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Selecionar Ativo/Moeda">
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
            {assets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;

              return (
                <Pressable
                  key={asset.id}
                  onPress={() => handleSelect(asset)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                    isSelected && styles.rowSelected,
                  ]}
                >
                  <AssetIcon code={asset.code} size="md" style={styles.assetIcon} />
                  
                  <View style={styles.textContainer}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetCode}>{asset.code}</Text>
                  </View>

                  <View style={styles.rightContainer}>
                    <Text style={styles.symbol}>{asset.symbol}</Text>
                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.accent}
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
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
  assetIcon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  assetName: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  assetCode: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  checkIcon: {
    marginLeft: spacing.md,
  },
});

export default AssetPicker;
