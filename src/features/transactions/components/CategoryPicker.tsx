import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Modal from '@/components/Modal';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { useCategories } from '../hooks/useTransactions';
import { Category } from '@/types/category';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoryPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  onSelectCategory: (category: Category | null) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  visible,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { data: categories = [], isLoading } = useCategories();
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const defaultCategories = filteredCategories.filter((c) => c.is_default);
  const customCategories = filteredCategories.filter((c) => !c.is_default);

  const handleSelect = (category: Category | null) => {
    onSelectCategory(category);
    onClose();
  };

  const renderCategoryRow = (category: Category) => {
    const isSelected = category.id === selectedCategoryId;
    const catColor = category.color || '#8B949E';

    return (
      <Pressable
        key={category.id}
        onPress={() => handleSelect(category)}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.rowPressed,
          isSelected && styles.rowSelected,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${catColor}15`,
              borderColor: `${catColor}30`,
            },
          ]}
        >
          <Ionicons
            name={category.icon as any}
            size={20}
            color={catColor}
          />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
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
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Selecionar Categoria">
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar categoria..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialIcons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

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
            {/* Clear Selection Option */}
            <Pressable
              onPress={() => handleSelect(null)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
                !selectedCategoryId && styles.rowSelected,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${colors.surface}15`,
                    borderColor: `${colors.border}30`,
                  },
                ]}
              >
                <MaterialIcons
                  name="block"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={styles.categoryName}>Sem Categoria</Text>
              {!selectedCategoryId && (
                <MaterialIcons
                  name="check"
                  size={20}
                  color={colors.accent}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>

            {customCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Minhas Categorias</Text>
                {customCategories.map(renderCategoryRow)}
              </View>
            )}

            {defaultCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Categorias Padrão</Text>
                {defaultCategories.map(renderCategoryRow)}
              </View>
            )}

            {filteredCategories.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.55,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: 0,
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
  section: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryName: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  emptyText: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default CategoryPicker;
