import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { signIn, signUp } from '@/features/auth/services/authService';
import { useUiStore } from '@/store/uiStore';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { addNotification } = useUiStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!email.trim() || !password.trim()) {
      addNotification('Preencha e-mail e senha.', 'error');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      addNotification('Preencha seu nome completo.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, fullName.trim());
        addNotification('Cadastro efetuado! Faça login.', 'success');
        setIsSignUp(false);
        setPassword('');
      } else {
        await signIn(email.trim(), password);
        addNotification('Bem-vindo de volta!', 'success');
        // Redirect is handled automatically by the auth listener in AppProvider
      }
    } catch (err: any) {
      console.error(err);
      addNotification(err.message || 'Erro durante a autenticação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll padding style={styles.container}>
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoDollar}>$</Text>
        </View>
        <Text style={styles.appName}>Quanto Gastei?</Text>
        <Text style={styles.appSubtitle}>
          Gerenciamento inteligente de finanças e investimentos.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {isSignUp ? 'Criar Conta' : 'Acesse sua Conta'}
        </Text>

        {isSignUp && (
          <Input
            label="Nome Completo"
            placeholder="Nome Completo"
            leftIcon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}

        <Input
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          leftIcon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Senha"
          placeholder="••••••••"
          leftIcon="lock-closed-outline"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        <Button
          title={isSignUp ? 'Cadastrar' : 'Entrar'}
          variant="primary"
          loading={loading}
          onPress={handleAuthAction}
          style={styles.submitButton}
        />

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          style={styles.toggleContainer}
        >
          <Text style={styles.toggleText}>
            {isSignUp ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Entrar' : 'Cadastre-se'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.massive,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: spacing.huge,
    gap: spacing.sm,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoDollar: {
    color: '#FFFFFF',
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  appSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  toggleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  toggleLink: {
    color: colors.accentLight,
    fontWeight: fontWeight.bold,
  },
});
