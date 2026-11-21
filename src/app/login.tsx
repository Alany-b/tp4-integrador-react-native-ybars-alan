import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { useEstilos } from '../hooks/useTema';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    contenido: {
      padding: ESPACIO.xl,
      gap: ESPACIO.lg,
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.textoSuave,
    },
    error: {
      fontSize: FUENTE.chica,
      color: colores.peligro,
    },
  });

export default function PantallaLogin() {
  const estilos = useEstilos(crearEstilos);
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    const correcto = iniciarSesion(usuario, clave);
    if (!correcto) {
      setError('El usuario o la clave no son correctos. Revisalos y probá de nuevo.');
    }
  }

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled">
      <Text style={estilos.texto}>Este acceso es solo para el personal de la biblioteca.</Text>
      <CampoTexto
        etiqueta="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto
        etiqueta="Clave"
        value={clave}
        onChangeText={setClave}
        secureTextEntry
        onSubmitEditing={ingresar}
      />
      {error ? (
        <Text style={estilos.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Boton titulo="Ingresar" icono="log-in-outline" onPress={ingresar} />
    </ScrollView>
  );
}
