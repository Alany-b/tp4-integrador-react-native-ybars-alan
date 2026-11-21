import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { TEXTOS_PERMISO } from '../constants/permisos';
import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { usePermiso } from '../hooks/usePermiso';
import { useEstilos, useTema } from '../hooks/useTema';
import type { Recurso } from '../types/permisos';
import { Boton } from './Boton';
import { EstadoCargando } from './EstadoCargando';

type Props = {
  recurso: Recurso;
  isbn: string | null;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      padding: ESPACIO.xl,
      gap: ESPACIO.lg,
      justifyContent: 'center',
      backgroundColor: colores.fondo,
    },
    icono: {
      alignSelf: 'center',
    },
    titulo: {
      fontSize: FUENTE.titulo,
      fontWeight: '700',
      color: colores.texto,
      textAlign: 'center',
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.texto,
      textAlign: 'center',
    },
    nota: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
      textAlign: 'center',
    },
  });

export function PantallaPermiso({ recurso, isbn }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const { activarRecordatorio } = useBiblioteca();
  const textos = TEXTOS_PERMISO[recurso];

  async function continuar() {
    await pedir();
    if (recurso === 'notificaciones' && isbn !== null) {
      await activarRecordatorio(isbn);
    }
    router.back();
  }

  if (estado === 'cargando') {
    return <EstadoCargando mensaje="Revisando el permiso..." />;
  }

  const bloqueado = estado === 'bloqueado';

  return (
    <View style={estilos.pantalla}>
      <Ionicons
        style={estilos.icono}
        name={recurso === 'camara' ? 'camera-outline' : 'notifications-outline'}
        size={TAMANIO.iconoGrande}
        color={colores.primario}
      />
      <Text style={estilos.titulo}>{textos.titulo}</Text>
      <Text style={estilos.texto}>{textos.beneficio}</Text>
      {bloqueado ? (
        <Text style={estilos.nota}>
          El permiso está bloqueado. Podés habilitarlo desde los Ajustes del teléfono.
        </Text>
      ) : null}
      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" icono="settings-outline" onPress={abrirAjustes} />
      ) : (
        <Boton titulo="Continuar" onPress={continuar} />
      )}
    </View>
  );
}
