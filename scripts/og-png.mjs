import { deflateSync, crc32 } from 'node:zlib';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const BISCAY = [0x11, 0x19, 0x40];
const CELESTE = [0x3c, 0xbe, 0xef];
const WHITE = [0xf8, 0xfa, 0xfc];
const MUTED = [0x94, 0xa3, 0xb8];

const GLYPHS = {
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'],
  ':': ['.....', '..#..', '.....', '.....', '.....', '..#..', '.....'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  3: ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '..##.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
};

function setPixel(rgb, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= OG_HEIGHT) return;
  const index = (y * width + x) * 3;
  rgb[index] = color[0];
  rgb[index + 1] = color[1];
  rgb[index + 2] = color[2];
}

function fillRect(rgb, width, x, y, w, h, color) {
  const x1 = Math.max(0, x);
  const y1 = Math.max(0, y);
  const x2 = Math.min(width, x + w);
  const y2 = Math.min(OG_HEIGHT, y + h);
  for (let py = y1; py < y2; py += 1) {
    for (let px = x1; px < x2; px += 1) setPixel(rgb, width, px, py, color);
  }
}

function drawText(rgb, width, text, originX, originY, scale, color) {
  let x = originX;
  for (const raw of text.toUpperCase()) {
    const rows = GLYPHS[raw] || GLYPHS[' '];
    rows.forEach((row, cy) => {
      [...row].forEach((cell, cx) => {
        if (cell !== '#') return;
        fillRect(rgb, width, x + cx * scale, originY + cy * scale, scale, scale, color);
      });
    });
    x += (rows[0].length + 1) * scale;
  }
}

function chunk(type, data) {
  const label = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const payload = Buffer.concat([label, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload) >>> 0);
  return Buffer.concat([length, payload, crc]);
}

export function encodePng(rgb, width = OG_WIDTH, height = OG_HEIGHT) {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    rgb.copy(raw, y * stride + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function buildOgImage() {
  const rgb = Buffer.alloc(OG_WIDTH * OG_HEIGHT * 3);
  fillRect(rgb, OG_WIDTH, 0, 0, OG_WIDTH, OG_HEIGHT, BISCAY);
  fillRect(rgb, OG_WIDTH, 0, 0, OG_WIDTH, 18, CELESTE);
  fillRect(rgb, OG_WIDTH, 0, 0, 18, OG_HEIGHT, CELESTE);
  fillRect(rgb, OG_WIDTH, 0, OG_HEIGHT - 18, OG_WIDTH, 18, CELESTE);
  drawText(rgb, OG_WIDTH, 'SEBICHE CELESTE', 72, 140, 8, CELESTE);
  drawText(rgb, OG_WIDTH, 'ARCHIVO HISTORICO', 72, 270, 6, WHITE);
  drawText(rgb, OG_WIDTH, 'SPORTING CRISTAL', 72, 360, 6, WHITE);
  drawText(rgb, OG_WIDTH, 'CELESTE.SEBICHE.COM', 72, 520, 4, MUTED);
  return encodePng(rgb);
}
