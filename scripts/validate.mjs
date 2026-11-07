#!/usr/bin/env node
// Validates recurring.json and years/*.json. Run from the repository root:
//   node scripts/validate.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const MAX_DESC = 160; // about two lines in the popup

const isLeapGregorian = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const gDays = (y, m) => [31, isLeapGregorian(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const jDays = (m) => (m <= 6 ? 31 : m <= 11 ? 30 : 30); // Esfand 30 is allowed; the extension drops it in non-leap years

function checkDate(file, ev, recurring) {
  const cal = ev.jalali ? 'jalali' : ev.gregorian ? 'gregorian' : null;
  if (!cal || (ev.jalali && ev.gregorian)) {
    errors.push(`${file} ${ev.id}: set exactly one of "jalali" or "gregorian"`);
    return;
  }
  const re = recurring ? /^(\d{2})-(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
  const m = String(ev[cal]).match(re);
  if (!m) {
    errors.push(`${file} ${ev.id}: ${cal} must be ${recurring ? 'MM-DD' : 'YYYY-MM-DD'}`);
    return;
  }
  const [y, mo, d] = recurring ? [2000, +m[1], +m[2]] : [+m[1], +m[2], +m[3]];
  const max = cal === 'jalali' ? jDays(mo) : gDays(y, mo);
  if (mo < 1 || mo > 12 || d < 1 || d > max) errors.push(`${file} ${ev.id}: invalid ${cal} date ${ev[cal]}`);
}

function checkText(file, ev, field, required) {
  const v = ev[field];
  if (v == null) {
    if (required) errors.push(`${file} ${ev.id}: missing ${field}`);
    return;
  }
  const values = typeof v === 'string' ? [v] : Object.values(v);
  if (!values.length || values.some((s) => typeof s !== 'string' || !s.trim())) {
    errors.push(`${file} ${ev.id}: ${field} must be a string or { fa, en }`);
  }
  if (field === 'description' && values.some((s) => s.length > MAX_DESC)) {
    warnings.push(`${file} ${ev.id}: description is longer than ${MAX_DESC} characters (keep it to 1-2 lines)`);
  }
}

function checkFile(rel, recurring) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${err.message}`);
    return;
  }
  if (!Array.isArray(data.events)) {
    errors.push(`${rel}: "events" must be an array`);
    return;
  }
  if (!recurring) {
    const expected = Number(rel.match(/(\d+)\.json$/)[1]);
    if (data.year !== expected) errors.push(`${rel}: "year" must be ${expected}`);
  }
  const ids = new Set();
  for (const ev of data.events) {
    if (!ev.id || !/^[a-z0-9-]+$/.test(ev.id)) errors.push(`${rel}: bad or missing id ${JSON.stringify(ev.id)}`);
    if (ids.has(ev.id)) errors.push(`${rel}: duplicate id ${ev.id}`);
    ids.add(ev.id);
    checkDate(rel, ev, recurring);
    if (!recurring && ev.jalali && !ev.jalali.startsWith(`${data.year}-`)) {
      errors.push(`${rel} ${ev.id}: jalali date is not in year ${data.year}`);
    }
    checkText(rel, ev, 'title', true);
    checkText(rel, ev, 'description', false);
    if (ev.holiday != null && typeof ev.holiday !== 'boolean') errors.push(`${rel} ${ev.id}: holiday must be true/false`);
    if (ev.image && !/^https:\/\//.test(ev.image) && !existsSync(join(root, ev.image))) {
      errors.push(`${rel} ${ev.id}: image not found: ${ev.image}`);
    }
  }
  console.log(`✓ ${rel}: ${data.events.length} events`);
}

checkFile('recurring.json', true);
if (existsSync(join(root, 'years'))) {
  for (const f of readdirSync(join(root, 'years')).filter((n) => /^\d{4}\.json$/.test(n)).sort()) {
    checkFile(`years/${f}`, false);
  }
}

function checkBackgrounds() {
  const rel = 'backgrounds.json';
  if (!existsSync(join(root, rel))) return;
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${err.message}`);
    return;
  }
  if (!Array.isArray(data.backgrounds) || !data.backgrounds.length) {
    errors.push(`${rel}: "backgrounds" must be a non-empty array`);
    return;
  }
  const ids = new Set();
  for (const b of data.backgrounds) {
    const id = b.id ?? '(no id)';
    if (!/^[a-z0-9-]+$/.test(b.id ?? '')) errors.push(`${rel}: bad or missing id ${JSON.stringify(b.id)}`);
    if (ids.has(b.id)) errors.push(`${rel}: duplicate id ${b.id}`);
    ids.add(b.id);
    if (!b.image) errors.push(`${rel} ${id}: missing image`);
    else if (!/^https:\/\//.test(b.image)) {
      const path = join(root, b.image);
      if (!existsSync(path)) errors.push(`${rel} ${id}: image not found: ${b.image}`);
      else if (statSync(path).size > 1.5 * 1024 * 1024) warnings.push(`${rel} ${id}: image is larger than 1.5 MB`);
    }
    for (const f of ['place', 'region']) checkText(rel, { ...b, id }, f, true);
    if (!b.credit) errors.push(`${rel} ${id}: missing credit (photo licenses require it)`);
  }
  console.log(`✓ ${rel}: ${data.backgrounds.length} backgrounds`);
}

function checkHijri() {
  const rel = 'hijri.json';
  if (!existsSync(join(root, rel))) return;
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${err.message}`);
    return;
  }
  if (data.adjust != null && !Number.isInteger(data.adjust)) errors.push(`${rel}: "adjust" must be an integer`);
  let prev = null;
  for (const m of data.months ?? []) {
    if (!/^\d{4}-\d{2}$/.test(m.month ?? '')) errors.push(`${rel}: month must be YYYY-MM, got ${JSON.stringify(m.month)}`);
    const md = String(m.start ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!md || +md[2] < 1 || +md[2] > 12 || +md[3] < 1 || +md[3] > gDays(+md[1], +md[2])) {
      errors.push(`${rel} ${m.month}: start must be a Gregorian YYYY-MM-DD date`);
      continue;
    }
    const t = Date.UTC(+md[1], +md[2] - 1, +md[3]);
    if (prev !== null) {
      const len = Math.round((t - prev) / 86400000);
      if (len !== 29 && len !== 30) warnings.push(`${rel} ${m.month}: ${len} days after the previous month (expected 29 or 30)`);
    }
    prev = t;
  }
  console.log(`✓ ${rel}: ${(data.months ?? []).length} official month starts`);
}

checkBackgrounds();
checkHijri();

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length) process.exit(1);
console.log('All files are valid.');
