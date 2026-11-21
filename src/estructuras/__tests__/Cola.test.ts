import { Cola } from '../Cola';

describe('Cola', () => {
  test('empieza vacía', () => {
    const cola = new Cola<string>();
    expect(cola.estaVacia()).toBe(true);
    expect(cola.tamanio).toBe(0);
    expect(cola.verFrente()).toBeUndefined();
  });

  test('desencolar respeta el orden de llegada', () => {
    const cola = new Cola<string>();
    cola.encolar('Ana');
    cola.encolar('Beto');
    cola.encolar('Carla');
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.desencolar()).toBe('Beto');
    expect(cola.verFrente()).toBe('Carla');
    expect(cola.tamanio).toBe(1);
  });

  test('desencolar una cola vacía devuelve undefined', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
  });

  test('se puede volver a encolar después de vaciarla', () => {
    const cola = new Cola<string>(['Ana']);
    cola.desencolar();
    expect(cola.desencolar()).toBeUndefined();
    cola.encolar('Beto');
    expect(cola.verFrente()).toBe('Beto');
    expect(cola.tamanio).toBe(1);
  });

  test('aArray devuelve solo los que siguen esperando', () => {
    const cola = new Cola<string>(['Ana', 'Beto', 'Carla']);
    cola.desencolar();
    expect(cola.aArray()).toEqual(['Beto', 'Carla']);
  });

  test('una cola creada desde otra no comparte los elementos', () => {
    const original = new Cola<string>(['Ana']);
    const copia = new Cola<string>(original.aArray());
    copia.encolar('Beto');
    expect(original.tamanio).toBe(1);
    expect(copia.tamanio).toBe(2);
  });
});
