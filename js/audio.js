// Procedural music + sound effects (Web Audio API). No audio files needed.
const SND=(function(){
 let ctx=null,mg,sg,nb,mode='off',want='off',step=0,nextT=0,coinT=0;
 const vol={music:.5,sfx:.7};
 const mf=n=>440*Math.pow(2,(n-69)/12);
 function init(){
  if(ctx){if(ctx.state==='suspended')ctx.resume();return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ctx=new AC();const comp=ctx.createDynamicsCompressor();comp.connect(ctx.destination);
  mg=ctx.createGain();sg=ctx.createGain();mg.connect(comp);sg.connect(comp);
  nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  apply();nextT=ctx.currentTime+.05;setInterval(sched,40);
  if(want!=='off'){const w=want;want='off';music(w)}
 }
 function apply(){if(!ctx)return;mg.gain.value=vol.music;sg.gain.value=vol.sfx}
 function tone(f,t,d,type,g,dest,to){const o=ctx.createOscillator(),e=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
  e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(g,t+.006);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);e.connect(dest);o.start(t);o.stop(t+d+.03)}
 function noise(t,d,g,dest,freq,type){const s=ctx.createBufferSource(),e=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=nb;f.type=type||'highpass';f.frequency.value=freq||1000;
  e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(e);e.connect(dest);s.start(t,Math.random()*.4,d+.03)}
 // ---- music patterns (step based) ----
 const MU={
  explore:{sd:.21,play(i,t,sd){ // light adventurous shanty in D minor
   const mel=[62,0,65,69,74,0,72,69, 67,0,69,70,69,0,65,62, 70,0,74,77,76,0,72,67, 69,0,73,76,74,0,0,0];
   const roots=[38,43,46,45],n=i%32,r=roots[n>>3];
   if(mel[n]){tone(mf(mel[n]),t,sd*1.8,'triangle',.2,mg);if(n%8===0)tone(mf(mel[n]+12),t,sd*1.2,'sine',.06,mg)}
   if(n%2===0)tone(mf(r+(n%4===2?7:0)),t,sd*1.5,'triangle',.26,mg);
   if(n%8===0||n%8===4)tone(95,t,.13,'sine',.4,mg,42);
   if(n%4===2)noise(t,.05,.07,mg,5000);
   if(n%8===6)tone(mf(r+19),t,sd*.8,'square',.04,mg);
  }},
  combat:{sd:.105,play(i,t,sd){ // fast energetic A minor
   const roots=[57,53,55,52],n=i%64,r=roots[n>>4],offs=[0,7,12,7,15,12,7,12];
   tone(mf(r+12+offs[n%8]),t,sd*.85,'square',.08,mg);
   if(n%2===0)tone(mf(r-12),t,sd*1.9,'sawtooth',.2,mg);
   if(n%4===0)tone(110,t,.12,'sine',.5,mg,45);
   if(n%8===4)noise(t,.12,.22,mg,1800,'bandpass');
   if(n%2===1)noise(t,.03,.06,mg,7000);
   if(n%16===0)tone(mf(r+24),t,sd*6,'sawtooth',.045,mg);
  }},
  boss:{sd:.095,play(i,t,sd){ // heavy, dark D phrygian
   const riff=[38,0,38,39,0,38,0,41,38,0,38,36,0,37,38,0],n=i%64,k=n%16;
   if(riff[k])tone(mf(riff[k]),t,sd*1.7,'sawtooth',.26,mg);
   if(riff[k])tone(mf(riff[k]+12),t,sd*1.2,'square',.05,mg);
   const stab=[50,51,50,48][n>>4];
   if(k===0||k===8){[0,3,7].forEach(o=>tone(mf(stab+o+(stab===51&&o===3?0:0)),t,sd*3,'sawtooth',.07,mg))}
   if(n%4===0)tone(105,t,.14,'sine',.6,mg,40);
   if(n%8===4)noise(t,.14,.3,mg,1500,'bandpass');
   if(n%2===1)noise(t,.03,.07,mg,7500);
   if(n>=56&&n%2===0)tone(170-(n-56)*8,t,.1,'sine',.35,mg,70);
  }}
 };
 function sched(){
  if(!ctx||!MU[mode])return;
  if(nextT<ctx.currentTime-.3)nextT=ctx.currentTime+.02;
  const m=MU[mode];
  while(nextT<ctx.currentTime+.12){m.play(step,nextT,m.sd);nextT+=m.sd;step++}
 }
 function music(m){
  if(!ctx){want=m;return}
  if(m===mode)return;mode=m;step=0;nextT=ctx.currentTime+.04;
  if(m==='victory'){const t=ctx.currentTime+.05;
   [[523,0,.2],[659,.2,.2],[784,.4,.2],[1047,.6,.5],[784,1.2,.2],[1047,1.4,1.1]].forEach(([f,o,d])=>{tone(f,t+o,d,'triangle',.4,mg);tone(f,t+o,d,'square',.08,mg)});
   [[262,1.4],[330,1.4],[392,1.4]].forEach(([f,o])=>tone(f,t+o,1.4,'triangle',.25,mg));
   [[1319,2.4],[1568,2.6],[2093,2.8]].forEach(([f,o])=>tone(f,t+o-.9,.5,'sine',.12,mg))
  }
 }
 const S={
  swing:t=>{noise(t,.12,.22,sg,1600,'bandpass');tone(620,t,.12,'sawtooth',.07,sg,200)},
  hit:t=>{noise(t,.08,.35,sg,350,'lowpass');tone(170,t,.1,'square',.2,sg,70)},
  heavy:t=>{noise(t,.3,.5,sg,220,'lowpass');tone(95,t,.38,'sine',.7,sg,35)},
  jump:t=>tone(280,t,.16,'square',.1,sg,620),
  dash:t=>noise(t,.22,.28,sg,900,'bandpass'),
  hurt:t=>{tone(300,t,.28,'sawtooth',.22,sg,80);noise(t,.1,.25,sg,500)},
  die:t=>{tone(420,t,.5,'sawtooth',.25,sg,50);noise(t,.2,.2,sg,400,'lowpass')},
  click:t=>tone(900,t,.05,'square',.14,sg),
  batk:t=>{tone(110,t,.45,'sawtooth',.38,sg,45);noise(t,.25,.3,sg,300,'lowpass')},
  slam:t=>{noise(t,.5,.6,sg,160,'lowpass');tone(70,t,.5,'sine',.8,sg,28)},
  sp:t=>{tone(300,t,.5,'sine',.32,sg,1500);tone(450,t,.5,'triangle',.18,sg,2200)},
  coin:t=>{tone(988,t,.07,'square',.12,sg);tone(1319,t+.07,.12,'square',.12,sg)},
  smash:t=>{noise(t,.18,.4,sg,700,'bandpass');tone(140,t,.12,'square',.15,sg,60)},
  mission:t=>[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.11,.28,'triangle',.35,sg)),
  win:t=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,t+i*.14,.3,'triangle',.4,sg))
 };
 function sfx(n){if(!ctx||!S[n])return;if(n==='coin'){if(ctx.currentTime-coinT<.05)return;coinT=ctx.currentTime}S[n](ctx.currentTime)}
 function setVol(k,v){vol[k]=v;apply()}
 return{init,music,sfx,setVol,vol};
})();
