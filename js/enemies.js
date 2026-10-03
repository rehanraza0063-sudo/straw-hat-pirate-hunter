// Pirate enemies: Grunt, Fighter and the Pirate Captain (boss) with simple AI
const PAL_GRUNT={skin:'#e8b48a',skinD:'#c98f65',hair:'#d9731f',hairStyle:'short',shirt:'#f4f1e6',stripes:true,coat:'#9b2d2d',pants:'#45465f',pantsD:'#34354a',boots:'#2d1d12',belt:'#3a2615',hat:'tricorn',weapon:true,mustache:true,angry:true,sleeve:'#9b2d2d',armW:11};
const PAL_FIGHT={skin:'#d79b6c',skinD:'#b87e52',hair:'#2b1b12',hairStyle:'braids',shirt:'#2f6f9f',vest:'#1f7a4a',pants:'#232329',pantsD:'#18181c',boots:'#101010',belt:'#6b3b17',hat:'bandana',bandana:'#c62828',patch:true,scar:true,weapon:true,angry:true,wrap:'#e0b040',armW:12,bootCuff:true};
const PAL_CAPT={skin:'#cf9060',skinD:'#a8704a',hair:'#15110f',hairStyle:'beard',shirt:'#eee6cc',coat:'#7b1226',pants:'#17171b',pantsD:'#101013',boots:'#0c0c0c',belt:'#ffc107',big:true,hat:'tricorn',feather:true,patch:true,weapon:true,hook:true,epaulette:true,angry:true,sleeve:'#7b1226',cuffs:true,armW:13,bootCuff:true};
const ETYPES={
 grunt:{hp:42,spd:100,dmg:8,w:.55,range:92,coins:3,s:.98,pal:PAL_GRUNT,detect:430,cd:[.9,1.7]},
 fighter:{hp:72,spd:165,dmg:11,w:.34,range:96,coins:5,s:1.04,pal:PAL_FIGHT,detect:480,cd:[.5,1.1]},
 captain:{hp:460,spd:125,dmg:20,w:.6,range:150,coins:30,s:1.7,pal:PAL_CAPT,detect:2000,cd:[.6,1.3],boss:true}
};
function spawnEnemy(type,x,y,aggro){
 const d=ETYPES[type];
 G.enemies.push({type,boss:!!d.boss,hp:d.hp,max:d.hp,spd:d.spd,dmg:d.dmg,w:d.w,range:d.range,coins:d.coins,s:d.s,pal:d.pal,detect:d.detect,cdr:d.cd,
  x,y,vx:0,face:Math.random()<.5?1:-1,st:'idle',state:'idle',t:Math.random()*5,cool:.5+Math.random(),aggro:!!aggro,r:26*d.s,flash:0,alpha:1,dead:false,
  s2:'idle',k:'',dur:1,did:false,ad:0,idleT:1+Math.random()*2});
 const e=G.enemies[G.enemies.length-1];e.s_=e.s;return e;
}
// NOTE: e.s = scale, e.st = AI state ('idle','chase','atk','hurt','dead'), e.state = animation name
function startAtk(e,k,w,dmg){e.st='atk';e.k=k;e.w2=w;e.dur=w+.5;e.t=0;e.did=false;e.ad=dmg;if(k==='slam')warnFx(e.x,e.y,330,w)}
function pickBossAttack(e,ad){
 if(ad>420)startAtk(e,'dash',.55,22);
 else if(ad<190)Math.random()<.55?startAtk(e,'melee',.55,18):startAtk(e,'heavy',.95,32);
 else if(ad<330)startAtk(e,'slam',1.0,24);
 else startAtk(e,'dash',.55,22);
}
function updateEnemies(dt){
 let fight=false,boss=false,attackers=0;
 for(const e of G.enemies)if(e.st==='atk'&&!e.boss)attackers++;
 for(let i=G.enemies.length-1;i>=0;i--){
  const e=G.enemies[i];e.t+=dt;e.flash=Math.max(0,e.flash-dt);
  if(e.st==='dead'){e.x+=e.vx*dt;e.vx*=Math.max(0,1-6*dt);e.state='dead';if(e.t>1.5)e.alpha=Math.max(0,1-(e.t-1.5)/.7);if(e.t>2.3)G.enemies.splice(i,1);continue}
  const dx=pl.x-e.x,dy=pl.y-e.y,ad=Math.abs(dx);
  if(!e.aggro&&!pl.dead&&ad<e.detect&&Math.abs(dy)<220)e.aggro=true;
  if(e.aggro&&!pl.dead){fight=true;if(e.boss)boss=true}
  e.cool-=dt;let anim='idle',prog=0;
  if(e.st==='idle'){
   e.idleT-=dt;if(e.idleT<=0){e.face=-e.face;e.idleT=1.5+Math.random()*2.5}
   if(e.aggro&&!pl.dead){e.st='chase'}
  }else if(e.st==='chase'){
   if(pl.dead){e.st='idle'}
   else{
    e.face=dx>=0?1:-1;
    const hold=!e.boss&&attackers>=2&&ad<190;
    if(hold){anim='walk';if(ad<150)e.x-=e.face*e.spd*.5*dt}
    else{
     const stop=e.boss?e.range*.7:e.range*.75;
     if(ad>stop){e.x+=e.face*e.spd*dt;anim=e.type==='fighter'?'run':'walk'}
     if(Math.abs(dy)>14){e.y+=Math.sign(dy)*e.spd*.7*dt;anim=anim==='idle'?'walk':anim}
    }
    if(e.cool<=0&&!hold){
     if(e.boss)pickBossAttack(e,ad);
     else if(ad<e.range&&Math.abs(dy)<28){startAtk(e,'melee',e.w,e.dmg);attackers++}
    }
   }
  }else if(e.st==='atk'){
   if(e.t<e.w2*.6&&e.k!=='slam'&&e.k!=='dash')e.face=dx>=0?1:-1;
   if(e.k==='dash'&&e.t>=e.w2&&e.t<e.w2+.4){e.x+=e.face*900*dt;if(!e.did&&Math.abs(pl.x-e.x)<85&&Math.abs(pl.y-e.y)<36&&pl.z<60){e.did=true;hurtPlayer(e.ad,e.x);shakeScreen(.4)}}
   else if(!e.did&&e.t>=e.w2&&e.k!=='dash'){
    e.did=true;SND.sfx(e.boss?'batk':'swing');
    if(e.k==='slam'){ringFx(e.x,e.y,330,'#ffcc33',.45);shakeScreen(.8);SND.sfx('slam');dust(e.x,e.y,16);
     if(pl.z<45&&Math.pow((pl.x-e.x)/330,2)+Math.pow((pl.y-e.y)/99,2)<1)hurtPlayer(e.ad,e.x)}
    else{const r=e.range+(e.k==='heavy'?36:0),dd=(pl.x-e.x)*e.face;
     if(dd>-20&&dd<r&&Math.abs(pl.y-e.y)<(e.boss?44:34)&&pl.z<70)hurtPlayer(e.ad,e.x);
     if(e.boss&&e.k==='heavy'){shakeScreen(.5);ringFx(e.x+e.face*90,e.y,110,'#ff8a4a',.3)}}
    if(!e.boss)slashFx(e.x+e.face*50,e.y,70,e.face,false)
   }
   anim=e.k==='melee'?'slash':e.k==='dash'?'run':'heavy';prog=Math.min(1,e.t/e.dur);
   if(e.k==='dash'&&e.t<e.w2){anim='slash';prog=.3*(e.t/e.w2)}
   if(e.t>=e.dur){e.st='chase';e.cool=e.cdr[0]+Math.random()*(e.cdr[1]-e.cdr[0])}
  }else if(e.st==='hurt'){anim='hurt';if(e.t>.36)e.st='chase'}
  e.x=clamp(e.x+e.vx*dt,20,WORLD-20);e.vx*=Math.max(0,1-8*dt);e.y=clamp(e.y,GY0+28,GY1-8);
  e.state=anim;e.p=prog;
 }
 // keep pirates from stacking on each other
 for(let a=0;a<G.enemies.length;a++)for(let b=a+1;b<G.enemies.length;b++){const A=G.enemies[a],B=G.enemies[b];if(A.dead||B.dead)continue;
  const dx=B.x-A.x,dy=B.y-A.y;if(Math.abs(dx)<46&&Math.abs(dy)<20){const px=(dx>=0?1:-1)*40*dt,py=(dy>=0?1:-1)*30*dt;A.x-=px;B.x+=px;A.y-=py;B.y+=py}}
 return{fight,boss};
}
function drawEnemy(e){drawFighter({x:e.x,y:e.y,z:0,face:e.face,s:e.s,pal:e.pal,state:e.state,t:G.time+e.x*.01,p:e.st==='dead'?e.t/1.0:e.p||0,chain:0,flash:e.flash,alpha:e.alpha})}
function drawEnemyBar(e){
 if(e.dead||e.boss)return;const x=e.x-G.camX,y=e.y-125*e.s;
 X.fillStyle='rgba(0,0,0,.65)';rr(x-30,y-6,60,10,5);X.fill();X.fillStyle=e.hp/e.max>.4?'#ff5a4d':'#ff9f1a';rr(x-28,y-4,56*clamp(e.hp/e.max,0,1),6,3);X.fill();
 if(e.st==='atk'&&e.t<e.w2){X.fillStyle='#ff3b30';X.font='bold 34px Trebuchet MS,sans-serif';X.textAlign='center';X.lineWidth=5;X.strokeStyle='#fff';X.strokeText('!',x,y-14);X.fillText('!',x,y-14)}
}
function drawBossWarn(e){
 if(e.dead||!e.boss||e.st!=='atk'||e.t>=e.w2)return;const x=e.x-G.camX,y=e.y-210;
 X.fillStyle='#ff3b30';X.font='bold 48px Trebuchet MS,sans-serif';X.textAlign='center';X.lineWidth=6;X.strokeStyle='#fff';X.strokeText('!',x,y);X.fillText('!',x,y);
}
function clearEnemies(){G.enemies.length=0}
