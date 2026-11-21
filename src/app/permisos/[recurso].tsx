import { useLocalSearchParams } from 'expo-router';

import { MensajeLibroInvalido } from '../../components/MensajeLibroInvalido';
import { PantallaPermiso } from '../../components/PantallaPermiso';
import { esRecurso } from '../../lib/permisos';

export default function RutaPermiso() {
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const recursoTexto = typeof recurso === 'string' ? recurso : '';

  if (!esRecurso(recursoTexto)) {
    return (
      <MensajeLibroInvalido
        titulo="Ese permiso no existe"
        mensaje="La app solo usa la cámara y las notificaciones."
      />
    );
  }

  return <PantallaPermiso recurso={recursoTexto} isbn={typeof isbn === 'string' ? isbn : null} />;
}
