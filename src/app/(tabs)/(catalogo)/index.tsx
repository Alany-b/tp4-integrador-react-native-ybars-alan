import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { EstadoCargando } from '../../../components/EstadoCargando';
import { EstadoError } from '../../../components/EstadoError';
import { EstadoVacio } from '../../../components/EstadoVacio';
import { FilaLibro } from '../../../components/FilaLibro';
import type { Colores } from '../../../constants/tema';
import { useLibros } from '../../../hooks/useLibros';
import { useEstilos } from '../../../hooks/useTema';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    lista: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    contenido: {
      flexGrow: 1,
    },
  });

export default function PantallaCatalogo() {
  const estilos = useEstilos(crearEstilos);
  const { libros, cargando, error, reintentar } = useLibros();

  function contenidoSinLibros() {
    if (cargando) {
      return <EstadoCargando mensaje="Cargando el catálogo..." />;
    }
    if (error) {
      return <EstadoError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />;
    }
    return <EstadoVacio mensaje="Por ahora no hay libros en el catálogo." />;
  }

  return (
    <FlatList
      style={estilos.lista}
      contentContainerStyle={estilos.contenido}
      data={cargando || error ? [] : libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} />}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={contenidoSinLibros()}
    />
  );
}
