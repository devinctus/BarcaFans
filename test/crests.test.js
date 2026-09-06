/* Club crests must render on the site's dark background.
   A crest rasterised onto an opaque white canvas shows as a white box.
   This suite decodes each PNG crest and asserts its corners are transparent. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');
const { UCL_TEAMS } = require('../ucl-data.js');

const ROOT = path.join(__dirname, '..');

/* Minimal 8-bit RGBA PNG decoder: enough to read corner pixels. */
function decodePng(file) {
  const data = fs.readFileSync(file);
  let pos = 8, idat = [], ihdr = null;
  while (pos < data.length) {
    const len = data.readUInt32BE(pos);
    const type = data.toString('ascii', pos + 4, pos + 8);
    const chunk = data.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      ihdr = { w: chunk.readUInt32BE(0), h: chunk.readUInt32BE(4), depth: chunk[8], colour: chunk[9] };
    } else if (type === 'IDAT') idat.push(chunk);
    pos += 12 + len;
  }
  assert.ok(ihdr, `${file}: no IHDR`);
  assert.strictEqual(ihdr.depth, 8, `${file}: expected 8-bit`);
  assert.strictEqual(ihdr.colour, 6, `${file}: expected RGBA (colour type 6), got ${ihdr.colour}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { w, h } = ihdr, bpp = 4, stride = w * bpp;
  const rows = [];
  let prev = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const line = Buffer.from(raw.subarray(p, p + stride));
    p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      if (filter === 1) line[i] = (line[i] + a) & 255;
      else if (filter === 2) line[i] = (line[i] + b) & 255;
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    rows.push(line);
    prev = line;
  }
  return { w, h, alphaAt: (x, y) => rows[y][x * bpp + 3] };
}

const pngCrests = Object.values(UCL_TEAMS).filter(t => t.crest.endsWith('.png'));

test('every declared crest file exists', () => {
  for (const t of Object.values(UCL_TEAMS)) {
    assert.ok(fs.existsSync(path.join(ROOT, t.crest)), `${t.code}: missing ${t.crest}`);
  }
});

test('PNG crests have transparent corners, not a white box', () => {
  for (const t of pngCrests) {
    const { w, h, alphaAt } = decodePng(path.join(ROOT, t.crest));
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    for (const [x, y] of corners) {
      assert.strictEqual(
        alphaAt(x, y), 0,
        `${t.code} (${t.crest}): corner ${x},${y} is opaque. The crest was flattened onto a background and will show as a box on the dark page.`
      );
    }
  }
});

test('PNG crests are not squashed into a square when the artwork is not square', () => {
  // A crest forced into a square canvas gets cropped. Porto's crest is taller
  // than it is wide; a 1:1 file is the signature of that bug.
  const { w, h } = decodePng(path.join(ROOT, UCL_TEAMS.POR.crest));
  assert.notStrictEqual(w, h, 'POR: square canvas indicates the crest was cropped to fit');
});
