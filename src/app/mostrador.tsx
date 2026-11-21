import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { EstadoVacio } from '../components/EstadoVacio';
import { FilaMostrador } from '../components/FilaMostrador';
import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { useEstilos } from '../hooks/useTema';
import { obtenerTitulo } from '../lib/catalogo';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    lista: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    contenido: {
      flexGrow: 1,
      padding: ESPACIO.lg,
      gap: ESPACIO.md,
    },
    encabezado: {
      gap: ESPACIO.md,
    },
    resultado: {
      fontSize: FUENTE.chica,
      color: colores.exito,
    },
  });

export default function PantallaMostrador() {
  const estilos = useEstilos(crearEstilos);
  const { colas, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [ultimaEntrega, setUltimaEntrega] = useState<string | null>(null);

  const conEspera = Object.keys(colas).filter((isbn) => !colas[isbn].estaVacia());

  async function entregar(isbn: string) {
    const persona = await entregarAlSiguiente(isbn);
    if (persona === null) {
      setUltimaEntrega('Ese libro ya no tiene personas esperando.');
      return;
    }
    setUltimaEntrega(`Entregaste "${obtenerTitulo(isbn)}" a ${persona}.`);
  }

  return (
    <FlatList
      style={estilos.lista}
      contentContainerStyle={estilos.contenido}
      data={conEspera}
      keyExtractor={(isbn) => isbn}
      renderItem={({ item }) => (
        <FilaMostrador
          isbn={item}
          frente={colas[item].verFrente() ?? ''}
          cantidad={colas[item].tamanio}
          onEntregar={entregar}
        />
      )}
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          <Boton titulo="Cerrar sesión" icono="log-out-outline" variante="peligro" onPress={cerrarSesion} />
          {ultimaEntrega ? (
            <Text style={estilos.resultado} accessibilityLiveRegion="polite">
              {ultimaEntrega}
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={<EstadoVacio mensaje="No hay libros con lista de espera en este momento." />}
    />
  );
}
