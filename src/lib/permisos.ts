import type { PermissionResponse } from 'expo';
import * as Linking from 'expo-linking';

import type { EstadoPermiso, Recurso } from '../types/permisos';

export function estadoDesdeRespuesta(respuesta: PermissionResponse | null): EstadoPermiso {
  if (respuesta === null) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  if (respuesta.canAskAgain) {
    return 'preguntable';
  }
  return 'bloqueado';
}

export function esRecurso(valor: string): valor is Recurso {
  return valor === 'camara' || valor === 'notificaciones';
}

export async function abrirAjustes(): Promise<void> {
  await Linking.openSettings();
}
