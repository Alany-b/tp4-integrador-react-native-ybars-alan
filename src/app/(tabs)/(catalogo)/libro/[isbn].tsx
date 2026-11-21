import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../../components/Boton';
import { MensajeLibroInvalido } from '../../../../components/MensajeLibroInvalido';
import { NOMBRE_ALUMNO } from '../../../../constants/biblioteca';
import { ESPACIO, FUENTE, RADIO, TAMANIO, type Colores } from '../../../../constants/tema';
import { useBiblioteca } from '../../../../hooks/useBiblioteca';
import { useEstilos } from '../../../../hooks/useTema';
import { calcularDisponibles, posicionEnCola } from '../../../../lib/biblioteca';
import { buscarLibroPorIsbn, esIsbnValido } from '../../../../lib/catalogo';

const crearEstilos = (colores: Colores) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    contenido: {
      padding: ESPACIO.lg,
      gap: ESPACIO.lg,
    },
    titulo: {
      fontSize: FUENTE.titulo,
      fontWeight: '700',
      color: colores.texto,
    },
    autor: {
      fontSize: FUENTE.grande,
      color: colores.textoSuave,
    },
    datos: {
      padding: ESPACIO.lg,
      borderRadius: RADIO.grande,
      backgroundColor: colores.superficie,
      borderWidth: TAMANIO.bordeFino,
      borderColor: colores.borde,
      gap: ESPACIO.sm,
    },
    dato: {
      fontSize: FUENTE.normal,
      color: colores.texto,
    },
    nota: {
      fontSize: FUENTE.chica,
      color: colores.aviso,
    },
  });

export default function PantallaDetalle() {
  const estilos = useEstilos(crearEstilos);
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { registrarVisto, prestamos, colas } = useBiblioteca();

  const isbnTexto = typeof isbn === 'string' ? isbn : '';
  const valido = esIsbnValido(isbnTexto);
  const libro = valido ? buscarLibroPorIsbn(isbnTexto) : undefined;

  useEffect(() => {
    if (libro) {
      registrarVisto(libro.isbn);
    }
  }, [libro, registrarVisto]);

  if (!valido) {
    return (
      <>
        <Stack.Screen options={{ title: 'ISBN inválido' }} />
        <MensajeLibroInvalido
          titulo="Ese ISBN no es válido"
          mensaje={`"${isbnTexto}" no tiene el formato de un ISBN. Tiene que tener 13 números, sin guiones.`}
        />
      </>
    );
  }

  if (!libro) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <MensajeLibroInvalido
          titulo="No tenemos ese libro"
          mensaje={`No hay ningún libro con el ISBN ${isbnTexto} en el catálogo de la biblioteca.`}
        />
      </>
    );
  }

  const disponibles = calcularDisponibles(libro, prestamos);
  const cola = colas[libro.isbn];
  const enEspera = cola ? cola.tamanio : 0;
  const miPosicion = posicionEnCola(cola, NOMBRE_ALUMNO);
  const loTengo = prestamos.some((prestamo) => prestamo.isbn === libro.isbn);
  const yaReservado = loTengo || miPosicion > 0;

  function irAReservar() {
    router.push({ pathname: '/reservar/[isbn]', params: { isbn: isbnTexto } });
  }

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View>
        <Text style={estilos.titulo}>{libro.titulo}</Text>
        <Text style={estilos.autor}>{libro.autor}</Text>
      </View>
      <View style={estilos.datos}>
        <Text style={estilos.dato}>Año: {libro.anio}</Text>
        <Text style={estilos.dato}>ISBN: {libro.isbn}</Text>
        <Text style={estilos.dato}>Ejemplares disponibles: {disponibles}</Text>
        <Text style={estilos.dato}>Personas en lista de espera: {enEspera}</Text>
      </View>
      {loTengo ? <Text style={estilos.nota}>Ya tenés este libro prestado.</Text> : null}
      {miPosicion > 0 ? (
        <Text style={estilos.nota}>Estás en la lista de espera, en la posición {miPosicion}.</Text>
      ) : null}
      <Boton
        titulo="Reservar"
        icono="bookmark"
        onPress={irAReservar}
        deshabilitado={yaReservado}
        pista="Abre la confirmación de la reserva"
      />
    </ScrollView>
  );
}
