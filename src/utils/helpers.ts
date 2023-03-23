import glob from 'tiny-glob';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFiles(dir: string): Promise<Array<any>> {
  const items = await glob(`${dir}/**/*.{js,ts}`, { absolute: true });

  if (items.length === 0) {
    return [];
  }

  for (const item of items) {
    delete require.cache[require.resolve(item)];
  }

  const files = (
    await Promise.all(items.map(async (item) => await import(item)))
  ).map((file) => file.default);

  return files;
}
