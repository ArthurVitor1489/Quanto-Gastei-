import React from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { resetPasswordSchema, ResetPasswordSchemaInput } from '@/features/auth/schemas/authSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

const getErrorMessage = (error: any): string => {
  if (!error) return '';
  const message = error.message || String(error);
  if (message.includes('User not found') || message.includes('user_not_found')) {
    return 'Não foi encontrado nenhum usuário com este e-mail.';
  }
  if (message.includes('Network request failed')) {
    return 'Erro de rede. Verifique sua conexão com a internet.';
  }
  return message;
};

export default function ForgotPasswordScreen() {
  const { resetPasswordMutation } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ResetPasswordSchemaInput) => {
    resetPasswordMutation.mutate(data);
  };

  if (resetPasswordMutation.isSuccess) {
    return (
      <ScreenContainer padding={false}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>E-mail enviado!</Text>
          <Text style={styles.successDescription}>
            Enviamos um link de recuperação para o e-mail informado. Por favor, verifique sua caixa de entrada (e pasta de spam se necessário).
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
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Insira o e-mail cadastrado na sua conta. Nós lhe enviaremos as instruções para redefinir a senha.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {/* Error Banner */}
            {resetPasswordMutation.isError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.textPrimary} />
                <Text style={styles.errorBannerText}>
                  {getErrorMessage(resetPasswordMutation.error)}
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
                  editable={!resetPasswordMutation.isPending}
                />
              )}
            />

            {/* Recovery Button */}
            <Button
              title="Recuperar Senha"
              onPress={handleSubmit(onSubmit)}
              loading={resetPasswordMutation.isPending}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              disabled={resetPasswordMutation.isPending}
              hitSlop={8}
            >
              <Text style={styles.backToLoginText}>Voltar para o Login</Text>
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
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backToLoginText: {
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
