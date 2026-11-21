export type OrigenPrestamo = 'estante' | 'mostrador';

export type Prestamo = {
  isbn: string;
  vence: string;
  origen: OrigenPrestamo;
  recordar: boolean;
  notificacionId: string | null;
};

export type Aviso = {
  id: string;
  texto: string;
};

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetida' }
  | { tipo: 'inexistente' };

export type EstadoGuardado = {
  prestamos: Prestamo[];
  colas: Record<string, string[]>;
  recientes: string[];
};
