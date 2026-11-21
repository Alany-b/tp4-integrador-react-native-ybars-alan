export class Cola<T> {
  #items: T[];
  #inicio: number;

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
    this.#inicio = 0;
  }

  encolar(item: T): void {
    this.#items.push(item);
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items[this.#inicio];
    this.#inicio = this.#inicio + 1;
    return item;
  }

  verFrente(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    return this.#items[this.#inicio];
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  get tamanio(): number {
    return this.#items.length - this.#inicio;
  }

  aArray(): T[] {
    return this.#items.slice(this.#inicio);
  }
}
