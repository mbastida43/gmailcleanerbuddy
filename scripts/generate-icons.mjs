// Gera os ícones PNG do app (PWA / Play Store) sem dependências externas.
// Rode com: node scripts/generate-icons.mjs
//
// O desenho é o mesmo do .logo da UI: quadrado com o gradiente das 4 cores do
// Google (135deg) e um envelope branco vazado no centro.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const STOPS = [
  [0x42, 0x85, 0xf4], // blue
  [0x34, 0xa8, 0x53], // green
  [0xfb, 0xbc, 0x05], // yellow
  [0xea, 0x43, 0x35]  // red
];

/** Cor do gradiente 135deg na posição t ∈ [0,1]. */
function gradient(t) {
  const seg = Math.min(Math.floor(t * (STOPS.length - 1)), STOPS.length - 2);
  const local = t * (STOPS.length - 1) - seg;
  const [a, b] = [STOPS[seg], STOPS[seg + 1]];
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * local));
}

/** Distância de P ao segmento AB, em coordenadas normalizadas. */
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Dentro de um retângulo de cantos arredondados (coords normalizadas)? */
function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return Math.hypot(x - cx, y - cy) <= r || (x >= x0 + r && x <= x1 - r) || (y >= y0 + r && y <= y1 - r);
}

/**
 * Cor RGBA de um ponto normalizado.
 * @param scale fator do glifo (maskable usa glifo menor por causa da safe zone)
 * @param rounded cantos arredondados no fundo (ícone "any") ou full-bleed (maskable)
 */
function sample(x, y, scale, rounded) {
  const bgRadius = rounded ? 0.22 : 0;
  if (rounded && !inRoundedRect(x, y, 0, 0, 1, 1, bgRadius)) return [0, 0, 0, 0];

  const bg = [...gradient(Math.min(1, (x + y) / 2)), 255];

  // Glifo do envelope centrado, escalado em torno de (0.5, 0.5).
  const gx = (x - 0.5) / scale + 0.5;
  const gy = (y - 0.5) / scale + 0.5;

  const body = inRoundedRect(gx, gy, 0.2, 0.31, 0.8, 0.69, 0.05);
  if (!body) return bg;

  // Aba do envelope: um "V" vazado na cor do fundo.
  const flap =
    distToSegment(gx, gy, 0.2, 0.325, 0.5, 0.545) < 0.03 ||
    distToSegment(gx, gy, 0.5, 0.545, 0.8, 0.325) < 0.03;
  return flap ? bg : [255, 255, 255, 255];
}

function renderRGBA(size, scale, rounded) {
  const SS = 3; // supersampling p/ antialiasing
  const px = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [cr, cg, cb, ca] = sample(
            (pxi + (sx + 0.5) / SS) / size,
            (py + (sy + 0.5) / SS) / size,
            scale,
            rounded
          );
          r += cr * ca; g += cg * ca; b += cb * ca; a += ca;
        }
      }
      const i = (py * size + pxi) * 4;
      px[i] = a ? Math.round(r / a) : 0;
      px[i + 1] = a ? Math.round(g / a) : 0;
      px[i + 2] = a ? Math.round(b / a) : 0;
      px[i + 3] = Math.round(a / (SS * SS));
    }
  }
  return px;
}

// ---- Encoder PNG mínimo (RGBA, filtro 0) ----
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtro None
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, scale: 1, rounded: true },
  { file: 'icon-512.png', size: 512, scale: 1, rounded: true },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.72, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, scale: 1, rounded: false },
  { file: 'favicon-32.png', size: 32, scale: 1, rounded: true }
];

mkdirSync(OUT_DIR, { recursive: true });
for (const { file, size, scale, rounded } of TARGETS) {
  const png = encodePNG(size, renderRGBA(size, scale, rounded));
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`✅ ${file} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
