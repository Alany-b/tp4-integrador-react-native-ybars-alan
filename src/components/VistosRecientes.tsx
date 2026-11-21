import { FlatList, StyleSheet, Text, View } from 'react-native';

import { CANTIDAD_RECIENTES } from '../constants/biblioteca';
import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { useEstilos } from '../hooks/useTema';
import { ultimosDistintos } from '../lib/biblioteca';
import { TarjetaReciente } from './TarjetaReciente';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      gap: ESPACIO.sm,
    },
    titulo: {
      fontSize: FUENTE.normal,
      fontWeight: '700',
      color: colores.texto,
    },
    vacio: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
    },
    separador: {
      width: ESPACIO.sm,
    },
  });

function Separador() {
  const estilos = useEstilos(crearEstilos);
  return <View style={estilos.separador} />;
}

export function VistosRecientes() {
  const estilos = useEstilos(crearEstilos);
  const { recientes } = useBiblioteca();
  const ultimos = ultimosDistintos(recientes, CANTIDAD_RECIENTES);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Vistos recientemente
      </Text>
      <FlatList
        horizontal
        data={ultimos}
        keyExtractor={(isbn) => isbn}
        renderItem={({ item }) => <TarjetaReciente isbn={item} />}
        ItemSeparatorComponent={Separador}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={estilos.vacio}>Todavía no abriste ningún libro.</Text>
        }
      />
    </View>
  );
}
