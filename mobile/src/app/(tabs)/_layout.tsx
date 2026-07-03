import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Garantir une hauteur et une marge inférieure minimale pour remonter le menu
  // et éviter le chevauchement avec la barre système d'Android (touches retour/home)
  const paddingBottom = Math.max(insets.bottom, 16);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d1a',
          borderTopColor: '#0066cc33',
          borderTopWidth: 1,
          height: 48 + paddingBottom,
          paddingBottom: paddingBottom - 4,
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
        },
        tabBarIconStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CRA',
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budgets',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}
