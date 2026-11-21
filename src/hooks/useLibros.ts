import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

const MENSAJE_ERROR = 'No pudimos cargar el catálogo. Revisá tu conexión y probá de nuevo.';

type ResultadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): ResultadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    obtenerLibros()
      .then((datos) => {
        if (activo) {
          setLibros(datos);
          setCargando(false);
        }
      })
      .catch(() => {
        if (activo) {
          setError(MENSAJE_ERROR);
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
