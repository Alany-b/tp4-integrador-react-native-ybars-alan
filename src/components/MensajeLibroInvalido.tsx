import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

type Props = {
  titulo: string;
  mensaje: string;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ESPACIO.xl,
      gap: ESPACIO.md,
      backgroundColor: colores.fondo,
    },
    titulo: {
      fontSize: FUENTE.grande,
      fontWeight: '700',
      color: colores.texto,
      textAlign: 'center',
    },
    mensaje: {
      fontSize: FUENTE.normal,
      color: colores.textoSuave,
      textAlign: 'center',
    },
    link: {
      minHeight: TAMANIO.tocableMinimo,
      lineHeight: TAMANIO.tocableMinimo,
      fontSize: FUENTE.normal,
      fontWeight: '600',
      color: colores.primario,
    },
  });

export function MensajeLibroInvalido({ titulo, mensaje }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="help-circle-outline" size={TAMANIO.iconoGrande} color={colores.textoSuave} />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
      <Link href="/" dismissTo accessibilityRole="button">
        <Text style={estilos.link}>Volver al catálogo</Text>
      </Link>
    </View>
  );
}
