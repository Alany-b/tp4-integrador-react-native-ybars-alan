import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';
import { Boton } from './Boton';

type Props = {
  mensaje: string;
  textoAccion: string;
  onAccion: () => void;
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
      color: colores.texto,
      textAlign: 'center',
    },
  });

export function EstadoError({ mensaje, textoAccion, onAccion }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="cloud-offline-outline" size={TAMANIO.iconoGrande} color={colores.peligro} />
      <Text style={estilos.texto} accessibilityRole="alert">
        {mensaje}
      </Text>
      <Boton titulo={textoAccion} onPress={onAccion} icono="refresh" />
    </View>
  );
}
