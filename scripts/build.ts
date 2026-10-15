// Bundles the browser code (app/client.tsx + Tailwind) into dist/ for server/index.ts.
// The server also calls buildClient() itself in development, on every page load.
import tailwind from 'bun-plugin-tailwind';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

export const DIST_DIR = join(import.meta.dir, '..', 'dist');

export interface Manifest {
  js: string;
  css: string[];
}

export async function buildClient(dev = false): Promise<Manifest> {
  await rm(DIST_DIR, { recursive: true, force: true });
  const result = await Bun.build({
    entrypoints: [join(import.meta.dir, '..', 'app', 'client.tsx')],
    outdir: DIST_DIR,
    publicPath: '/assets/',
    naming: '[dir]/[name]-[hash].[ext]',
    target: 'browser',
    splitting: true,
    minify: !dev,
    sourcemap: dev ? 'inline' : 'none',
    plugins: [tailwind],
    define: { 'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production') },
  });
  if (!result.success) {
    throw new AggregateError(result.logs, 'Client build failed');
  }
  // Served instead of the original when the browser accepts gzip (server/index.ts)
  for (const output of result.outputs) {
    if (/\.(js|css)$/.test(output.path)) {
      await Bun.write(`${output.path}.gz`, Bun.gzipSync(await output.arrayBuffer()));
    }
  }
  const name = (path: string) => '/assets/' + path.slice(DIST_DIR.length + 1);
  const manifest: Manifest = {
    js: name(result.outputs.find((o) => o.kind === 'entry-point')!.path),
    css: result.outputs.filter((o) => o.path.endsWith('.css')).map((o) => name(o.path)),
  };
  await Bun.write(join(DIST_DIR, 'manifest.json'), JSON.stringify(manifest));
  return manifest;
}

if (import.meta.main) {
  const manifest = await buildClient();
  console.log('Built client', manifest);
}
