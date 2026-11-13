// Desenha o video do motor ilustrado: node motor-ilustrado/render.cjs <estado.json> <saida.mp4> [--shard i/n]
// 16:9 1920x1080 30 fps, sem som (o som entra no montar). --shard divide os quadros para rodar em paralelo.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const aqui = __dirname;
(async () => {
const [estPath, saida] = process.argv.slice(2);
const sh = process.argv.includes('--shard') ? process.argv[process.argv.indexOf('--shard') + 1].split('/').map(Number) : [0, 1];
const est = JSON.parse(fs.readFileSync(estPath, 'utf8')); const fps = est.fps || 30;
const N = Math.ceil(est.dur * fps), por = Math.ceil(N / sh[1]), a = sh[0] * por, b = Math.min(N, a + por);
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const pg = await nav.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', m => { if (/FALTANDO|Error/.test(m.text())) console.log('[pagina]', m.text()); });
await pg.goto('file://' + path.join(aqui, 'engine.html'));
await pg.evaluate(e => window.carregar(e), est);
await pg.waitForFunction('window.pronto()', null, { timeout: 120000 });
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', saida], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = a; f < b; f++) {
  await pg.evaluate(t => window.render(t), f / fps);
  const buf = await pg.screenshot({ type: 'jpeg', quality: 90 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - a) % 300 === 0) console.log(`quadro ${f - a}/${b - a}`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await nav.close();
console.log(`pronto: ${b - a} quadros em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})().catch(e => { console.error(e); process.exit(1); });
