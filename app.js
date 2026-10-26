const $=id=>document.getElementById(id);
const DOWN_URL='https://speed.cloudflare.com/__down', UP_URL='https://speed.cloudflare.com/__up';
let samples=[];
function setGauge(mbps){const max=200;const frac=Math.min(1,Math.log10(Math.max(1,mbps)+1)/Math.log10(max+1));$('gaugeArc').style.strokeDashoffset=283-(283*frac);$('bigSpeed').textContent=mbps?mbps.toFixed(2):'0.00';}
function setProgress(p){$('progressBar').style.width=(p*100)+'%';}
function drawChart(){const c=$('chart'),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);if(samples.length<2)return;const max=Math.max(...samples)*1.15||10;x.beginPath();samples.forEach((v,i)=>{const px=i/(samples.length-1)*c.width,py=c.height-(v/max)*c.height;i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle='#00d4ff';x.lineWidth=2.5;x.stroke();x.lineTo(c.width,c.height);x.lineTo(0,c.height);x.closePath();x.fillStyle='rgba(0,212,255,.15)';x.fill();}
async function measurePing(){const times=[];for(let i=0;i<5;i++){const t0=performance.now();await fetch(DOWN_URL+'?bytes=0&r='+Math.random(),{cache:'no-store'});times.push(performance.now()-t0);await new Promise(r=>setTimeout(r,100));}
times.sort((a,b)=>a-b);const ping=times[Math.floor(times.length/2)];const jitter=times.reduce((s,v)=>s+Math.abs(v-ping),0)/times.length;return{ping:Math.round(ping),jitter:Math.round(jitter)};}
async function measureDownload(seconds = 10) {
  let total = 0;
  const start = performance.now();
  async function worker() {
    while (performance.now() - start < seconds * 1000) {
      const res = await fetch(DOWN_URL + '?bytes=25000000&r=' + Math.random(), { cache: 'no-store' });
      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (total * 8 / elapsed) / 1e6;
        samples.push(mbps); setGauge(mbps);
        $('downVal').textContent = mbps.toFixed(2);
        drawChart(); setProgress(.15 + .45 * (elapsed / seconds));
        if (performance.now() - start >= seconds * 1000) { reader.cancel(); break; }
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  const elapsed = (performance.now() - start) / 1000;
  return (total * 8 / elapsed) / 1e6;
}
async function measureUpload(seconds = 8) {
  const payload = new Uint8Array(1000000);
  crypto.getRandomValues(payload.subarray(0, 65536));
  let total = 0;
  const start = performance.now();
  async function worker() {
    while (performance.now() - start < seconds * 1000) {
      await fetch(UP_URL, { method: 'POST', body: payload });
      total += payload.length;
      const elapsed = (performance.now() - start) / 1000;
      const mbps = (total * 8 / elapsed) / 1e6;
      samples.push(mbps); setGauge(mbps);
      $('upVal').textContent = mbps.toFixed(2);
      drawChart(); setProgress(.6 + .4 * (elapsed / seconds));
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  const elapsed = (performance.now() - start) / 1000;
  return (total * 8 / elapsed) / 1e6;
}
function verdict(d){if(d>=100)return'🚀 Blazing fast — 4K streaming & gaming, no problem.';if(d>=50)return'✅ Great — HD streaming and smooth video calls.';if(d>=25)return'👍 Good — fine for HD streaming on a couple of devices.';if(d>=10)return'🙂 Okay — SD streaming works, HD may buffer.';return'🐢 Slow — try moving closer to your router or restarting it.';}
function saveHistory(r){const h=JSON.parse(localStorage.getItem('speedHistory')||'[]');h.unshift(r);localStorage.setItem('speedHistory',JSON.stringify(h.slice(0,10)));renderHistory();}
function renderHistory(){const h=JSON.parse(localStorage.getItem('speedHistory')||'[]');const el=$('historyList');if(!h.length){el.innerHTML='<p class="empty">No tests yet — run your first test above.</p>';$('clearHistory').hidden=true;return;}$('clearHistory').hidden=false;el.innerHTML=h.map(r=>`<div class="row"><span>🕐 ${new Date(r.t).toLocaleString()}</span><span>🏓 ${r.ping} ms</span><span>⬇️ ${r.down.toFixed(1)} Mbps</span><span>⬆️ ${r.up.toFixed(1)} Mbps</span></div>`).join('');}
$('clearHistory').onclick=()=>{localStorage.removeItem('speedHistory');renderHistory();};
let lastResult=null;
async function runTest(){const btn=$('startBtn');btn.disabled=true;btn.textContent='⏳ Testing…';$('shareBtn').hidden=true;$('againBtn').hidden=true;$('verdict').textContent='';samples=[];drawChart();setProgress(0);
try{$('phaseLabel').textContent='Measuring ping…';const{ping,jitter}=await measurePing();$('pingVal').textContent=ping;$('jitterVal').textContent=jitter;setProgress(.15);
$('phaseLabel').textContent='Measuring download…';const down=await measureDownload();$('downVal').textContent=down.toFixed(2);
$('phaseLabel').textContent='Measuring upload…';samples=[];const up=await measureUpload();$('upVal').textContent=up.toFixed(2);
setProgress(1);$('phaseLabel').textContent='Done';$('verdict').textContent=verdict(down);lastResult={t:Date.now(),ping,down,up};saveHistory(lastResult);$('shareBtn').hidden=false;$('againBtn').hidden=false;
}catch(e){$('phaseLabel').textContent='Test failed — check your connection and retry.';console.error(e);}
btn.disabled=false;btn.textContent='▶ Start Test';}
$('startBtn').onclick=runTest;$('againBtn').onclick=runTest;
$('shareBtn').onclick=()=>{if(!lastResult)return;const txt=`My internet speed: ⬇️ ${lastResult.down.toFixed(1)} Mbps ⬆️ ${lastResult.up.toFixed(1)} Mbps 🏓 ${lastResult.ping} ms — tested on SpeedTest`;navigator.clipboard.writeText(txt).then(()=>$('shareBtn').textContent='✅ Copied!').then(()=>setTimeout(()=>$('shareBtn').textContent='📋 Copy Result',2000));};
fetch('https://www.cloudflare.com/cdn-cgi/trace').then(r=>r.text()).then(t=>{const loc=(t.match(/loc=(.*)/)||[])[1]||'';const ip=(t.match(/ip=(.*)/)||[])[1]||'';$('ipInfo').textContent=ip?`Connected from ${loc||'—'} (${ip.slice(0,7)}…)`:'Connected';}).catch(()=>$('ipInfo').textContent='Connected');
renderHistory();
