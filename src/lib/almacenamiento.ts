import AsyncStorage from '@react-native-async-storage/async-storage';

import { CLAVE_ALMACENAMIENTO } from '../constants/biblioteca';
import type { EstadoGuardado } from '../types/biblioteca';

function esEstadoGuardado(valor: unknown): valor is EstadoGuardado {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  return 'prestamos' in valor && 'colas' in valor && 'recientes' in valor;
}

export async function cargarEstado(): Promise<EstadoGuardado | null> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (texto === null) {
      return null;
    }
    const datos: unknown = JSON.parse(texto);
    if (esEstadoGuardado(datos)) {
      return datos;
    }
    return null;
  } catch {
    return null;
  }
}

export async function guardarEstado(estado: EstadoGuardado): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estado));
  } catch {
    return;
  }
}
