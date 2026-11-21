import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { TAMANIO } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string;
  onPress: () => void;
};

const estilos = StyleSheet.create({
  base: {
    minHeight: TAMANIO.tocableMinimo,
    minWidth: TAMANIO.tocableMinimo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: 0.6,
  },
});

export function BotonIcono({ icono, etiqueta, onPress }: Props) {
  const colores = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={onPress}
      style={({ pressed }) => [estilos.base, pressed && estilos.presionado]}>
      <Ionicons name={icono} size={TAMANIO.icono} color={colores.textoSuave} />
    </Pressable>
  );
}
