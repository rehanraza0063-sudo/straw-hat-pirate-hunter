// Main loop, input, camera, rendering, game states
let lastT=0,pauseFrom=null;
function resetGame(){
 clearEnemies();resetPlayer();resetProps();
 G.score=0;G.coins.length=0;G.fx.length=0;G.parts.length=0;G.texts.length=0;G.waves.length=0;G.ghosts.length=0;
 G.ts=1;G.hitstop=0;G.winT=0;G.overT=0;G.shown=false;G.mt=0;G.camX=0;G.zoom=1;comboReset();UI.boss(null);
}
function beginGame(){
 SND.init();resetGame();G.state='play';UI.scr(null);UI.hud(true);startMissions();SND.music('explore');
}
function toMenu(){
 clearEnemies();resetPlayer();pl.x=4000;pl.y=548;pl.face=1;pl.inv=0;G.state='menu';G.ts=1;UI.boss(null);UI.hud(false);UI.scr('menu');SND.music('explore');
}
function pauseGame(){if(G.state!=='play')return;G.state='pause';UI.scr('pause')}
function resumeGame(){if(G.state!=='pause')return;G.state='play';UI.scr(null)}

// ---- input ----
const rect=()=>cv.getBoundingClientRect();
addEventListener('keydown',e=>{
 SND.init();K[e.code]=true;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(e.code==='Escape'){G.state==='play'?pauseGame():G.state==='pause'?resumeGame():0;return}
 if(e.code==='Space')playerJump();
 if(e.code==='KeyQ')playerDash();
 if(e.code==='KeyE')playerInteract();
});
addEventListener('keyup',e=>{K[e.code]=false});
addEventListener('blur',()=>{for(const k in K)K[k]=false;pauseGame()});
addEventListener('mousemove',e=>{const r=rect();M.x=(e.clientX-r.left)/r.width*W;M.y=(e.clientY-r.top)/r.height*H});
cv.addEventListener('mousedown',e=>{SND.init();const r=rect();M.x=(e.clientX-r.left)/r.width*W;M.y=(e.clientY-r.top)/r.height*H;
 if(e.button===0)pressAttack('atk');else if(e.button===2)pressAttack('sp');e.preventDefault()});
addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){SND.init();SND.sfx('click')}});
$('play').onclick=$('retry').onclick=$('again').onclick=beginGame;
$('how').onclick=()=>UI.scr('howS');$('set').onclick=()=>UI.scr('setS');
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>UI.scr('menu'));
document.querySelectorAll('.mm').forEach(b=>b.onclick=toMenu);
$('resume').onclick=resumeGame;
$('vm').oninput=e=>SND.setVol('music',+e.target.value);$('vs').oninput=e=>SND.setVol('sfx',+e.target.value);
addEventListener('resize',UI.fit);UI.fit();

// ---- update ----
function update(raw){
 G.time+=raw;
 if(G.state==='menu'){G.camX=3250+Math.sin(G.time*.25)*25;pl.s='idle';updateFx(raw);return}
 if(G.state==='pause')return;
 let dt=raw;
 if(G.hitstop>0){G.hitstop-=raw;dt=0}
 dt*=G.ts;
 if(G.state==='win'){G.winT+=raw;if(G.winT>1.3)G.ts=Math.min(1,G.ts+raw*.8);if(G.winT>2.6&&!G.shown){G.shown=true;UI.scr('win')}}
 if(G.state==='over'){G.overT+=raw;if(G.overT>1.6&&!G.shown){G.shown=true;UI.scr('over');SND.music('off')}}
 updatePlayer(dt);
 const f=updateEnemies(dt);updateFx(dt);
 if(G.state==='play')updateMissions();
 // music switching
 if(f.fight)G.mt=3;else G.mt-=raw;
 if(G.state==='play'||G.state==='over'){if(G.state==='play')SND.music(f.boss?'boss':(f.fight||G.mt>0)?'combat':'explore')}
 // HUD
 if(G.state==='play'){UI.bars(pl,G.score);UI.cd(pl.cd/6,pl.st>=25,pl.chain>=2)}
 // camera
 let tx=pl.x+pl.face*70;const b=G.enemies.find(e=>e.boss&&!e.dead);
 if(b&&Math.abs(b.x-pl.x)<1000)tx=(pl.x+b.x)/2;
 if(G.state==='win')tx=pl.x;
 const target=clamp(tx-W/2,0,WORLD-W);G.camX+=(target-G.camX)*Math.min(1,raw*5);
 const wantZoom=G.state==='win'?1.35:f.boss?1.0:f.fight?1.06:1;G.zoom+=(wantZoom-G.zoom)*Math.min(1,raw*2.5);
}

// ---- render ----
function render(raw){
 X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,W,H);X.save();
 const win=G.state==='win';
 let zx=W/2,zy=430;if(win){zx=pl.x-G.camX;zy=pl.y-90}
 X.translate(zx,zy);X.scale(G.zoom,G.zoom);X.translate(-zx,-zy);
 if(G.shake>0)X.translate((Math.random()-.5)*G.shake*22,(Math.random()-.5)*G.shake*22);
 drawWorld();
 if(G.state==='menu'){
  drawFighter({x:4010,y:552,z:0,face:1,s:1.55,pal:pl.pal,state:'idle',t:G.time,p:0,chain:0});
 }else{
  const L=[];
  for(const p of G.props)if(!p.broken)L.push([p.y,()=>drawProp(p)]);
  for(const e of G.enemies)L.push([e.y,()=>drawEnemy(e)]);
  for(const c of G.coins)L.push([c.y,()=>drawCoinsPickups(c)]);
  L.push([pl.y,drawPlayer]);
  L.sort((a,b)=>a[0]-b[0]);for(const it of L)it[1]();
  drawGhosts(G.state==='pause'?0:raw);
  drawWaves();drawFx();
  for(const e of G.enemies){drawEnemyBar(e);drawBossWarn(e)}
 }
 X.restore();
 // vignette
 const g=X.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,10,30,.35)');X.fillStyle=g;X.fillRect(0,0,W,H);
 // objective arrow
 if(G.state==='play'){const ox=objectiveX();let any=false;for(const e of G.enemies)if(e.aggro&&!e.dead)any=true;
  if(ox!==null&&!any&&ox-G.camX>W-90){const a=.6+.4*Math.sin(G.time*6);X.save();X.globalAlpha=a;X.fillStyle='#ffd54f';X.strokeStyle='#5d2e0c';X.lineWidth=5;X.font='bold 34px Trebuchet MS,sans-serif';X.textAlign='right';
   X.strokeText('GO ▶',W-26,H*.5);X.fillText('GO ▶',W-26,H*.5);X.restore()}}
 if(win){const h=Math.min(80,G.winT*110);X.fillStyle='#000';X.fillRect(0,0,W,h);X.fillRect(0,H-h,W,h)}
}
function loop(ts){
 requestAnimationFrame(loop);
 const raw=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;
 update(raw);render(raw);
}
// start on the menu: hero standing at the dock with the pirate ship behind
resetProps();pl.x=4000;pl.y=548;pl.face=1;G.camX=3250;
requestAnimationFrame(loop);
