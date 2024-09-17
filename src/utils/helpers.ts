import { readdirSync } from 'fs';
import { join } from 'path';
import glob from 'tiny-glob';

export async function getFiles(dir: string): Promise<Array<any>> {
  try {
    const items = await glob(`${dir}/**/*.{js,ts}`, { absolute: true });

    if (items.length === 0) {
      return [];
    }

    const files = await Promise.all(
      items.map(async (item) => {
        const module = await import(item);
        return module.default;
      }),
    );

    return files;
  } catch (err) {
    console.error(`Error while importing files from ${dir}`, err);

    return [];
  }
}

export async function getFilesFromPath(path: string): Promise<Array<any>> {
  try {
    const dirents = readdirSync(path, { withFileTypes: true });

    if (dirents.length === 0) {
      return [];
    }

    const items: string[] = [];

    for (const item of dirents) {
      const filePath = join(path, item.name);

      if (item.isFile() && item.name.endsWith('.js')) {
        items.push(filePath);
      } else if (item.isDirectory()) {
        items.push(...(await getFilesFromPath(filePath)));
      }
    }

    const files = await Promise.all(
      items.map(async (item) => {
        const module = await import(item);
        return module.default;
      }),
    );

    return files;
  } catch (err) {
    console.error(`Error while importing files from ${path}`, err);

    return [];
  }
}
