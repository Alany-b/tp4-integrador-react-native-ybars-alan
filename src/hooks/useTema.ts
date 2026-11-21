import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { COLORES, type Colores } from '../constants/tema';

export function useTema(): Colores {
  const esquema = useColorScheme();
  if (esquema === 'dark') {
    return COLORES.oscuro;
  }
  return COLORES.claro;
}

export function useEstilos<T>(fabrica: (colores: Colores) => T): T {
  const colores = useTema();
  return useMemo(() => fabrica(colores), [fabrica, colores]);
}
