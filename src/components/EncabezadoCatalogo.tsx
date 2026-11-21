import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import { AccesosCatalogo } from './AccesosCatalogo';
import { VistosRecientes } from './VistosRecientes';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      padding: ESPACIO.lg,
      gap: ESPACIO.lg,
    },
    titulo: {
      fontSize: FUENTE.normal,
      fontWeight: '700',
      color: colores.texto,
    },
  });

export function EncabezadoCatalogo() {
  const estilos = useEstilos(crearEstilos);

  return (
    <View style={estilos.contenedor}>
      <VistosRecientes />
      <AccesosCatalogo />
      <Text style={estilos.titulo} accessibilityRole="header">
        Todos los libros
      </Text>
    </View>
  );
}
