import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataFile = resolve(here, '../data/tickets.json');

async function ensureFile() {
  await mkdir(dirname(dataFile), { recursive: true });
  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, '[]\n', 'utf8');
  }
}

export async function findAll() {
  await ensureFile();
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

export async function saveAll(tickets) {
  await ensureFile();
  await writeFile(dataFile, `${JSON.stringify(tickets, null, 2)}\n`, 'utf8');
}
