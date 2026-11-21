import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '../constants/biblioteca';

export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function crearCanalPrestamos(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: 'Préstamos',
    description: 'Recordatorios de devolución y libros listos para retirar',
    importance: AndroidImportance.HIGH,
  });
}

export async function consultarPermisoNotificaciones(): Promise<Notifications.NotificationPermissionsStatus> {
  return Notifications.getPermissionsAsync();
}

export async function pedirPermisoNotificaciones(): Promise<Notifications.NotificationPermissionsStatus> {
  await crearCanalPrestamos();
  return Notifications.requestPermissionsAsync();
}

export async function notificacionesPermitidas(): Promise<boolean> {
  try {
    const respuesta = await consultarPermisoNotificaciones();
    return respuesta.granted;
  } catch {
    return false;
  }
}

export async function programarRecordatorio(titulo: string): Promise<string> {
  await crearCanalPrestamos();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución',
      body: `Acordate de devolver "${titulo}" en la biblioteca.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(identificador: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identificador);
  } catch {
    return;
  }
}

export async function obtenerRecordatoriosProgramados(): Promise<string[]> {
  try {
    const programadas = await Notifications.getAllScheduledNotificationsAsync();
    return programadas.map((notificacion) => notificacion.identifier);
  } catch {
    return [];
  }
}

export async function avisarLibroListo(titulo: string): Promise<void> {
  await crearCanalPrestamos();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Te toca un libro!',
      body: `Ya podés retirar "${titulo}" en el mostrador de la biblioteca.`,
    },
    trigger: { channelId: CANAL_PRESTAMOS },
  });
}
