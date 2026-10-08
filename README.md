# CasaNova&co — Sitio web

Catálogo online de CasaNova&co (impresión 3D a medida). Sitio estático, sin costos:

- **Hosting:** Cloudflare Pages (publica la carpeta `public/`).
- **Panel de administración:** [Pages CMS](https://app.pagescms.org) (configurado en `.pages.yml`).
- **Fotos:** se optimizan solas con GitHub Actions al subirlas.
- **Pedidos:** botones que abren WhatsApp con el mensaje ya escrito.

## Estructura

```
.pages.yml                      ← qué se edita desde el panel
.github/workflows/              ← optimización automática de fotos
scripts/                        ← herramientas internas (no se publican)
public/                         ← LA WEB (lo único que se publica)
├── index.html                  ← estructura de la página
├── css/estilos.css             ← diseño (colores y fuentes arriba de todo)
├── js/
│   ├── main.js                 ← arranque: carga datos y activa cada parte
│   ├── catalogo.js             ← filtros, grilla, portada y ficha de producto
│   ├── config.js               ← ajustes: orden de categorías, mensajes de WhatsApp
│   └── utilidades.js           ← funciones compartidas
├── data/                       ← CONTENIDO (lo edita el panel)
│   ├── productos.json
│   ├── resenas.json
│   └── sitio.json              ← WhatsApp, Instagram, formas de entrega
├── imagenes/marca/             ← logo, íconos de la app, imagen para compartir
├── imagenes/productos/         ← fotos de productos (las sube el panel)
├── manifest.webmanifest + sw.js← app instalable en el celular
└── _headers                    ← reglas de caché de Cloudflare
```

## Tareas comunes

| Quiero… | Dónde |
|---|---|
| Agregar / editar / ocultar un producto | Panel → **Productos** |
| Cargar una reseña | Panel → **Reseñas** (la sección aparece sola cuando hay al menos una) |
| Cambiar WhatsApp o formas de entrega | Panel → **Datos de contacto y entregas** |
| Sumar una categoría nueva (ej. Velas) | Agregarla en `values` de `categoria` en `.pages.yml` (y opcionalmente en `ORDEN_CATEGORIAS` de `public/js/config.js`) |
| Cambiar colores o fuentes | Variables al inicio de `public/css/estilos.css` |

## Links útiles

- Link directo a una categoría: `/?categoria=Hogar`
- Link directo a un producto: `/#producto-nombre-del-producto` (botón "Copiar link" en la ficha)

## Probar en la compu (opcional)

Desde la carpeta `public/`: `python3 -m http.server 8080` y abrir http://localhost:8080
