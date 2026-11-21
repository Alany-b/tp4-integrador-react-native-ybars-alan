import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import { obtenerTitulo } from '../lib/catalogo';

type Props = {
  isbn: string;
  posicion: number;
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
    etiqueta: {
      fontSize: FUENTE.chica,
      fontWeight: '700',
      color: colores.aviso,
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

export function TarjetaEspera({ isbn, posicion }: Props) {
  const estilos = useEstilos(crearEstilos);
  const textoPosicion =
    posicion === 1 ? 'Sos la próxima persona en la lista.' : `Estás en la posición ${posicion} de la lista.`;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.etiqueta}>EN ESPERA</Text>
      <Text style={estilos.titulo}>{obtenerTitulo(isbn)}</Text>
      <Text style={estilos.detalle}>{textoPosicion}</Text>
    </View>
  );
}
