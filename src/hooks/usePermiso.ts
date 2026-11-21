import type { PermissionResponse } from 'expo';
import { useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { consultarPermisoNotificaciones, pedirPermisoNotificaciones } from '../lib/notificaciones';
import { abrirAjustes, estadoDesdeRespuesta } from '../lib/permisos';
import type { EstadoPermiso, Recurso } from '../types/permisos';

type ResultadoPermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
};

export function usePermiso(recurso: Recurso): ResultadoPermiso {
  const esCamara = recurso === 'camara';
  const [respuestaCamara, pedirCamara, consultarCamara] = useCameraPermissions({ get: false });
  const [respuestaNotificaciones, setRespuestaNotificaciones] = useState<PermissionResponse | null>(null);

  const consultar = useCallback(
    async (sigueActivo: () => boolean) => {
      try {
        if (esCamara) {
          await consultarCamara();
          return;
        }
        const respuesta = await consultarPermisoNotificaciones();
        if (sigueActivo()) {
          setRespuestaNotificaciones(respuesta);
        }
      } catch {
        return;
      }
    },
    [esCamara, consultarCamara],
  );

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      consultar(() => activo);
      return () => {
        activo = false;
      };
    }, [consultar]),
  );

  useEffect(() => {
    let activo = true;
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar(() => activo);
      }
    });
    return () => {
      activo = false;
      suscripcion.remove();
    };
  }, [consultar]);

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    try {
      if (esCamara) {
        const respuesta = await pedirCamara();
        return estadoDesdeRespuesta(respuesta);
      }
      const respuesta = await pedirPermisoNotificaciones();
      setRespuestaNotificaciones(respuesta);
      return estadoDesdeRespuesta(respuesta);
    } catch {
      return 'bloqueado';
    }
  }, [esCamara, pedirCamara]);

  const estado = estadoDesdeRespuesta(esCamara ? respuestaCamara : respuestaNotificaciones);

  return { estado, pedir, abrirAjustes };
}
