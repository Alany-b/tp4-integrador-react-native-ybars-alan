import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ESPACIO, FUENTE, TAMANIO, type Colores } from '../constants/tema';
import { useEstilos, useTema } from '../hooks/useTema';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ESPACIO.xl,
      gap: ESPACIO.md,
      backgroundColor: colores.fondo,
    },
    titulo: {
      fontSize: FUENTE.grande,
      fontWeight: '700',
      color: colores.texto,
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.textoSuave,
      textAlign: 'center',
    },
    ruta: {
      fontWeight: '700',
      color: colores.texto,
    },
    link: {
      minHeight: TAMANIO.tocableMinimo,
      lineHeight: TAMANIO.tocableMinimo,
      fontSize: FUENTE.normal,
      fontWeight: '600',
      color: colores.primario,
    },
  });

export default function PantallaNoEncontrada() {
  const estilos = useEstilos(crearEstilos);
  const colores = useTema();
  const ruta = usePathname();

  return (
    <View style={estilos.pantalla}>
      <Ionicons name="compass-outline" size={TAMANIO.iconoGrande} color={colores.textoSuave} />
      <Text style={estilos.titulo}>Esta página no existe</Text>
      <Text style={estilos.texto}>
        La dirección <Text style={estilos.ruta}>{ruta}</Text> no corresponde a ninguna pantalla de la app.
      </Text>
      <Link href="/" dismissTo accessibilityRole="button">
        <Text style={estilos.link}>Ir al catálogo</Text>
      </Link>
    </View>
  );
}
