import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';
import { esIsbnValido } from '../lib/catalogo';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';

type Props = {
  onIsbn: (isbn: string) => void;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      gap: ESPACIO.sm,
    },
    error: {
      fontSize: FUENTE.chica,
      color: colores.peligro,
    },
  });

export function IngresoIsbn({ onIsbn }: Props) {
  const estilos = useEstilos(crearEstilos);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const limpio = texto.replace(/[\s-]/g, '');
    if (!esIsbnValido(limpio)) {
      setError('El ISBN tiene que tener 13 números. Lo encontrás arriba del código de barras.');
      return;
    }
    setError(null);
    onIsbn(limpio);
  }

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        etiqueta="Escribí el ISBN a mano"
        value={texto}
        onChangeText={setTexto}
        keyboardType="number-pad"
        placeholder="Ej.: 9789872601812"
        maxLength={17}
        onSubmitEditing={abrir}
        returnKeyType="go"
      />
      {error ? (
        <Text style={estilos.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Boton titulo="Abrir libro" icono="book-outline" onPress={abrir} />
    </View>
  );
}
