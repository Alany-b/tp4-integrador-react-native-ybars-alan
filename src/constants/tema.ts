export type Colores = {
  fondo: string;
  superficie: string;
  borde: string;
  texto: string;
  textoSuave: string;
  primario: string;
  textoSobrePrimario: string;
  peligro: string;
  exito: string;
  aviso: string;
  fondoAviso: string;
  camaraFondo: string;
};

export const COLORES: { claro: Colores; oscuro: Colores } = {
  claro: {
    fondo: '#F4F6F9',
    superficie: '#FFFFFF',
    borde: '#D5DBE3',
    texto: '#1B2430',
    textoSuave: '#5A6675',
    primario: '#1F4E79',
    textoSobrePrimario: '#FFFFFF',
    peligro: '#B3261E',
    exito: '#1E7A46',
    aviso: '#7A5200',
    fondoAviso: '#FFF4D6',
    camaraFondo: '#000000',
  },
  oscuro: {
    fondo: '#11161D',
    superficie: '#1B232D',
    borde: '#2E3A47',
    texto: '#E8EDF3',
    textoSuave: '#A3AFBD',
    primario: '#7FB3E6',
    textoSobrePrimario: '#0B1A2A',
    peligro: '#F2B8B5',
    exito: '#8FD8A8',
    aviso: '#FFD88A',
    fondoAviso: '#3A2F12',
    camaraFondo: '#000000',
  },
};

export const ESPACIO = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const FUENTE = {
  chica: 13,
  normal: 16,
  grande: 20,
  titulo: 24,
};

export const RADIO = {
  chico: 8,
  grande: 12,
};

export const TAMANIO = {
  tocableMinimo: 44,
  icono: 22,
  iconoGrande: 48,
  anchoReciente: 140,
  visorEscaner: 240,
  bordeVisor: 3,
  bordeFino: 1,
};
