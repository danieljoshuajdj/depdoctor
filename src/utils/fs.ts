import { access, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

export async function fileSize(path: string): Promise<number> {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

export async function findUp(names: string[], start: string): Promise<string | undefined> {
  let current = start;
  while (true) {
    for (const name of names) {
      const candidate = join(current, name);
      if (await pathExists(candidate)) return candidate;
    }
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}
