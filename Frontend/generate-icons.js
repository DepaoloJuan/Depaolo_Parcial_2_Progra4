// Genera los iconos PNG requeridos por el manifest.webmanifest
// sin dependencias externas — solo Node.js built-ins (zlib, fs, path).
// Crea un PNG de color sólido #0d6efd (Bootstrap primary) para cada tamaño.
// Uso: node generate-icons.js  (desde la carpeta Frontend/)

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const DEST  = path.join(__dirname, 'public', 'icons');
const R = 13, G = 110, B = 253; // #0d6efd

// --- CRC32 ---
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len  = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const t    = Buffer.from(type, 'ascii');
  const crc  = Buffer.allocUnsafe(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(size) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw pixel data: 1 filter byte + RGB per pixel per row
  const row = Buffer.allocUnsafe(1 + size * 3);
  row[0] = 0; // filter = None
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = R; row[2 + x * 3] = G; row[3 + x * 3] = B;
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(DEST, { recursive: true });
for (const s of SIZES) {
  const file = path.join(DEST, `icon-${s}x${s}.png`);
  fs.writeFileSync(file, makePNG(s));
  console.log(`✔ icon-${s}x${s}.png`);
}
console.log('Done — iconos generados en public/icons/');
