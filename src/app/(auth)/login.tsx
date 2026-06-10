import React from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { loginSchema, LoginSchemaInput } from '@/features/auth/schemas/authSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

const getErrorMessage = (error: any): string => {
  if (!error) return '';
  const message = error.message || String(error);
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Por favor, confirme seu e-mail para poder acessar.';
  }
  if (message.includes('Network request failed')) {
    return 'Erro de rede. Verifique sua conexão com a internet.';
  }
  return message;
};

export default function LoginScreen() {
  const { loginMutation } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginSchemaInput) => {
    loginMutation.mutate(data);
  };

  return (
    <ScreenContainer scroll padding={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Header/Logo Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="wallet-outline" size={40} color={colors.accent} />
            </View>
            <Text style={styles.title}>Quanto Gastei?</Text>
            <Text style={styles.subtitle}>
              Gerencie seus gastos e investimentos de forma simples, inteligente e elegante.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* Error Banner */}
            {loginMutation.isError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.textPrimary} />
                <Text style={styles.errorBannerText}>
                  {getErrorMessage(loginMutation.error)}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="exemplo@email.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  editable={!loginMutation.isPending}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="Digite sua senha"
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  editable={!loginMutation.isPending}
                />
              )}
            />

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordContainer}
              disabled={loginMutation.isPending}
              hitSlop={8}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </Pressable>

            {/* Login Button */}
            <Button
              title="Entrar"
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <Pressable
              onPress={() => router.push('/(auth)/signup')}
              disabled={loginMutation.isPending}
              hitSlop={8}
            >
              <Text style={styles.signUpText}>Cadastre-se</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
    marginTop: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.accent,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  signUpText: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.accent,
  },
});
