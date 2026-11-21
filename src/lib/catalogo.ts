import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

const PATRON_ISBN = /^\d{13}$/;

export function esIsbnValido(valor: string): boolean {
  return PATRON_ISBN.test(valor);
}

export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}

export function obtenerTitulo(isbn: string): string {
  const libro = buscarLibroPorIsbn(isbn);
  if (libro) {
    return libro.titulo;
  }
  return 'Libro sin datos';
}
