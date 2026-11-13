const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+__dirname+'/cena.html');await p.waitForFunction('window.pronto()');
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','h.mp4']);
const t0=Date.now();const N=30*10;
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/30);const d='x,'+(await p.screenshot({type:'jpeg',quality:92})).toString('base64');
ff.stdin.write(Buffer.from(d.split(',')[1],'base64'));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('s/quadro',(Date.now()-t0)/N/1000);await b.close()})();
