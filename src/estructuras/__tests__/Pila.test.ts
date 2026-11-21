import { describe, expect, test } from '@jest/globals';
import { Pila } from '../Pila';

describe('Pila', () => {
  test('empieza vacía', () => {
    const pila = new Pila<string>();
    expect(pila.estaVacia()).toBe(true);
    expect(pila.tamanio).toBe(0);
    expect(pila.verTope()).toBeUndefined();
  });

  test('apilar deja el último elemento en el tope', () => {
    const pila = new Pila<string>();
    pila.apilar('a');
    pila.apilar('b');
    expect(pila.verTope()).toBe('b');
    expect(pila.tamanio).toBe(2);
  });

  test('desapilar devuelve los elementos en orden inverso', () => {
    const pila = new Pila<number>([1, 2, 3]);
    expect(pila.desapilar()).toBe(3);
    expect(pila.desapilar()).toBe(2);
    expect(pila.desapilar()).toBe(1);
    expect(pila.estaVacia()).toBe(true);
  });

  test('desapilar una pila vacía devuelve undefined', () => {
    const pila = new Pila<number>();
    expect(pila.desapilar()).toBeUndefined();
    expect(pila.tamanio).toBe(0);
  });

  test('aArray devuelve una copia de base a tope', () => {
    const pila = new Pila<string>(['a', 'b']);
    const copia = pila.aArray();
    copia.push('c');
    expect(pila.aArray()).toEqual(['a', 'b']);
  });
});
