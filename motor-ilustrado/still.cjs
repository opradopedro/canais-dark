// Um quadro do motor ilustrado em PNG (capa): node motor-ilustrado/still.cjs <estado.json> <t> <saida.png>
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [ep, t, saida] = process.argv.slice(2); const est = JSON.parse(fs.readFileSync(ep, 'utf8'));
  const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await nav.newPage({ viewport: est.formato === 'vertical' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  await pg.goto('file://' + path.join(__dirname, 'engine.html'));
  await pg.evaluate(e => window.carregar(e), est); await pg.waitForFunction('window.pronto()', null, { timeout: 120000 });
  await pg.evaluate(t => window.render(t), Number(t)); await pg.screenshot({ path: saida, type: 'png' }); await nav.close();
})().catch(e => { console.error(e); process.exit(1); });
