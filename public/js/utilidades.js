/**
 * Funciones chicas que usan varios módulos.
 */

/**
 * Descarga un archivo JSON. Pide siempre la versión más nueva
 * para que los cambios hechos en el panel se vean enseguida.
 */
export async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta, { cache: 'no-cache' });
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (${respuesta.status})`);
  return respuesta.json();
}

/** Arma el link de WhatsApp con el mensaje ya escrito. */
export function linkWhatsApp(numero, mensaje) {
  const soloDigitos = String(numero || '').replace(/\D/g, '');
  return `https://wa.me/${soloDigitos}?text=${encodeURIComponent(mensaje)}`;
}

/** 5491166274345 → +54 9 11 6627-4345 (para mostrar en pantalla). */
export function formatearTelefono(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  const m = d.match(/^54(9)(\d{2})(\d{4})(\d{4})$/);
  return m ? `+54 ${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${d}`;
}

/** "Casita de té" → "casita-de-te" (para los links directos a cada producto). */
export function slug(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Crea un elemento HTML con clase y texto (el texto nunca se interpreta como HTML). */
export function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto != null) el.textContent = texto;
  return el;
}

/**
 * Pone un texto dentro de un elemento, mostrando el "&" con la fuente
 * de texto (el "&" de la fuente de títulos tiene un rabo que confunde).
 */
export function ponerTextoConAmp(elemento, texto) {
  elemento.textContent = '';
  String(texto).split('&').forEach((parte, i) => {
    if (i > 0) elemento.append(crear('span', 'amp', '&'));
    elemento.append(parte);
  });
}
