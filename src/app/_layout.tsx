import React, { useEffect } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/providers/AppProvider';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';

function AuthGuard() {
  const { initialized, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inCategoriesGroup = segments[0] === 'categories';
    const isAtLogin = segments[0] === 'login';

    // If the user is not logged in and they are trying to access protected screens, redirect to login
    if (!user && (inTabsGroup || inCategoriesGroup)) {
      router.replace('/login');
    }
    
    // If the user is logged in and they are trying to access the login page, redirect to home
    if (user && isAtLogin) {
      router.replace('/(tabs)');
    }
  }, [user, initialized, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <AuthGuard />
      </AppProvider>
    </SafeAreaProvider>
  );
}
