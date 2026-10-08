/**
 * Configuración general del sitio.
 *
 * Los datos que cambian seguido (productos, reseñas, números de WhatsApp,
 * formas de entrega) NO van acá: se editan desde el panel de administración
 * y viven en la carpeta /data. Acá solo quedan ajustes de funcionamiento.
 */

/** Archivos de datos que edita el panel de administración. */
export const RUTAS = {
  productos: '/data/productos.json',
  sitio: '/data/sitio.json',
  resenas: '/data/resenas.json',
};

/**
 * Orden en que se muestran los filtros de categoría.
 * Si en el panel se usa una categoría que no está en esta lista
 * (por ejemplo "Velas"), igual aparece: se agrega al final.
 */
export const ORDEN_CATEGORIAS = [
  'Hogar',
  'Escritorio',
  'Decoración',
  'Mascotas',
  'Velas',
  'A medida',
];

/** Texto del filtro que muestra todo. */
export const CATEGORIA_TODAS = 'Todos';

/** Cantidad de fotos del collage de la portada. */
export const FOTOS_PORTADA = 3;

/** Mensajes que se escriben solos al abrir WhatsApp. */
export const MENSAJES = {
  general: '¡Hola CasaNova&co! Tengo una idea y quería pedir un presupuesto.',
  producto: (nombre) => `¡Hola CasaNova&co! Me interesa "${nombre}". ¿Me pasan presupuesto?`,
};

/** Datos de respaldo por si /data/sitio.json no carga. */
export const SITIO_RESPALDO = {
  whatsapp_principal_nombre: 'Dayana',
  whatsapp_principal_numero: '5491166274345',
  whatsapp_secundario_nombre: 'Mari',
  whatsapp_secundario_numero: '5491122549290',
  instagram_usuario: 'casanovaco_ar',
  entregas: [],
};
