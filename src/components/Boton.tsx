import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  icono?: ComponentProps<typeof Ionicons>['name'];
  pista?: string;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    base: {
      minHeight: TAMANIO.tocableMinimo,
      minWidth: TAMANIO.tocableMinimo,
      paddingHorizontal: ESPACIO.lg,
      paddingVertical: ESPACIO.sm,
      borderRadius: RADIO.chico,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ESPACIO.sm,
    },
    primario: {
      backgroundColor: colores.primario,
    },
    secundario: {
      backgroundColor: colores.superficie,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.primario,
    },
    peligro: {
      backgroundColor: colores.superficie,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.peligro,
    },
    presionado: {
      opacity: 0.7,
    },
    deshabilitado: {
      opacity: 0.45,
    },
    texto: {
      fontSize: FUENTE.normal,
      fontWeight: '600',
    },
    textoPrimario: {
      color: colores.textoSobrePrimario,
    },
    textoSecundario: {
      color: colores.primario,
    },
    textoPeligro: {
      color: colores.peligro,
    },
  });

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado = false, icono, pista }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  const estiloTexto =
    variante === 'primario'
      ? estilos.textoPrimario
      : variante === 'peligro'
        ? estilos.textoPeligro
        : estilos.textoSecundario;

  const colorIcono =
    variante === 'primario'
      ? colores.textoSobrePrimario
      : variante === 'peligro'
        ? colores.peligro
        : colores.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={pista}
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        pressed && estilos.presionado,
        deshabilitado && estilos.deshabilitado,
      ]}>
      {icono ? <Ionicons name={icono} size={TAMANIO.icono} color={colorIcono} /> : null}
      <Text style={[estilos.texto, estiloTexto]}>{titulo}</Text>
    </Pressable>
  );
}
