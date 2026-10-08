/**
 * Catálogo: filtros por categoría, grilla de productos,
 * collage de la portada y ficha emergente de cada producto.
 */
import { ORDEN_CATEGORIAS, CATEGORIA_TODAS, FOTOS_PORTADA, MENSAJES } from './config.js';
import { crear, linkWhatsApp, slug, ponerTextoConAmp } from './utilidades.js';

/**
 * Limpia la lista que viene del panel: descarta productos ocultos
 * o incompletos y les agrega un identificador para el link directo.
 */
function prepararProductos(lista) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((p) => p && p.visible !== false && p.nombre && p.foto)
    .map((p) => ({
      ...p,
      categoria: (p.categoria || '').trim() || 'Otros',
      descripcion: p.descripcion || '',
      fotos: juntarFotos(p),
      id: slug(p.nombre),
    }));
}

/**
 * Lista de fotos del producto: la principal primero y después las de "Más fotos"
 * (el panel puede guardarlas como lista o como texto suelto; aceptamos las dos).
 */
function juntarFotos(p) {
  const extras = Array.isArray(p.mas_fotos) ? p.mas_fotos : [p.mas_fotos];
  return [...new Set([p.foto, ...extras].filter((f) => typeof f === 'string' && f.trim()))];
}

/** Categorías presentes, ordenadas según ORDEN_CATEGORIAS. */
function obtenerCategorias(productos) {
  const presentes = [...new Set(productos.map((p) => p.categoria))];
  const posicion = (c) => {
    const i = ORDEN_CATEGORIAS.indexOf(c);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return presentes.sort((a, b) => posicion(a) - posicion(b) || a.localeCompare(b, 'es'));
}

export function iniciarCatalogo(listaCruda, numeroWhatsApp) {
  const productos = prepararProductos(listaCruda);
  const categorias = [CATEGORIA_TODAS, ...obtenerCategorias(productos)];

  const $filtros = document.querySelector('[data-filtros]');
  const $grilla = document.querySelector('[data-grilla]');
  const $contador = document.querySelector('[data-contador]');
  const $collage = document.querySelector('[data-collage]');
  const ficha = crearFicha(numeroWhatsApp);

  // La categoría elegida queda en la dirección (?categoria=Hogar) para poder compartirla.
  const params = new URLSearchParams(location.search);
  let actual = categorias.includes(params.get('categoria')) ? params.get('categoria') : CATEGORIA_TODAS;

  /* ----- Filtros ----- */
  function dibujarFiltros() {
    $filtros.replaceChildren(
      ...categorias.map((cat) => {
        const boton = crear('button', 'filtro', cat);
        boton.type = 'button';
        boton.setAttribute('aria-pressed', String(cat === actual));
        boton.addEventListener('click', () => elegirCategoria(cat));
        return boton;
      })
    );
  }

  function elegirCategoria(cat) {
    actual = cat;
    const url = new URL(location.href);
    if (cat === CATEGORIA_TODAS) url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', cat);
    history.replaceState(null, '', url);
    dibujarFiltros();
    dibujarGrilla();
  }

  /* ----- Grilla ----- */
  function tarjeta(p) {
    const art = crear('article', 'tarjeta-producto');

    const botonFoto = crear('button', 'tarjeta-producto__foto-boton');
    botonFoto.type = 'button';
    botonFoto.setAttribute('aria-label', `Ver ${p.nombre} en grande`);
    const img = crear('img', 'tarjeta-producto__foto');
    img.src = p.foto;
    img.alt = p.nombre;
    img.loading = 'lazy';
    img.decoding = 'async';
    botonFoto.append(img);
    botonFoto.addEventListener('click', () => ficha.abrir(p));

    const texto = crear('div', 'tarjeta-producto__texto');
    const nombre = crear('h3', 'tarjeta-producto__nombre');
    ponerTextoConAmp(nombre, p.nombre);
    texto.append(crear('p', 'tarjeta-producto__categoria', p.categoria), nombre);
    if (p.descripcion) texto.append(crear('p', 'tarjeta-producto__descripcion', p.descripcion));

    const consultar = crear('a', 'boton boton--marron');
    consultar.href = linkWhatsApp(numeroWhatsApp, MENSAJES.producto(p.nombre));
    consultar.target = '_blank';
    consultar.rel = 'noopener';
    consultar.innerHTML = '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><use href="#icono-chat"></use></svg>';
    consultar.append('Consultar');
    consultar.setAttribute('aria-label', `Consultar por ${p.nombre} en WhatsApp`);

    art.append(botonFoto, texto, consultar);
    return art;
  }

  function dibujarGrilla() {
    const visibles = actual === CATEGORIA_TODAS ? productos : productos.filter((p) => p.categoria === actual);
    $contador.textContent = visibles.length === 1 ? '1 trabajo' : `${visibles.length} trabajos`;
    if (visibles.length === 0) {
      $grilla.replaceChildren(crear('p', 'catalogo__estado', 'Todavía no hay trabajos en esta categoría. ¡Escribinos y lo diseñamos!'));
      return;
    }
    $grilla.replaceChildren(...visibles.map(tarjeta));
  }

  /* ----- Collage de portada: usa los "destacados" (o los primeros) ----- */
  function dibujarCollage() {
    const destacados = productos.filter((p) => p.destacado);
    const elegidos = (destacados.length ? destacados : productos).slice(0, FOTOS_PORTADA);
    $collage.replaceChildren(
      ...elegidos.map((p, i) => {
        const img = crear('img');
        img.src = p.foto;
        img.alt = '';
        if (i > 0) img.loading = 'lazy';
        return img;
      })
    );
  }

  /* ----- Link directo a un producto: .../#producto-nombre ----- */
  function abrirDesdeDireccion() {
    const id = location.hash.replace('#producto-', '');
    if (!location.hash.startsWith('#producto-')) return;
    const p = productos.find((x) => x.id === id);
    if (p) ficha.abrir(p, { sinCambiarDireccion: true });
  }

  dibujarFiltros();
  dibujarGrilla();
  dibujarCollage();
  abrirDesdeDireccion();
  window.addEventListener('hashchange', abrirDesdeDireccion);
}

/** Ventana emergente con la foto grande y el botón de WhatsApp. */
function crearFicha(numeroWhatsApp) {
  const $dialogo = document.querySelector('[data-ficha]');
  const $pista = $dialogo.querySelector('[data-ficha-pista]');
  const $miniaturas = $dialogo.querySelector('[data-ficha-miniaturas]');
  const $categoria = $dialogo.querySelector('[data-ficha-categoria]');
  const $titulo = $dialogo.querySelector('[data-ficha-titulo]');
  const $descripcion = $dialogo.querySelector('[data-ficha-descripcion]');
  const $whatsapp = $dialogo.querySelector('[data-ficha-whatsapp]');
  const $compartir = $dialogo.querySelector('[data-compartir]');
  let productoActual = null;

  /* ----- Galería ----- */
  function irAFoto(i) {
    $pista.scrollTo({ left: i * $pista.clientWidth });
  }

  function marcarMiniatura() {
    const i = Math.round($pista.scrollLeft / Math.max($pista.clientWidth, 1));
    $miniaturas.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
  }
  $pista.addEventListener('scroll', () => requestAnimationFrame(marcarMiniatura), { passive: true });

  // Con el teclado: flechas izquierda/derecha para pasar fotos
  $pista.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = Math.round($pista.scrollLeft / $pista.clientWidth) + (e.key === 'ArrowRight' ? 1 : -1);
    irAFoto(Math.max(0, Math.min(i, $pista.children.length - 1)));
  });

  function dibujarGaleria(p) {
    $pista.replaceChildren(
      ...p.fotos.map((src, i) => {
        const img = crear('img');
        img.src = src;
        img.alt = p.fotos.length > 1 ? `${p.nombre} — foto ${i + 1} de ${p.fotos.length}` : p.nombre;
        if (i > 0) img.loading = 'lazy';
        return img;
      })
    );
    $pista.scrollLeft = 0;

    $miniaturas.hidden = p.fotos.length < 2;
    $miniaturas.replaceChildren(
      ...(p.fotos.length < 2 ? [] : p.fotos.map((src, i) => {
        const b = crear('button', 'ficha__miniatura');
        b.type = 'button';
        b.setAttribute('aria-label', `Ver foto ${i + 1}`);
        b.setAttribute('aria-current', String(i === 0));
        const img = crear('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        b.append(img);
        b.addEventListener('click', () => irAFoto(i));
        return b;
      }))
    );
  }

  const cerrar = () => $dialogo.close();
  $dialogo.querySelector('[data-cerrar-ficha]').addEventListener('click', cerrar);
  // Tocar afuera de la ficha también la cierra
  $dialogo.addEventListener('click', (e) => { if (e.target === $dialogo) cerrar(); });
  $dialogo.addEventListener('close', () => {
    if (location.hash.startsWith('#producto-')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  });

  $compartir.addEventListener('click', async () => {
    if (!productoActual) return;
    const url = `${location.origin}${location.pathname}#producto-${productoActual.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: productoActual.nombre, url });
      } else {
        await navigator.clipboard.writeText(url);
        $compartir.textContent = '¡Link copiado!';
        setTimeout(() => { $compartir.textContent = 'Copiar link de este producto'; }, 2000);
      }
    } catch { /* la persona canceló: no hacemos nada */ }
  });

  return {
    abrir(p, { sinCambiarDireccion = false } = {}) {
      productoActual = p;
      dibujarGaleria(p);
      $categoria.textContent = p.categoria;
      ponerTextoConAmp($titulo, p.nombre);
      $descripcion.textContent = p.descripcion;
      $descripcion.hidden = !p.descripcion;
      $whatsapp.href = linkWhatsApp(numeroWhatsApp, MENSAJES.producto(p.nombre));
      if (!sinCambiarDireccion) history.replaceState(null, '', `#producto-${p.id}`);
      if (!$dialogo.open) $dialogo.showModal();
    },
  };
}
