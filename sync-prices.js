#!/usr/bin/env node
/* ============================================================
   META NEO · PRICE SYNC
   ------------------------------------------------------------
   Prices appear in about eighty places across this site: visible copy, the
   savings arithmetic, meta descriptions, JSON-LD offers and two analytics
   value maps. Editing those by hand is how a site ends up advertising a price
   its checkout does not sell.

   So: prices.json is the one place. Change a number there, run this, commit.

       node sync-prices.js            apply
       node sync-prices.js --check    exit 1 if anything is out of sync

   How it works: prices.lock.json records what is currently written into the
   files. This computes the old and new string for every figure, derived and
   literal, and swaps one for the other. That keeps the HTML static, so
   crawlers and the JSON-LD still see real numbers, with no build step.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const LOCK = path.join(ROOT, 'prices.lock.json');
const CHECK = process.argv.includes('--check');

const money = n => n.toFixed(2);

/* Everything the site states about price, derived from the two real numbers.
   Keep this in step with the copy: if a new sentence states a new figure, it
   needs a token here or it will silently go stale. */
function figures(p) {
  const single = p.single;
  const series = p.series;
  const sum3 = +(single * 3).toFixed(2);   // "bought separately"
  const save = +(sum3 - series).toFixed(2);
  const two = +(single * 2).toFixed(2);    // "two guides on their own"
  const third = +(series - two).toFixed(2); // "the third guide and the bonuses"
  const perGuide = series / 3;
  return {
    single, series, sum3, save, two, third,
    perGuideCeil: Math.ceil(perGuide),      // reads as "just under £N"
    saveFloor: Math.floor(save),            // reads as "save over £N"
  };
}

/* old string -> new string.
   These MUST be applied in one pass. Applied one after another they corrupt
   each other: dropping the Series to £39.99 makes per-guide £15 -> £14 while
   "save over" goes £14 -> £19, so a sequential run turns the per-guide figure
   into £19. One alternation, longest first, each match resolved once. */
function pairs(a, b) {
  const out = [];
  const push = (o, n) => { if (o !== n) out.push([o, n]); };

  // literal money in copy
  push(`£${money(a.sum3)}`, `£${money(b.sum3)}`);
  push(`£${money(a.series)}`, `£${money(b.series)}`);
  push(`£${money(a.two)}`, `£${money(b.two)}`);
  push(`£${money(a.single)}`, `£${money(b.single)}`);
  push(`£${money(a.save)}`, `£${money(b.save)}`);
  push(`£${money(a.third)}`, `£${money(b.third)}`);
  // rounded figures that carry a qualifying word
  push(`£${a.perGuideCeil}`, `£${b.perGuideCeil}`);
  push(`£${a.saveFloor}`, `£${b.saveFloor}`);
  // JSON-LD offers
  push(`"price": "${money(a.series)}"`, `"price": "${money(b.series)}"`);
  push(`"price": "${money(a.single)}"`, `"price": "${money(b.single)}"`);
  // analytics value maps (index.html VALUES{}, signal.js value=)
  push(`:${money(a.series)}`, `:${money(b.series)}`);
  push(`:${money(a.single)}`, `:${money(b.single)}`);
  push(`=${money(a.series)}`, `=${money(b.series)}`);
  push(`=${money(a.single)}`, `=${money(b.single)}`);

  // Longest first: at any position the most specific token must win, so that
  // £14 cannot claim the start of £14.98.
  return out.sort((x, y) => y[0].length - x[0].length);
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* One regex over all tokens. A bare-integer token such as £14 gets a lookahead
   so it cannot match inside £14.98 or £19.99 when those are not themselves
   being replaced. */
function buildMatcher(reps) {
  const map = new Map();
  const alts = reps.map(([o, n]) => {
    map.set(o, n);
    return esc(o) + (/^£\d+$/.test(o) ? '(?![\\d.])' : '');
  });
  return { re: new RegExp(alts.join('|'), 'g'), map };
}

function targets() {
  return fs.readdirSync(ROOT)
    .filter(f => /\.(html|js)$/.test(f) && f !== 'sync-prices.js')
    .map(f => path.join(ROOT, f));
}

function main() {
  const want = JSON.parse(fs.readFileSync(path.join(ROOT, 'prices.json'), 'utf8'));
  if (typeof want.single !== 'number' || typeof want.series !== 'number') {
    console.error('prices.json must contain numeric "single" and "series".');
    process.exit(2);
  }
  if (!fs.existsSync(LOCK)) {
    console.error('prices.lock.json is missing. It records what is currently written');
    console.error('into the files, so without it there is nothing to replace. Restore it');
    console.error('from git rather than guessing.');
    process.exit(2);
  }
  const have = JSON.parse(fs.readFileSync(LOCK, 'utf8'));

  const a = figures(have), b = figures(want);

  if (b.save <= 0) {
    console.error(`REFUSING: the Series (£${money(b.series)}) is not cheaper than the three`);
    console.error(`guides bought separately (£${money(b.sum3)}), so every "save" and`);
    console.error('"bought separately" line on the site would become false. Fix prices.json.');
    process.exit(2);
  }

  /* The site argues the bundle from arithmetic: "two guides cost £X, all three
     cost £Y, so the third plus the bonuses is £Z". Below about a pound that
     sentence stops being persuasive and starts sounding like a trick, and the
     script cannot reword prose. */
  if (b.third < 1) {
    console.warn(`WARNING: the third guide plus bonuses now works out at £${money(b.third)}.`);
    console.warn('The "paying full price for two" copy on index.html reads badly at that');
    console.warn('figure and should be rewritten by hand.\n');
  }

  const reps = pairs(a, b);
  if (!reps.length) { console.log('Prices already in sync.'); return; }

  const { re, map } = buildMatcher(reps);

  let changed = 0, files = 0;
  for (const file of targets()) {
    const before = fs.readFileSync(file, 'utf8');
    let hits = 0;
    const after = before.replace(re, m => { hits++; return map.get(m); });
    if (after !== before) {
      files++; changed += hits;
      if (!CHECK) fs.writeFileSync(file, after);
      console.log(`${CHECK ? 'OUT OF SYNC' : 'updated'}  ${path.basename(file)}  (${hits})`);
    }
  }

  if (CHECK) {
    if (changed) {
      console.error(`\n${changed} price string(s) in ${files} file(s) do not match prices.json.`);
      console.error('Run: node sync-prices.js');
      process.exit(1);
    }
    console.log('Prices in sync.');
    return;
  }

  fs.writeFileSync(LOCK, JSON.stringify({ single: want.single, series: want.series }, null, 2) + '\n');
  console.log(`\n${changed} replacement(s) across ${files} file(s).`);
  console.log(`Series £${money(b.series)} · single £${money(b.single)} · separately £${money(b.sum3)} · save £${money(b.save)}`);
  console.log('Check the Whop listing matches before pushing.');
}

main();
