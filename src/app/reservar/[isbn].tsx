import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '../../components/Boton';
import { MensajeLibroInvalido } from '../../components/MensajeLibroInvalido';
import { DIAS_PRESTAMO, NOMBRE_ALUMNO } from '../../constants/biblioteca';
import { ESPACIO, FUENTE, type Colores } from '../../constants/tema';
import { useBiblioteca } from '../../hooks/useBiblioteca';
import { useEstilos } from '../../hooks/useTema';
import { decidirReserva } from '../../lib/biblioteca';
import { buscarLibroPorIsbn, esIsbnValido } from '../../lib/catalogo';
import { formatearFecha, sumarDias } from '../../lib/fechas';

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
    titulo: {
      fontSize: FUENTE.grande,
      fontWeight: '700',
      color: colores.texto,
    },
    texto: {
      fontSize: FUENTE.normal,
      color: colores.texto,
    },
  });

export default function PantallaReservar() {
  const estilos = useEstilos(crearEstilos);
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { prestamos, colas, reservar } = useBiblioteca();
  const [confirmada, setConfirmada] = useState(false);

  const isbnTexto = typeof isbn === 'string' ? isbn : '';
  const libro = esIsbnValido(isbnTexto) ? buscarLibroPorIsbn(isbnTexto) : undefined;

  if (!libro) {
    return (
      <MensajeLibroInvalido
        titulo="No podemos reservar ese libro"
        mensaje="El libro no existe en el catálogo. Buscalo de nuevo desde el catálogo."
      />
    );
  }

  const cola = colas[libro.isbn];
  const decision = decidirReserva(libro, prestamos, cola, NOMBRE_ALUMNO);

  function irAMisReservas() {
    router.dismissTo('/reservas');
  }

  function confirmar() {
    setConfirmada(true);
    reservar(isbnTexto);
    irAMisReservas();
  }

  if (confirmada) {
    return (
      <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
        <Text style={estilos.texto}>Reserva confirmada.</Text>
      </ScrollView>
    );
  }

  if (decision === 'repetida') {
    return (
      <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>{libro.titulo}</Text>
        <Text style={estilos.texto}>
          Ya reservaste este libro. No se puede reservar dos veces el mismo libro.
        </Text>
        <Boton titulo="Ver mis reservas" icono="bookmark-outline" onPress={irAMisReservas} />
      </ScrollView>
    );
  }

  const textoDecision =
    decision === 'prestamo'
      ? `Hay ejemplares disponibles. Te lo prestamos por ${DIAS_PRESTAMO} días y lo devolvés el ${formatearFecha(sumarDias(new Date(), DIAS_PRESTAMO).toISOString())}.`
      : `No quedan ejemplares. Vas a entrar a la lista de espera en la posición ${(cola ? cola.tamanio : 0) + 1}.`;

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.texto}>{textoDecision}</Text>
      <Boton
        titulo={decision === 'prestamo' ? 'Confirmar préstamo' : 'Anotarme en la lista'}
        icono="checkmark"
        onPress={confirmar}
      />
    </ScrollView>
  );
}
