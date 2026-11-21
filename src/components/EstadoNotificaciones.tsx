import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import type { EstadoPermiso } from '../types/permisos';
import { Boton } from './Boton';

type Props = {
  estado: EstadoPermiso;
  onAbrirAjustes: () => void;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    caja: {
      padding: ESPACIO.md,
      borderRadius: RADIO.chico,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      gap: ESPACIO.sm,
    },
    texto: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
    },
  });

function textoSegunEstado(estado: EstadoPermiso): string {
  if (estado === 'concedido') {
    return 'Notificaciones permitidas: los recordatorios te llegan aunque la app esté cerrada.';
  }
  if (estado === 'bloqueado') {
    return 'Notificaciones bloqueadas: los recordatorios y avisos te van a aparecer acá, dentro de la app.';
  }
  if (estado === 'preguntable') {
    return 'Las notificaciones se piden cuando actives "Recordarme" en un préstamo.';
  }
  return 'Revisando el permiso de notificaciones...';
}

export function EstadoNotificaciones({ estado, onAbrirAjustes }: Props) {
  const estilos = useEstilos(crearEstilos);

  return (
    <View style={estilos.caja}>
      <Text style={estilos.texto}>{textoSegunEstado(estado)}</Text>
      {estado === 'bloqueado' ? (
        <Boton titulo="Abrir Ajustes" icono="settings-outline" variante="secundario" onPress={onAbrirAjustes} />
      ) : null}
    </View>
  );
}
