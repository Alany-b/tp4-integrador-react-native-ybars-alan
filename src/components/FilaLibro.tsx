import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    fila: {
      minHeight: TAMANIO.tocableMinimo,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.md,
      backgroundColor: colores.superficie,
      borderBottomWidth: TAMANIO.bordeFino,
      borderBottomColor: colores.borde,
      gap: ESPACIO.md,
    },
    presionada: {
      backgroundColor: colores.fondo,
    },
    textos: {
      flex: 1,
      gap: ESPACIO.xs,
    },
    titulo: {
      fontSize: FUENTE.normal,
      fontWeight: '600',
      color: colores.texto,
    },
    autor: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
    },
  });

export function FilaLibro({ libro }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  function abrirDetalle() {
    router.push({ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      accessibilityHint="Abre la ficha del libro"
      onPress={abrirDetalle}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{libro.titulo}</Text>
        <Text style={estilos.autor}>
          {libro.autor} · {libro.anio}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={TAMANIO.icono} color={colores.textoSuave} />
    </Pressable>
  );
}
