import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

type Props = {
  mensaje: string;
  children?: ReactNode;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ESPACIO.xl,
      gap: ESPACIO.lg,
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.textoSuave,
      textAlign: 'center',
    },
  });

export function EstadoVacio({ mensaje, children }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="library-outline" size={TAMANIO.iconoGrande} color={colores.textoSuave} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {children}
    </View>
  );
}
