import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { useTema } from '../../hooks/useTema';

type PropsIcono = {
  color: ColorValue;
  size: number;
};

function iconoCatalogo({ color, size }: PropsIcono) {
  return <Ionicons name="library-outline" color={typeof color === 'string' ? color : undefined} size={size} />;
}

function iconoReservas({ color, size }: PropsIcono) {
  return <Ionicons name="bookmark-outline" color={typeof color === 'string' ? color : undefined} size={size} />;
}

export default function LayoutPestanias() {
  const colores = useTema();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colores.primario }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{ title: 'Catálogo', headerShown: false, tabBarIcon: iconoCatalogo }}
      />
      <Tabs.Screen
        name="reservas"
        options={{ title: 'Mis reservas', tabBarIcon: iconoReservas }}
      />
    </Tabs>
  );
}
