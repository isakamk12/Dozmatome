import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

function extractBrewedArray(sourceText) {
  const bestiaryKeyIdx = sourceText.indexOf('bestiary');
  if (bestiaryKeyIdx === -1) throw new Error('[restore] Could not find `bestiary` key.');

  const firstBracket = sourceText.indexOf('[', bestiaryKeyIdx);
  if (firstBracket === -1) throw new Error('[restore] Could not find `[` after bestiary key.');

  const endBracket = findMatchingBracket(sourceText, firstBracket, '[', ']');
  if (endBracket === -1) throw new Error('[restore] Could not find matching `]` for bestiary array.');

  return { start: firstBracket, end: endBracket, literal: sourceText.slice(firstBracket, endBracket + 1) };
}

const root = process.cwd();
const backupMain = resolve(root, "don'tchenge", 'Dozmatome', 'main.js');
const mainPath = resolve(root, 'main.js');

const [backupText, mainText] = await Promise.all([
  readFile(backupMain, 'utf8'),
  readFile(mainPath, 'utf8'),
]);

const backupBestiary = extractBrewedArray(backupText);
const currentBestiary = extractBrewedArray(mainText);

const updated =
  mainText.slice(0, currentBestiary.start) +
  backupBestiary.literal +
  mainText.slice(currentBestiary.end + 1);

await writeFile(mainPath, updated, 'utf8');
console.log('[restore] Replaced bestiary array in main.js from backup.');

