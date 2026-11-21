import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '../components/CampoTexto';
import { EstadoCargando } from '../components/EstadoCargando';
import { EstadoError } from '../components/EstadoError';
import { EstadoVacio } from '../components/EstadoVacio';
import { FilaLibro } from '../components/FilaLibro';
import { ESPACIO, type Colores } from '../constants/tema';
import { useBusqueda } from '../hooks/useBusqueda';
import { useEstilos } from '../hooks/useTema';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    buscador: {
      padding: ESPACIO.lg,
    },
    contenido: {
      flexGrow: 1,
    },
  });

export default function PantallaBuscar() {
  const estilos = useEstilos(crearEstilos);
  const { q } = useLocalSearchParams<{ q?: string }>();
  const texto = typeof q === 'string' ? q : '';
  const { estado, resultados, error, reintentar } = useBusqueda(texto);

  function cambiarTexto(nuevo: string) {
    router.setParams({ q: nuevo === '' ? undefined : nuevo });
  }

  function contenidoSinResultados() {
    if (estado === 'cargando') {
      return <EstadoCargando mensaje={`Buscando "${texto.trim()}"...`} />;
    }
    if (estado === 'error') {
      return <EstadoError mensaje={error ?? ''} textoAccion="Reintentar" onAccion={reintentar} />;
    }
    if (estado === 'vacio') {
      return <EstadoVacio mensaje={`No encontramos libros para "${texto.trim()}". Probá con otra palabra.`} />;
    }
    return <EstadoVacio mensaje="Escribí el título o el autor del libro que buscás." />;
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.buscador}>
        <CampoTexto
          etiqueta="Título o autor"
          value={texto}
          onChangeText={cambiarTexto}
          placeholder="Ej.: Borges"
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <FlatList
        contentContainerStyle={estilos.contenido}
        data={resultados}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} />}
        ListEmptyComponent={contenidoSinResultados()}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
