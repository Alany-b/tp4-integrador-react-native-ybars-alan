import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import { obtenerTitulo } from '../lib/catalogo';

type Props = {
  isbn: string;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    tarjeta: {
      width: TAMANIO.anchoReciente,
      minHeight: TAMANIO.tocableMinimo,
      padding: ESPACIO.md,
      borderRadius: RADIO.chico,
      backgroundColor: colores.superficie,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.borde,
      justifyContent: 'center',
    },
    presionada: {
      opacity: 0.7,
    },
    titulo: {
      fontSize: FUENTE.chica,
      fontWeight: '600',
      color: colores.texto,
    },
  });

export function TarjetaReciente({ isbn }: Props) {
  const estilos = useEstilos(crearEstilos);
  const titulo = obtenerTitulo(isbn);

  function abrirDetalle() {
    router.push({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Visto recientemente: ${titulo}`}
      onPress={abrirDetalle}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      <Text style={estilos.titulo} numberOfLines={3}>
        {titulo}
      </Text>
    </Pressable>
  );
}
