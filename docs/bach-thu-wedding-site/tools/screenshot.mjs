import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts', {recursive:true});
const server = spawn(process.execPath, ['tools/server.mjs'], {stdio:'inherit'});
await new Promise(r=>setTimeout(r,700));

const chromium = process.env.CHROMIUM || '/usr/bin/chromium';
const args = [
  '--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',
  '--force-device-scale-factor=1','--window-size=682,2048',
  '--screenshot=artifacts/site.png','http://127.0.0.1:4173'
];
const shot = spawn(chromium,args,{stdio:'inherit'});
shot.on('exit', code => {
  server.kill('SIGTERM');
  process.exit(code ?? 0);
});
