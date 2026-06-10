import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import ScreenContainer from '@/components/ScreenContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';
import { DisplayCurrency } from '@/types/portfolio';

const CURRENCIES: DisplayCurrency[] = ['BRL', 'USD', 'EUR'];

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, signOutMutation, updateProfileMutation } = useAuth();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [defaultCurrency, setDefaultCurrency] = useState<DisplayCurrency>(
    (profile?.default_currency || 'BRL') as DisplayCurrency
  );
  
  const [isResetting, setResetting] = useState(false);

  // Sync state if profile loads asynchronously
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setDefaultCurrency((profile.default_currency || 'BRL') as DisplayCurrency);
    }
  }, [profile]);

  const handleSave = () => {
    if (!displayName.trim()) {
      Alert.alert('Erro', 'O nome de exibição não pode ser vazio.');
      return;
    }

    updateProfileMutation.mutate(
      {
        display_name: displayName.trim(),
        default_currency: defaultCurrency,
      },
      {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Configurações atualizadas com sucesso.');
          router.back();
        },
        onError: (err: any) => {
          Alert.alert('Erro ao Salvar', err.message || 'Não foi possível atualizar as configurações.');
        },
      }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            signOutMutation.mutate(undefined, {
              onSuccess: () => {
                // Reroute is handled automatically by auth guard in _layout.tsx
                router.replace('/(auth)/login');
              },
            });
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    if (!profile?.id) return;

    Alert.alert(
      'Limpar Todos os Dados',
      'Tem certeza que deseja excluir permanentemente todas as suas transações e categorias personalizadas? Esta ação NÃO pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              
              // 1. Excluir todas as transações do usuário
              const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', profile.id);

              if (txError) throw txError;

              // 2. Excluir todas as categorias customizadas do usuário
              const { error: catError } = await supabase
                .from('categories')
                .delete()
                .eq('user_id', profile.id)
                .eq('is_default', false);

              if (catError) throw catError;

              queryClient.invalidateQueries();
              Alert.alert('Sucesso', 'Todos os seus dados (transações e categorias personalizadas) foram excluídos com sucesso.');
            } catch (err: any) {
              Alert.alert('Erro ao excluir', err.message || 'Não foi possível limpar os dados.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };


  const isSaving = updateProfileMutation.isPending;
  const isLoggingOut = signOutMutation.isPending;

  return (
    <ScreenContainer scroll padding={false} style={styles.container}>
      <Header title="Configurações" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        {/* Profile Card Section */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Perfil do Usuário</Text>
          
          <Input
            label="Nome de Exibição"
            placeholder="Seu nome completo"
            value={displayName}
            onChangeText={setDisplayName}
            autoCorrect={false}
          />
          
          <Text style={styles.emailLabel}>Email Cadastrado</Text>
          <Text style={styles.emailValue}>{profile?.email || 'Sem email'}</Text>
        </Card>

        {/* Preferences Section */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <Text style={styles.fieldLabel}>Moeda Principal</Text>
          <Text style={styles.fieldDescription}>
            Define a moeda padrão exibida no Dashboard, Patrimônio e Relatórios.
          </Text>

          <View style={styles.currencySelector}>
            {CURRENCIES.map((currency) => {
              const isActive = defaultCurrency === currency;
              return (
                <Pressable
                  key={currency}
                  onPress={() => setDefaultCurrency(currency)}
                  style={[
                    styles.pill,
                    isActive ? styles.activePill : styles.inactivePill,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive ? styles.activePillText : styles.inactivePillText,
                    ]}
                  >
                    {currency}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Danger Zone Section */}
        <Card padding="lg" style={[styles.sectionCard, styles.dangerCard]}>
          <Text style={[styles.sectionTitle, { color: colors.expenseLight }]}>Zona de Perigo</Text>
          
          <Text style={styles.dangerLabel}>Apagar todos os dados</Text>
          <Text style={styles.dangerDescription}>
            Apaga permanentemente todo o seu histórico de receitas, despesas e categorias personalizadas.
          </Text>
          
          <Button
            title="Excluir Todos os Meus Dados"
            onPress={handleResetData}
            variant="danger"
            size="md"
            loading={isResetting}
            style={styles.dangerActionBtn}
          />
        </Card>

        {/* Buttons Panel */}
        <View style={styles.actionsPanel}>
          <Button
            title="Salvar Alterações"
            onPress={handleSave}
            variant="primary"
            size="lg"
            loading={isSaving}
          />

          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="secondary"
            size="lg"
            loading={isLoggingOut}
            style={styles.logoutBtn}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
    gap: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emailLabel: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  emailValue: {
    fontFamily,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  fieldLabel: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fieldDescription: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  activePill: {
    backgroundColor: colors.accent,
  },
  inactivePill: {
    backgroundColor: 'transparent',
  },
  pillText: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  activePillText: {
    color: '#0D1117',
  },
  inactivePillText: {
    color: colors.textSecondary,
  },
  dangerCard: {
    borderColor: `${colors.expense}40`,
  },
  dangerLabel: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dangerDescription: {
    fontFamily,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dangerActionBtn: {
    alignSelf: 'flex-start',
  },
  actionsPanel: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  logoutBtn: {
    borderColor: colors.expense,
  },
});
