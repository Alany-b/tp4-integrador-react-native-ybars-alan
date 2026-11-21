import * as SplashScreen from 'expo-splash-screen';
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  CANTIDAD_RECIENTES,
  CREDENCIALES_PERSONAL,
  DEMORA_GUARDADO_MS,
  DIAS_PRESTAMO,
  NOMBRE_ALUMNO,
  SEGUNDOS_RECORDATORIO,
} from '../constants/biblioteca';
import { ESPERAS_INICIALES } from '../data/libros';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import { cargarEstado, guardarEstado } from '../lib/almacenamiento';
import {
  colasAListas,
  colasDesdeListas,
  decidirReserva,
  sincronizarPrestamo,
} from '../lib/biblioteca';
import { buscarLibroPorIsbn, obtenerTitulo } from '../lib/catalogo';
import { sumarDias } from '../lib/fechas';
import {
  avisarLibroListo,
  cancelarRecordatorio,
  notificacionesPermitidas,
  obtenerRecordatoriosProgramados,
  programarRecordatorio,
} from '../lib/notificaciones';
import type { Aviso, Prestamo, ResultadoReserva } from '../types/biblioteca';

export type ValorBiblioteca = {
  listo: boolean;
  recientes: Pila<string>;
  prestamos: Prestamo[];
  colas: Record<string, Cola<string>>;
  avisos: Aviso[];
  sesionIniciada: boolean;
  registrarVisto: (isbn: string) => void;
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => void;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => void;
  entregarAlSiguiente: (isbn: string) => Promise<string | null>;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  descartarAviso: (id: string) => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

type Props = {
  children: (valor: ValorBiblioteca) => ReactNode;
};

function crearId(): string {
  return `${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

export function BibliotecaProvider({ children }: Props) {
  const [listo, setListo] = useState(false);
  const [recientes, setRecientes] = useState(() => new Pila<string>());
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [colas, setColas] = useState(() => colasDesdeListas(ESPERAS_INICIALES));
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);

  const prestamosActuales = useRef<Prestamo[]>([]);
  const recordatoriosInternos = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    prestamosActuales.current = prestamos;
  }, [prestamos]);

  useEffect(() => {
    let activo = true;

    async function hidratar() {
      const guardado = await cargarEstado();
      if (!activo) {
        return;
      }
      if (guardado) {
        const programados = await obtenerRecordatoriosProgramados();
        if (!activo) {
          return;
        }
        setPrestamos(guardado.prestamos.map((prestamo) => sincronizarPrestamo(prestamo, programados)));
        setColas(colasDesdeListas(guardado.colas));
        setRecientes(new Pila<string>(guardado.recientes.slice(-CANTIDAD_RECIENTES * 4)));
      }
      setListo(true);
    }

    hidratar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (listo) {
      SplashScreen.hideAsync();
    }
  }, [listo]);

  useEffect(() => {
    if (!listo) {
      return;
    }
    const temporizador = setTimeout(() => {
      guardarEstado({
        prestamos,
        colas: colasAListas(colas),
        recientes: recientes.aArray(),
      });
    }, DEMORA_GUARDADO_MS);
    return () => {
      clearTimeout(temporizador);
    };
  }, [listo, prestamos, colas, recientes]);

  useEffect(() => {
    const temporizadores = recordatoriosInternos.current;
    return () => {
      temporizadores.forEach((temporizador) => clearTimeout(temporizador));
      temporizadores.clear();
    };
  }, []);

  const agregarAviso = useCallback((texto: string) => {
    setAvisos((anteriores) => [...anteriores, { id: crearId(), texto }]);
  }, []);

  const descartarAviso = useCallback((id: string) => {
    setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id));
  }, []);

  const quitarRecordatorioInterno = useCallback((isbn: string) => {
    const temporizador = recordatoriosInternos.current.get(isbn);
    if (temporizador !== undefined) {
      clearTimeout(temporizador);
      recordatoriosInternos.current.delete(isbn);
    }
  }, []);

  const registrarVisto = useCallback((isbn: string) => {
    setRecientes((anterior) => {
      if (anterior.verTope() === isbn) {
        return anterior;
      }
      const nueva = new Pila<string>(anterior.aArray());
      nueva.apilar(isbn);
      return nueva;
    });
  }, []);

  const reservar = useCallback(
    (isbn: string): ResultadoReserva => {
      const libro = buscarLibroPorIsbn(isbn);
      if (!libro) {
        return { tipo: 'inexistente' };
      }
      const decision = decidirReserva(libro, prestamos, colas[isbn], NOMBRE_ALUMNO);
      if (decision === 'repetida') {
        return { tipo: 'repetida' };
      }
      if (decision === 'prestamo') {
        const vence = sumarDias(new Date(), DIAS_PRESTAMO).toISOString();
        setPrestamos((anteriores) => [
          ...anteriores,
          { isbn, vence, origen: 'estante', recordar: false, notificacionId: null },
        ]);
        return { tipo: 'prestamo', vence };
      }
      const cola = colas[isbn] ?? new Cola<string>();
      const nueva = new Cola<string>(cola.aArray());
      nueva.encolar(NOMBRE_ALUMNO);
      setColas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
      return { tipo: 'espera', posicion: nueva.tamanio };
    },
    [colas, prestamos],
  );

  const desactivarRecordatorio = useCallback(
    (isbn: string) => {
      const prestamo = prestamosActuales.current.find((actual) => actual.isbn === isbn);
      if (prestamo && prestamo.notificacionId !== null) {
        cancelarRecordatorio(prestamo.notificacionId);
      }
      quitarRecordatorioInterno(isbn);
      setPrestamos((anteriores) =>
        anteriores.map((actual) =>
          actual.isbn === isbn ? { ...actual, recordar: false, notificacionId: null } : actual,
        ),
      );
    },
    [quitarRecordatorioInterno],
  );

  const devolver = useCallback(
    (isbn: string) => {
      const prestamo = prestamosActuales.current.find((actual) => actual.isbn === isbn);
      if (prestamo && prestamo.notificacionId !== null) {
        cancelarRecordatorio(prestamo.notificacionId);
      }
      quitarRecordatorioInterno(isbn);
      setPrestamos((anteriores) => anteriores.filter((actual) => actual.isbn !== isbn));
    },
    [quitarRecordatorioInterno],
  );

  const activarRecordatorio = useCallback(
    async (isbn: string) => {
      const prestamo = prestamosActuales.current.find((actual) => actual.isbn === isbn);
      if (!prestamo || prestamo.recordar) {
        return;
      }
      const titulo = obtenerTitulo(isbn);
      setPrestamos((anteriores) =>
        anteriores.map((actual) => (actual.isbn === isbn ? { ...actual, recordar: true } : actual)),
      );

      if (await notificacionesPermitidas()) {
        try {
          const identificador = await programarRecordatorio(titulo);
          const sigueActivo = prestamosActuales.current.some(
            (actual) => actual.isbn === isbn && actual.recordar,
          );
          if (!sigueActivo) {
            cancelarRecordatorio(identificador);
            return;
          }
          setPrestamos((anteriores) =>
            anteriores.map((actual) =>
              actual.isbn === isbn ? { ...actual, notificacionId: identificador } : actual,
            ),
          );
          return;
        } catch {
          agregarAviso('No pudimos programar la notificación. Te vamos a avisar dentro de la app.');
        }
      }

      quitarRecordatorioInterno(isbn);
      const temporizador = setTimeout(() => {
        recordatoriosInternos.current.delete(isbn);
        agregarAviso(`Recordatorio: acordate de devolver "${titulo}".`);
      }, SEGUNDOS_RECORDATORIO * 1000);
      recordatoriosInternos.current.set(isbn, temporizador);
    },
    [agregarAviso, quitarRecordatorioInterno],
  );

  const entregarAlSiguiente = useCallback(
    async (isbn: string): Promise<string | null> => {
      const cola = colas[isbn];
      if (!cola || cola.estaVacia()) {
        return null;
      }
      const nueva = new Cola<string>(cola.aArray());
      const persona = nueva.desencolar();
      setColas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
      if (persona === undefined) {
        return null;
      }
      if (persona === NOMBRE_ALUMNO) {
        const vence = sumarDias(new Date(), DIAS_PRESTAMO).toISOString();
        setPrestamos((anteriores) => [
          ...anteriores,
          { isbn, vence, origen: 'mostrador', recordar: false, notificacionId: null },
        ]);
        const titulo = obtenerTitulo(isbn);
        const mensaje = `Ya podés retirar "${titulo}" en el mostrador. Lo tenés prestado por ${DIAS_PRESTAMO} días.`;
        if (await notificacionesPermitidas()) {
          try {
            await avisarLibroListo(titulo);
          } catch {
            agregarAviso(mensaje);
          }
        } else {
          agregarAviso(mensaje);
        }
      }
      return persona;
    },
    [agregarAviso, colas],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const correcto =
      usuario.trim() === CREDENCIALES_PERSONAL.usuario && clave === CREDENCIALES_PERSONAL.clave;
    if (correcto) {
      setSesionIniciada(true);
    }
    return correcto;
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesionIniciada(false);
  }, []);

  const valor = useMemo<ValorBiblioteca>(
    () => ({
      listo,
      recientes,
      prestamos,
      colas,
      avisos,
      sesionIniciada,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    }),
    [
      listo,
      recientes,
      prestamos,
      colas,
      avisos,
      sesionIniciada,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    ],
  );

  if (!listo) {
    return null;
  }

  return <BibliotecaContext.Provider value={valor}>{children(valor)}</BibliotecaContext.Provider>;
}
