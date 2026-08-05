import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 4173);
const root = process.cwd();
const types = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml',
  '.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'
};

http.createServer(async (req,res)=>{
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let file = join(root, safe);
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, {'content-type':types[extname(file)] || 'application/octet-stream'});
    res.end(data);
  } catch {
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
}).listen(port, ()=>console.log(`Wedding invitation: http://localhost:${port}`));
