/**
 * Punto de entrada: carga los datos y arranca cada parte del sitio.
 */
import { RUTAS, MENSAJES, SITIO_RESPALDO } from './config.js';
import { cargarJSON, linkWhatsApp, formatearTelefono, crear } from './utilidades.js';
import { iniciarCatalogo } from './catalogo.js';

/** Botones generales de WhatsApp (encabezado, portada, banner, flotante). */
function activarBotonesWhatsApp(numero) {
  const href = linkWhatsApp(numero, MENSAJES.general);
  document.querySelectorAll('[data-whatsapp="general"]').forEach((a) => { a.href = href; });
}

/** Contactos del pie y formas de entrega del paso 4. */
function dibujarDatosDelSitio(sitio) {
  const contactos = [
    [sitio.whatsapp_principal_nombre, sitio.whatsapp_principal_numero],
    [sitio.whatsapp_secundario_nombre, sitio.whatsapp_secundario_numero],
  ].filter(([, numero]) => numero);

  document.querySelector('[data-contactos]').replaceChildren(
    ...contactos.map(([nombre, numero]) => {
      const li = crear('li');
      const a = crear('a', null, `WhatsApp ${nombre ? nombre + ' · ' : ''}${formatearTelefono(numero)}`);
      a.href = linkWhatsApp(numero, MENSAJES.general);
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      return li;
    })
  );

  if (sitio.instagram_usuario) {
    const ig = document.querySelector('[data-instagram]');
    ig.href = `https://instagram.com/${sitio.instagram_usuario}`;
    ig.textContent = `Instagram · @${sitio.instagram_usuario}`;
  }

  const entregas = Array.isArray(sitio.entregas) && sitio.entregas.length
    ? sitio.entregas
    : ['Coordinamos la entrega por WhatsApp.'];
  document.querySelector('[data-entregas]').replaceChildren(...entregas.map((t) => crear('li', null, t)));
}

/** Reseñas: la sección aparece solo si hay alguna cargada y visible. */
function dibujarResenas(lista) {
  const visibles = (Array.isArray(lista) ? lista : []).filter((r) => r && r.texto && r.visible !== false);
  if (!visibles.length) return;
  document.querySelector('[data-resenas]').replaceChildren(
    ...visibles.map((r) => {
      const fig = crear('figure', 'tarjeta resena');
      fig.append(crear('blockquote', null, `“${r.texto}”`));
      const firma = [r.nombre, r.producto].filter(Boolean).join(' · ');
      if (firma) fig.append(crear('figcaption', null, firma));
      return fig;
    })
  );
  document.querySelector('[data-seccion-resenas]').hidden = false;
  document.querySelector('[data-enlace-resenas]').hidden = false;
}

async function iniciar() {
  document.querySelector('[data-anio]').textContent = new Date().getFullYear();

  // Los tres archivos se piden a la vez; si alguno falla, el resto sigue funcionando.
  const [sitioR, productosR, resenasR] = await Promise.allSettled([
    cargarJSON(RUTAS.sitio),
    cargarJSON(RUTAS.productos),
    cargarJSON(RUTAS.resenas),
  ]);

  const sitio = { ...SITIO_RESPALDO, ...(sitioR.status === 'fulfilled' ? sitioR.value : {}) };
  const numero = sitio.whatsapp_principal_numero;

  activarBotonesWhatsApp(numero);
  dibujarDatosDelSitio(sitio);

  if (productosR.status === 'fulfilled') {
    iniciarCatalogo(productosR.value, numero);
  } else {
    console.error(productosR.reason);
    const aviso = crear('p', 'catalogo__estado', 'No pudimos cargar el catálogo. Probá recargar la página o escribinos por WhatsApp.');
    document.querySelector('[data-grilla]').replaceChildren(aviso);
  }

  if (resenasR.status === 'fulfilled') dibujarResenas(resenasR.value);
}

iniciar();

/* App instalable: registra el service worker (solo en sitios con https). */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
