import { CameraView } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos } from '../hooks/useTema';

type Props = {
  onCodigo: (datos: string) => void;
};

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    contenedor: {
      height: TAMANIO.visorEscaner,
      borderRadius: RADIO.grande,
      overflow: 'hidden',
      backgroundColor: colores.camaraFondo,
    },
    camara: {
      flex: 1,
    },
    marco: {
      ...StyleSheet.absoluteFill,
      margin: ESPACIO.xl,
      borderRadius: RADIO.chico,
      borderWidth: TAMANIO.bordeVisor,
      borderColor: colores.textoSobrePrimario,
    },
    ayuda: {
      fontSize: FUENTE.chica,
      color: colores.textoSuave,
      textAlign: 'center',
    },
  });

export function VisorEscaner({ onCodigo }: Props) {
  const estilos = useEstilos(crearEstilos);

  return (
    <View>
      <View style={estilos.contenedor}>
        <CameraView
          style={estilos.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
          onBarcodeScanned={(resultado) => onCodigo(resultado.data)}
        />
        <View style={estilos.marco} pointerEvents="none" />
      </View>
      <Text style={estilos.ayuda}>Apuntá al código de barras de la contratapa.</Text>
    </View>
  );
}
