// Run: npm test — extracts the class heuristic from index.html and checks it.
const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('const CLASS_MAP');
const end = html.indexOf('// ---------- Variant generation');
const { suggestClasses, CLASS_MAP } = new Function(
  html.slice(start, end) + '; return { suggestClasses, CLASS_MAP };')();

// [description, class expected somewhere in the suggestions, expected first]
const cases = [
  ['sunshine bakery', '030', '030'],
  ['bakery', '043'],
  ['a bakery that sells bread', '030'],
  ['bakery shop', '043'],
  ['we sell cupcakes and cakes', '030'],
  ['yoga studio', '041'],
  ['dog walking', '045'],
  ['landscaping', '044'],
  ['plumber', '037'],
  ['house cleaning', '037'],
  ['law firm', '045'],
  ['skincare', '003'],
  ['coffee roaster', '030'],
  ['clothing brand', '025'],
  ['mobile app', '009'],
  ['t-shirts and hoodies', '025'],
  ['craft kombucha', '032'],
  ['3d printing shop', '040'],
  ['guitar lessons and guitars', '015'],
];
cases.forEach(([desc, code, first]) => {
  const got = suggestClasses(desc).map(c => c.code);
  assert(got.includes(code), `"${desc}" expected ${code}, got [${got}]`);
  if (first) assert.strictEqual(got[0], first, `"${desc}" expected ${first} first, got [${got}]`);
});

// Word boundaries: "bar" (043) must not match inside "barber" or "barbell".
assert(!suggestClasses('barbell').some(c => c.code === '043'), 'bar matched inside barbell');
// Plural tolerance.
assert(suggestClasses('cookies').some(c => c.code === '030'), 'plural cookies missed');
// No empty-string / whitespace suggestions.
assert.deepStrictEqual(suggestClasses('   '), []);
// Every class code is unique.
const codes = CLASS_MAP.map(c => c.code);
assert.strictEqual(new Set(codes).size, codes.length, 'duplicate class codes');
console.log(`ok — ${cases.length} description cases, ${codes.length} classes`);
