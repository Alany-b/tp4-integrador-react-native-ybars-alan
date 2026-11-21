import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

type Props = {
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
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.textoSuave,
      textAlign: 'center',
    },
  });

export function EstadoCargando({ mensaje }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}
