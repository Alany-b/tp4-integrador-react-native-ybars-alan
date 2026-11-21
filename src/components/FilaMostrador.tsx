import { StyleSheet, Text, View } from 'react-native';

import { NOMBRE_ALUMNO } from '../constants/biblioteca';
import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import { obtenerTitulo } from '../lib/catalogo';
import { Boton } from './Boton';

type Props = {
  isbn: string;
  frente: string;
  cantidad: number;
  onEntregar: (isbn: string) => void;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    tarjeta: {
      padding: ESPACIO.lg,
      borderRadius: RADIO.grande,
      backgroundColor: colores.superficie,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.borde,
      gap: ESPACIO.sm,
    },
    titulo: {
      fontSize: FUENTE.normal,
      fontWeight: '700',
      color: colores.texto,
    },
    detalle: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
    },
  });

export function FilaMostrador({ isbn, frente, cantidad, onEntregar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const nombre = frente === NOMBRE_ALUMNO ? `${frente} (vos)` : frente;
  const textoCantidad = cantidad === 1 ? '1 persona espera' : `${cantidad} personas esperan`;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{obtenerTitulo(isbn)}</Text>
      <Text style={estilos.detalle}>Al frente: {nombre}</Text>
      <Text style={estilos.detalle}>{textoCantidad}</Text>
      <Boton titulo="Entregar al siguiente" icono="hand-right-outline" onPress={() => onEntregar(isbn)} />
    </View>
  );
}
