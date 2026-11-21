import { useCallback, useEffect, useState } from 'react';

import { DEMORA_BUSQUEDA_MS } from '../constants/biblioteca';
import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

const MENSAJE_ERROR = 'No pudimos hacer la búsqueda. Probá de nuevo en un momento.';

export type EstadoBusqueda = 'inicial' | 'cargando' | 'error' | 'vacio' | 'listo';

type Respuesta = {
  consulta: string;
  intento: number;
  libros: Libro[];
  error: string | null;
};

type ResultadoBusqueda = {
  estado: EstadoBusqueda;
  resultados: Libro[];
  error: string | null;
  reintentar: () => void;
};

export function useBusqueda(q: string): ResultadoBusqueda {
  const consulta = q.trim();
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    let vigente = true;

    const temporizador = setTimeout(() => {
      buscarLibros(consulta)
        .then((libros) => {
          if (vigente) {
            setRespuesta({ consulta, intento, libros, error: null });
          }
        })
        .catch(() => {
          if (vigente) {
            setRespuesta({ consulta, intento, libros: [], error: MENSAJE_ERROR });
          }
        });
    }, DEMORA_BUSQUEDA_MS);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [consulta, intento]);

  const reintentar = useCallback(() => {
    setIntento((anterior) => anterior + 1);
  }, []);

  if (consulta === '') {
    return { estado: 'inicial', resultados: [], error: null, reintentar };
  }

  const esDeEstaConsulta =
    respuesta !== null && respuesta.consulta === consulta && respuesta.intento === intento;

  if (!esDeEstaConsulta) {
    return { estado: 'cargando', resultados: [], error: null, reintentar };
  }
  if (respuesta.error !== null) {
    return { estado: 'error', resultados: [], error: respuesta.error, reintentar };
  }
  if (respuesta.libros.length === 0) {
    return { estado: 'vacio', resultados: [], error: null, reintentar };
  }
  return { estado: 'listo', resultados: respuesta.libros, error: null, reintentar };
}
