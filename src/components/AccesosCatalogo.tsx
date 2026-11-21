import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ESPACIO } from '../constants/tema';
import { Boton } from './Boton';

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: ESPACIO.sm,
  },
  boton: {
    flex: 1,
  },
});

export function AccesosCatalogo() {
  function irABuscar() {
    router.push('/buscar');
  }

  function irAEscanear() {
    router.push('/escanear');
  }

  return (
    <View style={estilos.fila}>
      <View style={estilos.boton}>
        <Boton titulo="Buscar" icono="search" onPress={irABuscar} variante="secundario" />
      </View>
      <View style={estilos.boton}>
        <Boton titulo="Escanear" icono="barcode-outline" onPress={irAEscanear} variante="secundario" />
      </View>
    </View>
  );
}
