export function sumarDias(desde: Date, dias: number): Date {
  const resultado = new Date(desde.getTime());
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}
