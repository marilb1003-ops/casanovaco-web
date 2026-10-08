/**
 * Achica y comprime las fotos de productos para que la web cargue rápido.
 *
 * Lo ejecuta GitHub automáticamente cada vez que se sube una foto nueva
 * (ver .github/workflows/optimizar-imagenes.yml). Mantiene el mismo nombre
 * y formato de archivo, así los productos siguen apuntando a la misma foto.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CARPETA = path.resolve(process.argv[2] || '../public/imagenes/productos');
const LADO_MAXIMO = 1400;        // px del lado más largo
const PESO_OBJETIVO = 350 * 1024; // las fotos más livianas que esto y ya chicas se dejan igual

const formatos = {
  '.jpg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.jpeg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.png': (img) => img.png({ compressionLevel: 9, palette: true }),
  '.webp': (img) => img.webp({ quality: 80 }),
};

let optimizadas = 0;
for (const archivo of await readdir(CARPETA)) {
  const ext = path.extname(archivo).toLowerCase();
  if (!formatos[ext]) continue;

  const ruta = path.join(CARPETA, archivo);
  const original = await readFile(ruta);
  const { width = 0, height = 0 } = await sharp(original).metadata();
  const pesoOriginal = (await stat(ruta)).size;

  if (Math.max(width, height) <= LADO_MAXIMO && pesoOriginal <= PESO_OBJETIVO) continue;

  const imagen = sharp(original)
    .rotate() // respeta la orientación de las fotos de celular
    .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true });
  const nueva = await formatos[ext](imagen).toBuffer();

  if (nueva.length < pesoOriginal) {
    await writeFile(ruta, nueva);
    optimizadas++;
    console.log(`✔ ${archivo}: ${Math.round(pesoOriginal / 1024)} KB → ${Math.round(nueva.length / 1024)} KB`);
  }
}
console.log(optimizadas ? `Listo: ${optimizadas} foto(s) optimizada(s).` : 'No había fotos para optimizar.');
