import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import SwipeableRow from '@/components/SwipeableRow';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useUiStore } from '@/store/uiStore';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { Category } from '@/types/category';

const PRESET_COLORS = [
  '#F85149', // Red
  '#58A6FF', // Blue
  '#D29922', // Yellow
  '#2EA043', // Green
  '#A371F7', // Purple
  '#3FB950', // Light green
  '#79C0FF', // Sky blue
  '#F7931A', // Orange
  '#8B949E', // Gray
];

const PRESET_ICONS = [
  'restaurant',
  'car',
  'home',
  'heart',
  'game-controller',
  'school',
  'bag',
  'business',
  'trending-up',
  'ellipsis-horizontal',
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { addNotification } = useUiStore();
  const {
    categories,
    isLoading,
    createCategory,
    deleteCategory,
    refetch,
  } = useCategories();

  // Modal form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
  };

  const handleOpenForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      addNotification('Nome da categoria é obrigatório', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createCategory({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        parent_id: null,
      });
      addNotification('Categoria criada com sucesso!', 'success');
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      addNotification('Erro ao criar categoria.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
      addNotification(`Categoria "${name}" excluída`, 'success');
    } catch (err: any) {
      console.error(err);
      addNotification('Erro ao excluir categoria.', 'error');
    }
  };

  const renderCategoryRow = (category: Category) => {
    const isCustom = !category.is_default;
    const color = category.color || colors.textSecondary;

    const rowContent = (
      <View style={styles.categoryRow}>
        <View style={styles.categoryInfo}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
            <Ionicons
              name={category.icon as any || 'ellipsis-horizontal'}
              size={20}
              color={color}
            />
          </View>
          <View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryType}>
              {category.is_default ? 'Padrão do Sistema' : 'Personalizada'}
            </Text>
          </View>
        </View>

        {!isCustom ? (
          <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={styles.lockIcon} />
        ) : (
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} style={styles.lockIcon} />
        )}
      </View>
    );

    if (isCustom) {
      return (
        <SwipeableRow
          key={category.id}
          onDelete={() => handleDelete(category.id, category.name)}
        >
          {rowContent}
        </SwipeableRow>
      );
    }

    return (
      <Card key={category.id} padding="none" style={styles.defaultCard}>
        {rowContent}
      </Card>
    );
  };

  return (
    <ScreenContainer padding style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Categorias</Text>
      </View>

      <Text style={styles.subtitle}>
        Crie e organize categorias de gastos. Arraste para o lado nas categorias personalizadas para excluir.
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
          {categories.map(renderCategoryRow)}
        </ScrollView>
      )}

      {/* FAB Floating action button to open category creation */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenForm}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Custom Category Creation Dialog / Sheet Modal */}
      <Modal
        visible={isFormOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFormOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Categoria</Text>
              <Ionicons
                name="close"
                size={24}
                color={colors.textPrimary}
                onPress={() => setIsFormOpen(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Nome da Categoria"
                placeholder="Ex: Assinaturas, Mercado, etc."
                value={name}
                onChangeText={setName}
                autoFocus
              />

              {/* Color Grid Selector */}
              <Text style={styles.pickerLabel}>Escolha uma Cor</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((col) => {
                  const isSelected = selectedColor === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.colorPill,
                        { backgroundColor: col },
                        isSelected && styles.colorPillSelected,
                      ]}
                      onPress={() => setSelectedColor(col)}
                    />
                  );
                })}
              </View>

              {/* Icon Selection Panel */}
              <Text style={styles.pickerLabel}>Escolha um Ícone</Text>
              <View style={styles.iconGrid}>
                {PRESET_ICONS.map((ico) => {
                  const isSelected = selectedIcon === ico;
                  return (
                    <TouchableOpacity
                      key={ico}
                      style={[
                        styles.iconPill,
                        isSelected && styles.iconPillSelected,
                      ]}
                      onPress={() => setSelectedIcon(ico)}
                    >
                      <Ionicons
                        name={ico as any}
                        size={20}
                        color={isSelected ? colors.accent : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Trigger Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="ghost"
                  onPress={() => setIsFormOpen(false)}
                  style={styles.cancelBtn}
                />
                <Button
                  title="Criar"
                  variant="primary"
                  loading={submitting}
                  onPress={handleCreate}
                  style={styles.confirmBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  scrollList: {
    gap: spacing.sm,
    paddingBottom: 100, // room for FAB
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  categoryType: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lockIcon: {
    paddingHorizontal: spacing.xs,
  },
  defaultCard: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        boxShadow: 'none',
      },
      default: {
        shadowColor: 'transparent',
      },
    }),
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    backgroundColor: colors.accent,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  pickerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  colorPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorPillSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPillSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}10`,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});
