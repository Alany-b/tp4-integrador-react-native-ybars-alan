import type { Recurso } from '../types/permisos';

export const TEXTOS_PERMISO: Record<Recurso, { titulo: string; beneficio: string }> = {
  camara: {
    titulo: 'Cámara',
    beneficio: 'Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Usamos las notificaciones para recordarte la devolución y avisarte cuando te toca un libro reservado.',
  },
};
