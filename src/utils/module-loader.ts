import glob from 'tiny-glob';

export async function loadModules({
  dirname,
  resolve,
}: {
  dirname: string;
  resolve?: (module: any) => void;
}): Promise<any[]> {
  const files = await glob(`${dirname}/**/*.{js,ts}`, { absolute: true });

  const modules = await Promise.all(
    files.map(async (file) => {
      try {
        const module = await import(file);

        if (module.default) {
          resolve?.(module.default);
          return module.default;
        }
      } catch (err) {
        console.error(`Error loading module: ${file}`, err);
      }
    }),
  );

  return modules.filter(Boolean);
}
