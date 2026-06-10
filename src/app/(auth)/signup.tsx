import React from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { signUpSchema, SignUpSchemaInput } from '@/features/auth/schemas/authSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

const getErrorMessage = (error: any): string => {
  if (!error) return '';
  const message = error.message || String(error);
  if (message.includes('User already registered')) {
    return 'Este e-mail já está em uso. Tente outro ou faça login.';
  }
  if (message.includes('Network request failed')) {
    return 'Erro de rede. Verifique sua conexão com a internet.';
  }
  return message;
};

export default function SignUpScreen() {
  const { signUpMutation } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: SignUpSchemaInput) => {
    signUpMutation.mutate(data);
  };

  // If signup succeeded and no session is returned, user needs to confirm email
  const showEmailConfirmation = signUpMutation.isSuccess && !signUpMutation.data?.session;

  if (showEmailConfirmation) {
    return (
      <ScreenContainer padding={false}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="mail-unread-outline" size={60} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Verifique seu e-mail</Text>
          <Text style={styles.successDescription}>
            Enviamos um link de confirmação para o endereço cadastrado. Por favor, acesse seu e-mail para ativar sua conta.
          </Text>
          <Button
            title="Voltar para o Login"
            onPress={() => router.replace('/(auth)/login')}
            variant="outline"
            size="md"
            style={styles.successBtn}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padding={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Comece a controlar seus gastos e planejar sua liberdade financeira.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* Error Banner */}
            {signUpMutation.isError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.textPrimary} />
                <Text style={styles.errorBannerText}>
                  {getErrorMessage(signUpMutation.error)}
                </Text>
              </View>
            )}

            {/* Full Name Field */}
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  editable={!signUpMutation.isPending}
                />
              )}
            />

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
                  editable={!signUpMutation.isPending}
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
                  placeholder="No mínimo 6 caracteres"
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  editable={!signUpMutation.isPending}
                />
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmar Senha"
                  placeholder="Digite a senha novamente"
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  editable={!signUpMutation.isPending}
                />
              )}
            />

            {/* Sign Up Button */}
            <Button
              title="Criar Conta"
              onPress={handleSubmit(onSubmit)}
              loading={signUpMutation.isPending}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              disabled={signUpMutation.isPending}
              hitSlop={8}
            >
              <Text style={styles.loginLinkText}>Entre</Text>
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
    marginBottom: spacing.xl,
    marginTop: spacing.massive,
  },
  title: {
    fontFamily,
    fontSize: fontSize.xxxl,
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
    marginBottom: spacing.xl,
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
  submitBtn: {
    marginTop: spacing.md,
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
  loginLinkText: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.accent,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontFamily,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successDescription: {
    fontFamily,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.huge,
  },
  successBtn: {
    alignSelf: 'stretch',
  },
});
