import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { useEstilos } from '../hooks/useTema';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    link: {
      minHeight: TAMANIO.tocableMinimo,
      minWidth: TAMANIO.tocableMinimo,
      paddingHorizontal: ESPACIO.sm,
      textAlignVertical: 'center',
      lineHeight: TAMANIO.tocableMinimo,
      fontSize: FUENTE.normal,
      fontWeight: '600',
      color: colores.primario,
    },
  });

export function LinkPersonal() {
  const estilos = useEstilos(crearEstilos);
  const { sesionIniciada } = useBiblioteca();

  return (
    <Link
      href={sesionIniciada ? '/mostrador' : '/login'}
      accessibilityRole="button"
      accessibilityHint="Acceso para el personal de la biblioteca">
      <Text style={estilos.link}>Personal</Text>
    </Link>
  );
}
