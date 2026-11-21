import { router, useIsFocused } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../components/Boton';
import { EstadoCargando } from '../components/EstadoCargando';
import { IngresoIsbn } from '../components/IngresoIsbn';
import { VisorEscaner } from '../components/VisorEscaner';
import { ESPACIO, FUENTE, RADIO, type Colores } from '../constants/tema';
import { usePermiso } from '../hooks/usePermiso';
import { useEstilos } from '../hooks/useTema';
import { buscarLibroPorIsbn, esIsbnValido } from '../lib/catalogo';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    contenido: {
      padding: ESPACIO.lg,
      gap: ESPACIO.xl,
    },
    caja: {
      gap: ESPACIO.md,
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.texto,
    },
    aviso: {
      padding: ESPACIO.md,
      borderRadius: RADIO.chico,
      backgroundColor: colores.fondoAviso,
      color: colores.aviso,
      fontSize: FUENTE.chica,
    },
  });

export default function PantallaEscanear() {
  const estilos = useEstilos(crearEstilos);
  const enFoco = useIsFocused();
  const { estado, abrirAjustes } = usePermiso('camara');
  const yaNavego = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function abrirLibro(isbn: string) {
    yaNavego.current = true;
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  function alLeerCodigo(datos: string) {
    if (yaNavego.current || !esIsbnValido(datos)) {
      return;
    }
    if (!buscarLibroPorIsbn(datos)) {
      if (ultimoDesconocido.current !== datos) {
        ultimoDesconocido.current = datos;
        setAviso(`El libro con ISBN ${datos} no está en el catálogo. Podés escanear otro.`);
      }
      return;
    }
    abrirLibro(datos);
  }

  function alEscribirIsbn(isbn: string) {
    if (!buscarLibroPorIsbn(isbn)) {
      setAviso(`El libro con ISBN ${isbn} no está en el catálogo. Revisá los números.`);
      return;
    }
    abrirLibro(isbn);
  }

  function pedirCamara() {
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
  }

  function seccionCamara() {
    if (estado === 'cargando') {
      return <EstadoCargando mensaje="Revisando el permiso de la cámara..." />;
    }
    if (estado === 'concedido') {
      return enFoco ? <VisorEscaner onCodigo={alLeerCodigo} /> : null;
    }
    if (estado === 'preguntable') {
      return (
        <View style={estilos.caja}>
          <Text style={estilos.texto}>
            Para leer el código de barras necesitamos usar la cámara. También podés escribir el ISBN abajo.
          </Text>
          <Boton titulo="Usar la cámara" icono="camera-outline" onPress={pedirCamara} />
        </View>
      );
    }
    return (
      <View style={estilos.caja}>
        <Text style={estilos.texto}>
          La cámara está bloqueada para esta app. Podés habilitarla en Ajustes o escribir el ISBN abajo.
        </Text>
        <Boton titulo="Abrir Ajustes" icono="settings-outline" variante="secundario" onPress={abrirAjustes} />
      </View>
    );
  }

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled">
      {seccionCamara()}
      {aviso ? (
        <Text style={estilos.aviso} accessibilityRole="alert">
          {aviso}
        </Text>
      ) : null}
      <IngresoIsbn onIsbn={alEscribirIsbn} />
    </ScrollView>
  );
}
