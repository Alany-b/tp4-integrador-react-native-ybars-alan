import { StyleSheet, Switch, Text, View } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';
import { obtenerTitulo } from '../lib/catalogo';
import { formatearFecha } from '../lib/fechas';
import type { Prestamo } from '../types/biblioteca';
import { Boton } from './Boton';

type Props = {
  prestamo: Prestamo;
  onCambiarRecordar: (isbn: string, activar: boolean) => void;
  onDevolver: (isbn: string) => void;
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
      color: colores.exito,
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
    filaInterruptor: {
      minHeight: TAMANIO.tocableMinimo,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    textoInterruptor: {
      fontSize: FUENTE.normal,
      color: colores.texto,
    },
  });

export function TarjetaPrestamo({ prestamo, onCambiarRecordar, onDevolver }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();
  const titulo = obtenerTitulo(prestamo.isbn);

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.etiqueta}>PRÉSTAMO</Text>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>Devolución: {formatearFecha(prestamo.vence)}</Text>
      <View style={estilos.filaInterruptor}>
        <Text style={estilos.textoInterruptor}>Recordarme</Text>
        <Switch
          accessibilityLabel={`Recordarme la devolución de ${titulo}`}
          value={prestamo.recordar}
          onValueChange={(activar) => onCambiarRecordar(prestamo.isbn, activar)}
          trackColor={{ true: colores.primario, false: colores.borde }}
        />
      </View>
      <Boton
        titulo="Devolver"
        icono="return-down-back"
        variante="secundario"
        onPress={() => onDevolver(prestamo.isbn)}
      />
    </View>
  );
}
