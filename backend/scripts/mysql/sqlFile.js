import { readFile } from 'node:fs/promises';

// Acepta DELIMITER usado por Workbench. No requiere multipleStatements ni
// divide el cuerpo de un trigger por sus puntos y coma internos.
export function statements(source) {
  const result = [];
  let delimiter = ';';
  let buffer = '';
  let quote = null;
  let blockComment = false;
  for (const line of source.split(/\r?\n/)) {
    const directive = !quote && !blockComment && line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (directive) {
      if (buffer.trim()) throw new Error('DELIMITER dentro de una sentencia incompleta');
      delimiter = directive[1];
      continue;
    }
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (blockComment) {
        if (ch === '*' && next === '/') { blockComment = false; i++; }
        continue;
      }
      if (quote) {
        buffer += ch;
        if (ch === '\\' && next) { buffer += next; i++; }
        else if (ch === quote && next === quote) { buffer += next; i++; }
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '-' && next === '-' && (!line[i + 2] || /\s/.test(line[i + 2]))) break;
      if (ch === '#') break;
      if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; buffer += ch; continue; }
      if (line.startsWith(delimiter, i)) {
        if (buffer.trim()) result.push(buffer.trim());
        buffer = '';
        i += delimiter.length - 1;
      } else buffer += ch;
    }
    buffer += '\n';
  }
  if (quote || blockComment || buffer.trim()) throw new Error('SQL incompleto');
  return result;
}

export async function executeFile(connection, path) {
  for (const sql of statements(await readFile(path, 'utf8'))) {
    await connection.query(sql);
  }
}
