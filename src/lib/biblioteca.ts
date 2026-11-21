import { Cola } from '../estructuras/Cola';
import type { Pila } from '../estructuras/Pila';
import type { Libro } from '../types';
import type { Prestamo } from '../types/biblioteca';

export function calcularDisponibles(libro: Libro, prestamos: Prestamo[]): number {
  const delEstante = prestamos.filter(
    (prestamo) => prestamo.isbn === libro.isbn && prestamo.origen === 'estante',
  ).length;
  return Math.max(0, libro.ejemplares - delEstante);
}

export function posicionEnCola(cola: Cola<string> | undefined, nombre: string): number {
  if (!cola) {
    return 0;
  }
  return cola.aArray().indexOf(nombre) + 1;
}

export function ultimosDistintos(pila: Pila<string>, cantidad: number): string[] {
  const resultado: string[] = [];
  const desdeElTope = pila.aArray().reverse();
  for (const isbn of desdeElTope) {
    if (resultado.length === cantidad) {
      break;
    }
    if (!resultado.includes(isbn)) {
      resultado.push(isbn);
    }
  }
  return resultado;
}

export function colasDesdeListas(listas: Record<string, string[]>): Record<string, Cola<string>> {
  const colas: Record<string, Cola<string>> = {};
  for (const isbn of Object.keys(listas)) {
    colas[isbn] = new Cola<string>(listas[isbn]);
  }
  return colas;
}

export function colasAListas(colas: Record<string, Cola<string>>): Record<string, string[]> {
  const listas: Record<string, string[]> = {};
  for (const isbn of Object.keys(colas)) {
    listas[isbn] = colas[isbn].aArray();
  }
  return listas;
}

export function sincronizarPrestamo(prestamo: Prestamo, programados: string[]): Prestamo {
  const sigueProgramado =
    prestamo.notificacionId !== null && programados.includes(prestamo.notificacionId);
  if (prestamo.recordar && !sigueProgramado) {
    return { ...prestamo, recordar: false, notificacionId: null };
  }
  return prestamo;
}
