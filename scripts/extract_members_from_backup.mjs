import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

function findMatchingBracket(source, openIdx, openChar, closeChar) {
  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escape = false;

  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function extractMembersArrayLiteral(sourceText) {
  const keyIdx = sourceText.indexOf('const MEMBERS_DATA');
  if (keyIdx === -1) throw new Error('[members] Could not find `const MEMBERS_DATA`.');

  const firstBracket = sourceText.indexOf('[', keyIdx);
  if (firstBracket === -1) throw new Error('[members] Could not find `[` after MEMBERS_DATA.');

  const endBracket = findMatchingBracket(sourceText, firstBracket, '[', ']');
  if (endBracket === -1) throw new Error('[members] Could not find matching `]` for members array.');

  return { start: firstBracket, end: endBracket, literal: sourceText.slice(firstBracket, endBracket + 1) };
}

function evalArrayLiteral(literal) {
  const context = { result: null };
  vm.createContext(context);
  vm.runInContext(`result = ${literal}`, context, { timeout: 1000 });
  if (!Array.isArray(context.result)) throw new Error('[members] Evaluated members literal is not an array.');
  return context.result;
}

function buildMemberDataJson(members) {
  const out = {};
  for (const m of members) {
    if (!m || typeof m !== 'object') continue;
    const name = String(m.name ?? '').trim();
    if (!name) continue;
    const platform = String(m.platform ?? '').trim();
    const status = Array.isArray(m.status) ? m.status : [];
    out[name] = { pl: platform, st: status };
  }
  return out;
}

function buildEnhancedMembersJs(members) {
  const json = JSON.stringify(members, null, 4);
  return [
    'const MEMBERS_DATA = ' + json + ';',
    '',
    '// Expose for both classic scripts and ES modules (e.g. `index.vite.html`).',
    'globalThis.DOZ_MEMBERS_DATA = MEMBERS_DATA;',
    '',
  ].join('\n');
}

const root = process.cwd();
const backupEnhanced = resolve(root, "don'tchenge", 'Dozmatome', 'enhanced_members_utf8.js');

const backupText = await readFile(backupEnhanced, 'utf8');
const extracted = extractMembersArrayLiteral(backupText);
const members = evalArrayLiteral(extracted.literal);

if (members.length === 0) throw new Error('[members] Backup members list is empty.');

const memberData = buildMemberDataJson(members);

await Promise.all([
  writeFile(resolve(root, 'member_data.json'), JSON.stringify(memberData, null, 2) + '\n', 'utf8'),
  writeFile(resolve(root, 'enhanced_members_utf8.js'), buildEnhancedMembersJs(members), 'utf8'),
  writeFile(resolve(root, 'enhanced_members.js'), buildEnhancedMembersJs(members), 'utf8'),
]);

console.log(`[members] Extracted ${members.length} members from backup and wrote: member_data.json / enhanced_members*.js`);

