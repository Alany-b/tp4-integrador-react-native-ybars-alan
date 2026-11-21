import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

type Props = Omit<TextInputProps, 'style'> & {
  etiqueta: string;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      gap: ESPACIO.xs,
    },
    etiqueta: {
      fontSize: FUENTE.chica,
      fontWeight: '600',
      color: colores.textoSuave,
    },
    campo: {
      minHeight: TAMANIO.tocableMinimo,
      paddingHorizontal: ESPACIO.md,
      borderRadius: RADIO.chico,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      color: colores.texto,
      fontSize: FUENTE.normal,
    },
  });

export function CampoTexto({ etiqueta, ...props }: Props) {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSuave}
        style={estilos.campo}
        {...props}
      />
    </View>
  );
}
