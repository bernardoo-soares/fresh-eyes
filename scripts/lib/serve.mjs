#!/usr/bin/env node
// Minimal static server for fixture pages and built artifacts, with routes that simulate auth walls and server errors.
//   node scripts/lib/serve.mjs [dir] [port]
// `redirects` maps a path to where it answers 302, for tests of redirects; a path ending in / serves its index.html.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isMain } from './cli.mjs';

// Mocks reference the app's own images and fonts; a browser refuses to render an SVG served as octet-stream, so a
// missing type here shows up as a broken logo in every after-capture.
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

export function serve(dir, port = 0, { redirects = {} } = {}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/private') { res.writeHead(302, { Location: '/login.html' }); return res.end(); }
    if (url.pathname === '/error500') { res.writeHead(500); return res.end('boom'); }
    if (Object.hasOwn(redirects, url.pathname)) { res.writeHead(302, { Location: redirects[url.pathname] }); return res.end(); }
    let file = url.pathname;
    if (file === '/account') {
      if (!/(?:^|;\s*)session=1(?:;|$)/.test(req.headers.cookie ?? '')) { res.writeHead(302, { Location: '/login.html' }); return res.end(); }
      file = '/good-settings.html';
    }
    if (file.endsWith('/')) file += 'index.html';
    try {
      const body = await readFile(path.join(dir, path.normalize(file).replace(/^([/\\])+/, '')));
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) })));
}

if (isMain(import.meta.url)) {
  const [dir = '.', port = '4173'] = process.argv.slice(2);
  serve(dir, Number(port)).then((s) => console.log(`Serving ${dir} at ${s.url}`));
}
