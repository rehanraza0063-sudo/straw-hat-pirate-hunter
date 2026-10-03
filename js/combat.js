// Combat: hit detection, damage, particles, floating text, slash effects, special wave, pickups
function addPart(x,y,z,vx,vy,vz,col,life,size,grav){G.parts.push({x,y,z,vx,vy,vz,col,life,max:life,size,grav:grav===undefined?900:grav})}
function spark(x,y,z,col,n,sp){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=(.4+Math.random())*(sp||260);addPart(x,y,z,Math.cos(a)*s,(Math.random()-.5)*60,Math.sin(a)*s*.8+80,col,.35+Math.random()*.3,2+Math.random()*3.5)}}
function dust(x,y,n){for(let i=0;i<n;i++)addPart(x+(Math.random()-.5)*20,y,2,(Math.random()-.5)*120,0,30+Math.random()*60,'rgba(230,215,180,.8)',.4+Math.random()*.3,4+Math.random()*4,-20)}
function addText(x,y,txt,col,big){G.texts.push({x,y,txt,col,t:0,big})}
function shakeScreen(a){G.shake=Math.max(G.shake,a)}
function slashFx(x,y,z,face,big){G.fx.push({k:'arc',x,y,z,face,big,t:0,life:big?.3:.2})}
function ringFx(x,y,r,col,life){G.fx.push({k:'ring',x,y,r,col,t:0,life})}
function warnFx(x,y,r,life){G.fx.push({k:'warn',x,y,r,t:0,life})}
const cmb={n:0,t:0};
function comboHit(){cmb.n++;cmb.t=2.2;UI.combo(cmb.n)}
function comboReset(){if(cmb.n){cmb.n=0;UI.combo(0)}}

function spawnPickup(x,y,kind,n){for(let i=0;i<n;i++)G.coins.push({x:x+(Math.random()-.5)*20,y:y+(Math.random()-.5)*30,z:20,vz:300+Math.random()*250,vx:(Math.random()-.5)*220,vy:(Math.random()-.5)*60,t:0,kind})}

function breakProp(p){
 if(p.broken)return;p.broken=true;SND.sfx('smash');shakeScreen(.15);
 for(let i=0;i<14;i++)addPart(p.x,p.y,24,(Math.random()-.5)*380,(Math.random()-.5)*80,150+Math.random()*320,i%2?'#b8864b':'#7a5230',.7,3+Math.random()*4);
 spawnPickup(p.x,p.y,'coin',2+(Math.random()*3|0));
 if(p.k==='barrel'&&Math.random()<.55)spawnPickup(p.x,p.y,'heart',1);
}
function killEnemy(e){
 e.dead=true;e.s='dead';e.t=0;SND.sfx('die');
 spark(e.x,e.y,50,'#ffffff',16,360);spawnPickup(e.x,e.y,'coin',e.coins);
 if(!e.boss&&Math.random()<.25)spawnPickup(e.x,e.y,'heart',1);
 onKill(e);
}
function damageEnemy(e,dmg,dir,kb,big){
 if(e.dead)return;e.hp-=dmg;e.vx=dir*kb*(e.boss?.25:1);e.flash=.12;
 spark(e.x,e.y,55,big?'#ffb300':'#fff3b0',big?16:8,big?380:260);addText(e.x,e.y-110*e.s,dmg|0,big?'#ffb300':'#ffffff',big);
 SND.sfx(big?'heavy':'hit');comboHit();G.hitstop=big?.085:.045;shakeScreen(big?.4:.15);
 if(big)ringFx(e.x,e.y,140,'#ffcc33',.35);
 if(e.hp<=0)killEnemy(e);else if(!e.boss&&e.s!=='atk'){e.s='hurt';e.t=0}else if(!e.boss){e.s='hurt';e.t=0}
}
// area in front of (x,y)
function hitArea(x,y,face,range,depth,dmg,kb,big){
 let any=false;
 for(const e of G.enemies){if(e.dead)continue;const dx=(e.x-x)*face;if(dx>-24&&dx<range+e.r&&Math.abs(e.y-y)<depth+e.s*6){damageEnemy(e,dmg,face,kb,big);any=true}}
 for(const p of G.props){if(p.broken)continue;const dx=(p.x-x)*face;if(dx>-24&&dx<range+10&&Math.abs(p.y-y)<depth){breakProp(p);any=true}}
 return any;
}
function spawnWave(x,y,face){G.waves.push({x:x+face*40,y,face,t:0,hit:new Set()});SND.sfx('sp')}

function updateFx(dt){
 for(let i=G.parts.length-1;i>=0;i--){const p=G.parts[i];p.life-=dt;p.vz-=p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.7}if(p.life<=0)G.parts.splice(i,1)}
 for(let i=G.fx.length-1;i>=0;i--){G.fx[i].t+=dt;if(G.fx[i].t>=G.fx[i].life)G.fx.splice(i,1)}
 for(let i=G.texts.length-1;i>=0;i--){const t=G.texts[i];t.t+=dt;if(t.t>.8)G.texts.splice(i,1)}
 for(let i=G.waves.length-1;i>=0;i--){const w=G.waves[i];w.t+=dt;w.x+=w.face*820*dt;
  if(Math.random()<.9)addPart(w.x-w.face*20,w.y+(Math.random()-.5)*50,50+Math.random()*60,-w.face*60,0,0,'#9ff3ff',.3,3+Math.random()*3,0);
  for(const e of G.enemies){if(e.dead||w.hit.has(e))continue;if(Math.abs(e.x-w.x)<55&&Math.abs(e.y-w.y)<70){w.hit.add(e);damageEnemy(e,36,w.face,420,true)}}
  for(const p of G.props){if(p.broken)continue;if(Math.abs(p.x-w.x)<50&&Math.abs(p.y-w.y)<70)breakProp(p)}
  if(w.t>.85||w.x<0||w.x>WORLD)G.waves.splice(i,1)}
 for(let i=G.coins.length-1;i>=0;i--){const c=G.coins[i];c.t+=dt;c.vz-=1500*dt;c.x+=c.vx*dt;c.y=clamp(c.y+c.vy*dt,GY0+10,GY1);c.z+=c.vz*dt;if(c.z<0){c.z=0;c.vz*=-.45;c.vx*=.6;c.vy*=.6;if(Math.abs(c.vz)<80)c.vz=0}
  if(c.t>.4&&!pl.dead){const dx=pl.x-c.x,dy=pl.y-c.y,d=Math.hypot(dx,dy);
   if(d<150&&c.t>.7){c.x+=dx/d*420*dt;c.y+=dy/d*420*dt}
   if(d<42&&pl.z<60){G.coins.splice(i,1);if(c.kind==='heart'){pl.hp=Math.min(pl.max,pl.hp+15);addText(pl.x,pl.y-130,'+15 HP','#7dff8a');SND.sfx('mission')}else{G.score++;SND.sfx('coin')}}}
  else if(c.t>12)G.coins.splice(i,1)}
 G.shake=Math.max(0,G.shake-dt*1.4);
 cmb.t-=dt;if(cmb.t<=0&&cmb.n)comboReset();
}

// ---- drawing (world space, call inside camera transform) ----
function drawCoinsPickups(c){
 const x=c.x-G.camX,y=c.y-c.z;X.fillStyle='rgba(0,0,0,.25)';X.beginPath();X.ellipse(x,c.y,9,3,0,0,6.3);X.fill();
 if(c.kind==='heart'){const s=1+Math.sin(G.time*8)*.1;X.save();X.translate(x,y-12);X.scale(s,s);X.fillStyle='#ff4d6d';X.beginPath();X.moveTo(0,8);X.bezierCurveTo(-16,-4,-8,-16,0,-6);X.bezierCurveTo(8,-16,16,-4,0,8);X.fill();X.fillStyle='rgba(255,255,255,.6)';circ(-5,-6,2.5);X.fill();X.restore()}
 else{const sx=Math.abs(Math.cos(G.time*6+c.x));X.fillStyle='#ffc107';X.beginPath();X.ellipse(x,y-10,9*sx+1.5,9,0,0,6.3);X.fill();X.strokeStyle='#b8860b';X.lineWidth=2;X.stroke()}
}
function drawWaves(){
 for(const w of G.waves){const x=w.x-G.camX,y=w.y-60,f=w.face;X.save();X.shadowColor='#37e4ff';X.shadowBlur=24;X.fillStyle='rgba(150,245,255,.92)';
  X.beginPath();X.arc(x,y,70,f>0?-1.05:Math.PI-1.05,f>0?1.05:Math.PI+1.05);X.arc(x-f*22,y,58,f>0?1.05:Math.PI+1.05,f>0?-1.05:Math.PI-1.05,true);X.fill();
  X.fillStyle='rgba(255,255,255,.9)';X.beginPath();X.arc(x,y,62,f>0?-.7:Math.PI-.7,f>0?.7:Math.PI+.7);X.arc(x-f*10,y,56,f>0?.7:Math.PI+.7,f>0?-.7:Math.PI-.7,true);X.fill();X.restore()}
}
function drawFx(){
 for(const f of G.fx){const u=f.t/f.life,x=f.x-G.camX;
  if(f.k==='arc'){const y=f.y-f.z,r=f.big?100:70,a0=f.face>0?-1.15:Math.PI-1.15,sweep=Math.min(1,u*2.6)*2.3;X.save();X.lineCap='round';
   X.globalAlpha=1-u;X.strokeStyle=f.big?'#ffb300':'#ffffff';X.lineWidth=(f.big?18:11)*(1-u*.6);X.beginPath();X.arc(x-f.face*14,y,r,a0,a0+sweep);X.stroke();
   X.strokeStyle=f.big?'#fff2b0':'#9be7ff';X.lineWidth=(f.big?7:4);X.beginPath();X.arc(x-f.face*14,y,r-9,a0+.1,a0+sweep);X.stroke();X.restore()}
  else if(f.k==='ring'){X.save();X.globalAlpha=1-u;X.strokeStyle=f.col;X.lineWidth=8*(1-u)+1;X.beginPath();X.ellipse(x,f.y,f.r*u+10,(f.r*u+10)*.3,0,0,6.3);X.stroke();X.restore()}
  else if(f.k==='warn'){X.save();X.fillStyle='rgba(255,40,40,'+(.1+.28*u)+')';X.strokeStyle='rgba(255,70,70,.8)';X.lineWidth=4;X.beginPath();X.ellipse(x,f.y,f.r,f.r*.3,0,0,6.3);X.fill();X.stroke();X.restore()}
 }
 for(const p of G.parts){X.globalAlpha=clamp(p.life/p.max*1.6,0,1);X.fillStyle=p.col;circ(p.x-G.camX,p.y-p.z,p.size);X.fill()}
 X.globalAlpha=1;
 for(const t of G.texts){const u=t.t/.8;X.save();X.globalAlpha=1-u*u;X.font='bold '+(t.big?34:24)+'px Trebuchet MS,sans-serif';X.textAlign='center';X.lineWidth=5;X.strokeStyle='#000';X.fillStyle=t.col;
  const x=t.x-G.camX,y=t.y-u*50;X.strokeText(t.txt,x,y);X.fillText(t.txt,x,y);X.restore()}
}
