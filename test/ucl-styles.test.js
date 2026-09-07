/* The UCL admin panel once shipped unstyled because its markup used a class
   (.admin-teams) that no stylesheet defined, so the browser fell back to
   default white inputs and buttons. This suite cross-checks every class the
   UCL page renders against the stylesheets ucl.html actually loads. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* Stylesheets are discovered from the page itself, so adding or dropping a
   <link> here cannot silently invalidate the check. */
function stylesheetsOf(htmlFile) {
  const html = read(htmlFile);
  return [...html.matchAll(/<link[^>]+href="([^"?]+\.css)/g)].map(m => m[1]);
}

function classesUsedIn(sources) {
  const used = new Set();
  for (const src of sources) {
    // class="..." including values assembled with ${...}; the interpolated
    // parts are stripped, the literal class names around them are kept.
    for (const m of src.matchAll(/class="([^"]*)"/g)) {
      m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter(Boolean).forEach(c => used.add(c));
    }
    // className: 'x' used by the crest onerror fallback
    for (const m of src.matchAll(/className:\s*'([^']+)'/g)) {
      m[1].split(/\s+/).filter(Boolean).forEach(c => used.add(c));
    }
  }
  return used;
}

test('every class the UCL page renders has a CSS rule', () => {
  const sheets = stylesheetsOf('ucl.html');
  assert.ok(sheets.length > 0, 'ucl.html loads no stylesheets');

  const css = sheets.map(read).join('\n');
  const used = classesUsedIn([read('ucl.js'), read('ucl.html')]);
  assert.ok(used.size > 20, `expected many classes, found ${used.size}`);

  const missing = [...used]
    .filter(c => !new RegExp('\\.' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(css))
    .sort();

  assert.deepStrictEqual(
    missing, [],
    `these classes are rendered but styled nowhere in ${sheets.join(', ')}: ${missing.join(', ')}`
  );
});

test('the UCL admin row uses the same structure the admin CSS targets', () => {
  const js = read('ucl.js');
  // These are the hooks wc2026.css styles the admin rows through. Rendering an
  // admin row without them is what produced the unstyled panel.
  for (const cls of ['admin-match-row', 'admin-match-top', 'admin-match-label',
                     'admin-match-date', 'admin-row-controls', 'admin-score-inputs',
                     'btn-save-result']) {
    assert.ok(js.includes(cls), `ucl.js admin markup is missing .${cls}`);
  }
});
