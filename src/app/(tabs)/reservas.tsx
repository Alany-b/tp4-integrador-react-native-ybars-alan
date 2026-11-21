import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { EstadoNotificaciones } from '../../components/EstadoNotificaciones';
import { EstadoVacio } from '../../components/EstadoVacio';
import { TarjetaAviso } from '../../components/TarjetaAviso';
import { TarjetaEspera } from '../../components/TarjetaEspera';
import { TarjetaPrestamo } from '../../components/TarjetaPrestamo';
import { NOMBRE_ALUMNO } from '../../constants/biblioteca';
import { ESPACIO, type Colores } from '../../constants/tema';
import { useBiblioteca } from '../../hooks/useBiblioteca';
import { usePermiso } from '../../hooks/usePermiso';
import { useEstilos } from '../../hooks/useTema';
import { posicionEnCola } from '../../lib/biblioteca';
import type { Prestamo } from '../../types/biblioteca';

type Elemento =
  | { tipo: 'prestamo'; isbn: string; prestamo: Prestamo }
  | { tipo: 'espera'; isbn: string; posicion: number };

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
      gap: ESPACIO.sm,
    },
  });

export default function PantallaReservas() {
  const estilos = useEstilos(crearEstilos);
  const {
    prestamos,
    colas,
    avisos,
    activarRecordatorio,
    desactivarRecordatorio,
    devolver,
    descartarAviso,
  } = useBiblioteca();
  const permiso = usePermiso('notificaciones');

  const elementos: Elemento[] = [
    ...prestamos.map((prestamo): Elemento => ({ tipo: 'prestamo', isbn: prestamo.isbn, prestamo })),
    ...Object.keys(colas)
      .map((isbn): Elemento => ({ tipo: 'espera', isbn, posicion: posicionEnCola(colas[isbn], NOMBRE_ALUMNO) }))
      .filter((elemento) => elemento.tipo === 'espera' && elemento.posicion > 0),
  ];

  function cambiarRecordar(isbn: string, activar: boolean) {
    if (!activar) {
      desactivarRecordatorio(isbn);
      return;
    }
    if (permiso.estado === 'preguntable' || permiso.estado === 'cargando') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
      return;
    }
    activarRecordatorio(isbn);
  }

  return (
    <FlatList
      style={estilos.lista}
      contentContainerStyle={estilos.contenido}
      data={elementos}
      keyExtractor={(elemento) => elemento.isbn}
      renderItem={({ item }) =>
        item.tipo === 'prestamo' ? (
          <TarjetaPrestamo
            prestamo={item.prestamo}
            onCambiarRecordar={cambiarRecordar}
            onDevolver={devolver}
          />
        ) : (
          <TarjetaEspera isbn={item.isbn} posicion={item.posicion} />
        )
      }
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          {avisos.map((aviso) => (
            <TarjetaAviso key={aviso.id} aviso={aviso} onDescartar={descartarAviso} />
          ))}
          <EstadoNotificaciones estado={permiso.estado} onAbrirAjustes={permiso.abrirAjustes} />
        </View>
      }
      ListEmptyComponent={
        <EstadoVacio mensaje="Todavía no tenés préstamos ni reservas. Buscá un libro en el catálogo y tocá Reservar." />
      }
    />
  );
}
