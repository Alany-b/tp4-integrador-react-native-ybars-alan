import type { Libro } from '../types';

export const LIBROS: Libro[] = [
  { isbn: '9789872601812', titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, ejemplares: 2 },
  { isbn: '9789879083017', titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, ejemplares: 0 },
  { isbn: '9789876131865', titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, ejemplares: 1 },
  { isbn: '9789509139091', titulo: 'Bestiario', autor: 'Julio Cortázar', anio: 1951, ejemplares: 3 },
  { isbn: '9789870308249', titulo: 'Martín Fierro', autor: 'José Hernández', anio: 1872, ejemplares: 2 },
  { isbn: '9789872819484', titulo: 'Facundo', autor: 'Domingo Faustino Sarmiento', anio: 1845, ejemplares: 1 },
  { isbn: '9789501993516', titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948, ejemplares: 0 },
  { isbn: '9789509093782', titulo: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', anio: 1961, ejemplares: 1 },
  { isbn: '9789875797543', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, ejemplares: 0 },
  { isbn: '9789502319483', titulo: 'Don Segundo Sombra', autor: 'Ricardo Güiraldes', anio: 1926, ejemplares: 2 },
  { isbn: '9789875749115', titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', anio: 1943, ejemplares: 4 },
  { isbn: '9789872527600', titulo: 'Las venas abiertas de América Latina', autor: 'Eduardo Galeano', anio: 1971, ejemplares: 1 },
  { isbn: '9789508955593', titulo: 'Toda Mafalda', autor: 'Quino', anio: 1993, ejemplares: 2 },
  { isbn: '9789879711477', titulo: 'Los siete locos', autor: 'Roberto Arlt', anio: 1929, ejemplares: 1 },
  { isbn: '9789500497466', titulo: 'La invención de Morel', autor: 'Adolfo Bioy Casares', anio: 1940, ejemplares: 0 },
  { isbn: '9788499890944', titulo: '1984', autor: 'George Orwell', anio: 1949, ejemplares: 2 },
  { isbn: '9788420674209', titulo: 'El extranjero', autor: 'Albert Camus', anio: 1942, ejemplares: 1 },
];

export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789879083017': ['Lucía Gómez', 'Martín Ríos'],
  '9789501993516': ['Sofía Benítez'],
};
