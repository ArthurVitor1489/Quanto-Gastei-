import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export default function AuthLayout() {
  const { isAuthenticated, initialized } = useAuth();

  // If the app is initializing and recovering user session, show loading
  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Redirect to home if user is already authenticated
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerTitle: '' }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: '' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
