import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';
import type { Aviso } from '../types/biblioteca';
import { BotonIcono } from './BotonIcono';

type Props = {
  aviso: Aviso;
  onDescartar: (id: string) => void;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ESPACIO.sm,
      paddingLeft: ESPACIO.md,
      borderRadius: RADIO.chico,
      backgroundColor: colores.fondoAviso,
    },
    texto: {
      flex: 1,
      paddingVertical: ESPACIO.md,
      fontSize: FUENTE.chica,
      color: colores.aviso,
    },
  });

export function TarjetaAviso({ aviso, onDescartar }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.tarjeta} accessibilityLiveRegion="polite">
      <Ionicons name="notifications-outline" size={TAMANIO.icono} color={colores.aviso} />
      <Text style={estilos.texto}>{aviso.texto}</Text>
      <BotonIcono icono="close" etiqueta="Descartar aviso" onPress={() => onDescartar(aviso.id)} />
    </View>
  );
}
