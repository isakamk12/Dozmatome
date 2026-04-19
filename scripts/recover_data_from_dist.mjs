import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const distJs = resolve(root, 'dist', 'assets', 'main-DKLvBzBa.js');
const targetMain = resolve(root, 'main.js');

const distText = await readFile(distJs, 'utf8');

const startMarker = '={logs:[';
const startIdx = distText.indexOf(startMarker);
if (startIdx === -1) {
  throw new Error(`[recover] Could not find start marker ${JSON.stringify(startMarker)} in ${distJs}`);
}
const objStart = startIdx + 1; // points at '{'

const endMarker = ';let u=';
const endIdx = distText.indexOf(endMarker, objStart);
if (endIdx === -1) {
  throw new Error(`[recover] Could not find end marker ${JSON.stringify(endMarker)} in ${distJs}`);
}

const dataLiteral = distText.slice(objStart, endIdx);
if (!dataLiteral.startsWith('{logs:[') || !dataLiteral.includes('members:[') || !dataLiteral.includes('bestiary:[') || !dataLiteral.includes('dungeon:{')) {
  throw new Error('[recover] Extracted literal does not look like the expected DATA object.');
}

const mainText = await readFile(targetMain, 'utf8');
const dataStart = mainText.indexOf('const DATA = {');
if (dataStart === -1) {
  throw new Error('[recover] Could not find `const DATA = {` in main.js');
}

const currentViewIdx = mainText.indexOf("let currentView = 'story';", dataStart);
if (currentViewIdx === -1) {
  throw new Error("[recover] Could not find `let currentView = 'story';` after DATA in main.js");
}

const dataEnd = mainText.lastIndexOf('};', currentViewIdx);
if (dataEnd === -1 || dataEnd < dataStart) {
  throw new Error('[recover] Could not find end of DATA object in main.js');
}

const before = mainText.slice(0, dataStart);
const after = mainText.slice(dataEnd + 2); // keep trailing newline that follows `};`

const rebuilt = `${before}const DATA = ${dataLiteral};${after}`;
await writeFile(targetMain, rebuilt, 'utf8');

console.log('[recover] main.js DATA replaced from dist bundle.');
