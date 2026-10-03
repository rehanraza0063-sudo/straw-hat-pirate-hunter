// Character renderer (hero + pirates share it) with procedural animation, and the hero's controls/combat
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return'rgb('+(r*f|0)+','+(g*f|0)+','+(b*f|0)+')'}
function limb(x,y,a,len,w,col){const nx=x+Math.sin(a)*len,ny=y+Math.cos(a)*len;X.strokeStyle=col;X.lineWidth=w;X.lineCap='round';X.beginPath();X.moveTo(x,y);X.lineTo(nx,ny);X.stroke();return[nx,ny]}

// angles: 0 = hanging down, + = swinging forward (toward facing direction)
function getPose(s,t,p,chain){
 const o={af:[.55,1.25],ab:[.2,1.0],lf:[.1,.1],lb:[-.12,.1],lean:0,bob:0,roll:0,dead:0,eyes:0,mouth:0};
 switch(s){
 case'idle':{const w=Math.sin(t*3);o.bob=w*1.2;o.af[0]=.55+w*.06;o.ab[0]=.2-w*.05;o.lean=.03+w*.012;break}
 case'walk':{const w=Math.sin(t*10);o.lf=[w*.7,Math.max(0,-w)*.8];o.lb=[-w*.7,Math.max(0,w)*.8];o.af=[-w*.6,.5];o.ab=[w*.6,.5];o.bob=Math.abs(Math.cos(t*10))*3;o.lean=.07;break}
 case'run':{const w=Math.sin(t*17);o.lf=[w*1.0,Math.max(0,-w)*1.25];o.lb=[-w*1.0,Math.max(0,w)*1.25];o.af=[-w*.9+.3,1.4];o.ab=[w*.9+.3,1.4];o.bob=Math.abs(Math.cos(t*17))*5;o.lean=.32;break}
 case'jump':o.af=[2.5,.4];o.ab=[1.9,.5];o.lf=[.8,1.0];o.lb=[-.35,.8];o.lean=.06;o.mouth=1;break;
 case'fall':o.af=[1.3,.3];o.ab=[-1.1,.3];o.lf=[.35,.3];o.lb=[-.45,.4];o.lean=-.05;o.mouth=1;break;
 case'atk':{const u=p<.3?-(p/.3)*.5:p<.55?-.5+1.5*((p-.3)/.25):Math.max(0,1-(p-.55)/.45),a=chain%2===0?'af':'ab',b=a==='af'?'ab':'af',pu=Math.max(0,u);
  o[a]=[.4+u*1.2,1.5-pu*1.4];o[b]=[.2,1.5];o.lean=.08+.3*pu;o.lf=[.5*pu+.1,.3];o.lb=[-.4*pu,.2];o.mouth=u>.3?1:0;break}
 case'heavy':{const wp=Math.min(1,p/.45),sl=p<.45?0:Math.min(1,(p-.45)/.2),rc=p<.65?0:(p-.65)/.35;
  const a=p<.45?.6+2.5*wp:3.1-2.0*sl+.9*rc;o.af=[a,.3];o.ab=[a-.25,.3];o.lean=p<.45?-.25*wp:-.25+.8*sl-.55*rc;o.bob=-7*sl;o.lf=[.5*sl+.1,.9*sl];o.lb=[-.5*sl,.8*sl];o.mouth=sl>0?1:0;break}
 case'slash':{const a=p<.62?.5+2.3*(p/.62):p<.82?2.8-2.0*((p-.62)/.2):.8-.3*((p-.82)/.18);o.af=[a,.25];o.ab=[.25,1.0];o.lean=p<.62?-.12:.32;o.lf=[p<.62?.1:.5,.3];o.lb=[p<.62?-.1:-.4,.2];o.mouth=p>.62?1:0;break}
 case'sp':{const q=p<.35?-(p/.35)*.9:-.9+2.45*Math.min(1,(p-.35)/.12);o.af=[q,.2];o.ab=[q-.15,.2];o.lean=p<.35?-.1:.28;o.lf=[.55,.3];o.lb=[-.5,.3];o.mouth=p>.35?1:0;break}
 case'hurt':o.lean=-.35;o.af=[-.5,.9];o.ab=[-.9,.9];o.lf=[.4,.3];o.lb=[-.3,.3];o.eyes=1;o.mouth=1;break;
 case'dodge':o.roll=p*Math.PI*2;o.af=[1.3,2.3];o.ab=[1.0,2.3];o.lf=[1.4,2.0];o.lb=[1.1,2.0];o.bob=Math.sin(p*Math.PI)*12;break;
 case'win':{const w=Math.sin(t*8);o.af=[2.2+w*.12,.15];o.ab=[-2.2-w*.12,-.15];o.bob=Math.abs(Math.sin(t*4.5))*16;o.mouth=1;o.lf=[.15+w*.1,.2];o.lb=[-.15-w*.1,.2];break}
 case'dead':{const q=Math.min(1,p*3),e=1-(1-q)*(1-q);o.dead=-1.5*e;o.af=[2.2,.3];o.ab=[2.7,.2];o.lf=[.3,.1];o.lb=[-.2,.1];o.eyes=2;o.mouth=1;break}
 }
 return o;
}

function drawEyes(pal,po){
 const ex=[8,16],ey=-103;X.lineCap='round';
 if(po.eyes===2){X.strokeStyle='#222';X.lineWidth=2;for(const x of ex){X.beginPath();X.moveTo(x-3,ey-3);X.lineTo(x+3,ey+3);X.moveTo(x+3,ey-3);X.lineTo(x-3,ey+3);X.stroke()}return}
 if(po.eyes===1){X.strokeStyle='#222';X.lineWidth=2.6;for(const x of ex){X.beginPath();X.arc(x,ey+1,3.2,Math.PI*1.05,Math.PI*1.95);X.stroke()}}
 else for(const x of ex){X.fillStyle='#fff';X.beginPath();X.ellipse(x,ey,3.7,4.9,0,0,6.3);X.fill();X.fillStyle='#1b1b1b';circ(x+1.3,ey+.4,2.7);X.fill();X.fillStyle='#fff';circ(x+2,ey-1,.9);X.fill()}
 // brows
 X.strokeStyle=pal.hairBrow||'#222';X.lineWidth=2.6;
 if(pal.angry){X.beginPath();X.moveTo(3,ey-10);X.lineTo(12,ey-6);X.moveTo(11,ey-6);X.lineTo(21,ey-9);X.stroke()}
 else{X.beginPath();X.moveTo(4,ey-8);X.lineTo(11,ey-9);X.moveTo(13,ey-9);X.lineTo(20,ey-8);X.stroke()}
}
function drawMouth(pal,po){
 if(po.mouth){X.fillStyle='#5a1414';X.beginPath();X.ellipse(13,-93,4.6,po.mouth?4:2,0,0,6.3);X.fill();X.fillStyle='#e8606a';X.beginPath();X.ellipse(13,-91.2,3,1.6,0,0,6.3);X.fill();if(pal.angry){X.fillStyle='#fff';X.fillRect(9,-96,8,2.5)}return}
 X.strokeStyle='#5a2a1a';X.lineWidth=2.2;X.beginPath();
 if(pal.angry){X.moveTo(7,-92);X.quadraticCurveTo(13,-90,19,-94)}else X.arc(12.5,-95.5,5,.2,Math.PI-.5);
 X.stroke();
}
function drawHair(pal){
 const h=pal.hair;
 if(pal.hairStyle==='spiky'){X.fillStyle=h;circ(-6,-101,15);X.fill();X.beginPath();X.moveTo(-14,-96);X.lineTo(-27,-92);X.lineTo(-17,-101);X.lineTo(-29,-103);X.lineTo(-16,-108);X.lineTo(-24,-113);X.lineTo(-8,-112);X.fill()}
 if(pal.hairStyle==='short'){X.fillStyle=h;circ(-4,-102,15.5);X.fill();X.beginPath();X.moveTo(-15,-96);X.lineTo(-24,-90);X.lineTo(-14,-90);X.fill()}
 if(pal.hairStyle==='braids'){X.fillStyle=h;circ(-5,-102,15);X.fill();for(const[bx,by,l]of[[-12,-98,0],[-8,-94,1]]){let x=bx,y=by;for(let i=0;i<6;i++){X.fillStyle=i%2?h:shade(h,1.5);X.beginPath();X.ellipse(x-i*2.2-l*3,y+i*4.2+Math.sin(G.time*3+i)*.6,3.6,3.4,0,0,6.3);X.fill()}}}
 if(pal.hairStyle==='beard'){X.fillStyle=h;circ(-5,-102,15.5);X.fill();X.beginPath();X.moveTo(-14,-96);X.lineTo(-26,-84);X.lineTo(-10,-86);X.fill()}
}
function drawHat(pal,po){
 const hat=pal.hat;
 if(pal.hairStyle==='spiky'){X.fillStyle=pal.hair;for(const x of[8,13,18]){X.beginPath();X.moveTo(x-3,-112);X.lineTo(x+1,-103);X.lineTo(x+4,-112);X.fill()}}
 if(hat==='straw'){
  X.strokeStyle='#d33a2c';X.lineWidth=2;X.beginPath();X.moveTo(6,-110);X.quadraticCurveTo(16,-96,19,-86);X.stroke();                // chin strap
  X.fillStyle='#f6d36c';X.strokeStyle='#c49a2e';X.lineWidth=2.5;X.beginPath();X.ellipse(3,-112,39,10,-.07,0,6.3);X.fill();X.stroke();
  X.fillStyle='rgba(120,80,10,.18)';X.beginPath();X.ellipse(3,-109,34,6,-.07,0,Math.PI);X.fill();
  X.fillStyle='#f9de83';X.beginPath();X.moveTo(-18,-114);X.quadraticCurveTo(-18,-143,3,-143);X.quadraticCurveTo(24,-143,24,-114);X.closePath();X.fill();X.stroke();
  X.fillStyle='#d6322e';X.beginPath();X.moveTo(-18.5,-114);X.lineTo(-18,-123);X.quadraticCurveTo(3,-118,24,-123);X.lineTo(24.5,-114);X.quadraticCurveTo(3,-109,-18.5,-114);X.fill();
  X.strokeStyle='rgba(176,130,30,.55)';X.lineWidth=1.3;for(let k=0;k<4;k++){X.beginPath();X.moveTo(-14+k*2,-125-k*5);X.quadraticCurveTo(3,-129-k*5.5,22-k*2,-125-k*5);X.stroke()}
  X.strokeStyle='rgba(176,130,30,.5)';for(let x=-30;x<=36;x+=8){X.beginPath();X.moveTo(x,-112+Math.abs(x-3)*.02);X.lineTo(x+3,-108.5);X.stroke()}
 }else if(hat==='tricorn'){
  X.fillStyle='#17171c';X.strokeStyle='#d9a82b';X.lineWidth=3;X.beginPath();X.moveTo(-34,-106);X.lineTo(-20,-134);X.lineTo(2,-121);X.lineTo(24,-134);X.lineTo(40,-107);X.quadraticCurveTo(3,-98,-34,-106);X.closePath();X.fill();X.stroke();
  X.fillStyle='#f4f0e6';circ(3,-114,5.5);X.fill();X.fillRect(0,-110,6,4);X.fillStyle='#17171c';circ(1,-115,1.4);X.fill();circ(5,-115,1.4);X.fill();
  X.strokeStyle='#f4f0e6';X.lineWidth=1.8;X.beginPath();X.moveTo(-5,-108);X.lineTo(11,-101);X.moveTo(11,-108);X.lineTo(-5,-101);X.stroke();
  if(pal.feather){X.strokeStyle='#e53935';X.lineWidth=7;X.beginPath();X.moveTo(-18,-128);X.quadraticCurveTo(-32,-146,-44,-136+Math.sin(G.time*3)*3);X.stroke();X.strokeStyle='#ff8a80';X.lineWidth=2.5;X.beginPath();X.moveTo(-20,-130);X.quadraticCurveTo(-32,-146,-43,-137+Math.sin(G.time*3)*3);X.stroke()}
 }else if(hat==='bandana'){
  X.fillStyle=pal.bandana;X.beginPath();X.arc(2,-101,18,Math.PI*1.0,Math.PI*2.0);X.quadraticCurveTo(10,-108,-16,-103);X.closePath();X.fill();
  X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=2;X.setLineDash([3,3]);X.beginPath();X.moveTo(-14,-108);X.quadraticCurveTo(2,-120,18,-109);X.stroke();X.setLineDash([]);
  const sw=Math.sin(G.time*7)*4;X.fillStyle=pal.bandana;circ(-16,-106,4.5);X.fill();X.beginPath();X.moveTo(-17,-106);X.lineTo(-34,-100+sw);X.lineTo(-30,-110+sw);X.closePath();X.fill();X.beginPath();X.moveTo(-17,-105);X.lineTo(-32,-92-sw);X.lineTo(-24,-100-sw);X.closePath();X.fill();
 }
}
function drawFace(pal,po){
 X.fillStyle=pal.skinD;X.fillRect(-3,-91,9,9);
 X.fillStyle=pal.skin;circ(2,-101,17);X.fill();
 X.fillStyle=pal.skinD;X.beginPath();X.ellipse(-9,-100,3.5,5,0,0,6.3);X.fill();
 X.fillStyle='rgba(255,120,120,.28)';circ(12,-95,4);X.fill();
 X.fillStyle=pal.skinD;circ(19.5,-99,2.6);X.fill();
 drawEyes(pal,po);drawMouth(pal,po);
 if(pal.scar){X.strokeStyle='#b4505a';X.lineWidth=2;X.beginPath();X.moveTo(9,-100);X.lineTo(17,-91);X.stroke();X.lineWidth=1;X.beginPath();X.moveTo(11,-98);X.lineTo(9,-95);X.moveTo(14,-95);X.lineTo(12,-92);X.stroke()}
 if(pal.patch&&po.eyes!==2){X.fillStyle='#0e0e12';X.beginPath();X.ellipse(16,-103,5.8,6.4,0,0,6.3);X.fill();X.strokeStyle='#0e0e12';X.lineWidth=2.2;X.beginPath();X.moveTo(11,-107);X.lineTo(-13,-112);X.moveTo(21,-100);X.lineTo(19,-96);X.stroke()}
 if(pal.mustache){X.fillStyle=pal.hair;X.beginPath();X.ellipse(15,-97.5,6.4,2.4,.15,0,6.3);X.fill()}
 if(pal.hairStyle==='beard'){X.fillStyle=pal.hair;X.beginPath();X.moveTo(-10,-98);X.quadraticCurveTo(-13,-78,6,-74);X.quadraticCurveTo(25,-79,20.5,-97);X.quadraticCurveTo(15,-90,10,-91.5);X.quadraticCurveTo(2,-88,-10,-98);X.fill();
  X.fillStyle='#fff';X.fillRect(8,-93,7,2.2);X.fillStyle=pal.hair;X.beginPath();X.ellipse(15,-98.5,7,2.6,.12,0,6.3);X.fill();X.fillStyle='#ffd54f';circ(-9,-92,2.4);X.fill()}
}
function drawTorso(pal){
 X.fillStyle=pal.shirt;rr(-14,-84,28,40,6);X.fill();
 if(pal.stripes){X.fillStyle='rgba(30,40,90,.5)';for(let y=-80;y<-48;y+=8)X.fillRect(-14,y,28,3)}
 if(pal.coat){X.fillStyle=pal.coat;X.beginPath();X.moveTo(-17,-84);X.lineTo(15,-84);X.lineTo(18,-44);X.lineTo(22,-26);X.lineTo(-22,-22);X.lineTo(-18,-44);X.closePath();X.fill();
  X.fillStyle=shade(pal.coat,.78);X.beginPath();X.moveTo(-18,-44);X.lineTo(-22,-22);X.lineTo(-6,-24);X.lineTo(-7,-44);X.fill();
  X.fillStyle=pal.shirt;X.beginPath();X.moveTo(-1,-84);X.lineTo(11,-84);X.lineTo(5,-62);X.closePath();X.fill();
  X.strokeStyle='#d9a82b';X.lineWidth=2.2;X.beginPath();X.moveTo(15,-84);X.lineTo(18,-44);X.lineTo(22,-26);X.moveTo(-17,-84);X.lineTo(-18,-44);X.lineTo(-22,-22);X.stroke();
  X.fillStyle='#ffd54f';for(const y of[-72,-62])circ(11,y,2.3),X.fill()}
 if(pal.vest){X.fillStyle=pal.vest;X.beginPath();X.moveTo(-14,-84);X.lineTo(-5,-84);X.lineTo(-3,-44);X.lineTo(-14,-44);X.fill();X.beginPath();X.moveTo(14,-84);X.lineTo(5,-84);X.lineTo(3,-44);X.lineTo(14,-44);X.fill();
  X.strokeStyle=shade(pal.vest,.7);X.lineWidth=2;X.beginPath();X.moveTo(-5,-84);X.lineTo(-3,-44);X.moveTo(5,-84);X.lineTo(3,-44);X.stroke()}
 X.fillStyle=pal.pants;X.fillRect(-15,-46,30,6);
 X.fillStyle=pal.belt;X.fillRect(-15,-52,30,7);X.fillStyle='#ffd54f';rr(pal.big?1:3,-53,pal.big?12:9,9,2);X.fill();
 if(pal.emblem){X.fillStyle='#ffc83d';X.strokeStyle='#b36b00';X.lineWidth=1.6;circ(6,-69,8.5);X.fill();X.stroke();X.fillStyle='#d6322e';X.beginPath();for(let k=0;k<10;k++){const r=k%2?2.6:6,a=-1.5708+k*.6283;X.lineTo(6+Math.cos(a)*r,-69+Math.sin(a)*r)}X.closePath();X.fill()}
 if(pal.epaulette){X.fillStyle='#ffd54f';X.beginPath();X.ellipse(-3,-84,9,4,0,0,6.3);X.fill();X.beginPath();X.ellipse(6,-84,9,4,0,0,6.3);X.fill()}
}
function drawArm(sx,sy,A,pal,back){
 const sl=back?shade(pal.sleeve||pal.skin,.78):(pal.sleeve||pal.skin);
 const e=limb(sx,sy,A[0],17,pal.armW||11,sl),h=limb(e[0],e[1],A[0]+A[1],16,pal.sleeve&&pal.cuffs?10:9.5,back?shade(pal.fore||pal.skin,.8):(pal.fore||pal.skin));
 if(pal.wrap){X.strokeStyle=pal.wrap;X.lineWidth=3.2;const mx=e[0]+(h[0]-e[0])*.55,my=e[1]+(h[1]-e[1])*.55;X.beginPath();X.arc(mx,my,5,0,6.3);X.stroke()}
 X.fillStyle=back?pal.skinD:pal.skin;circ(h[0],h[1],6.2);X.fill();
 return{x:h[0],y:h[1],a:A[0]+A[1]};
}
function drawLeg(hx,hy,L,pal,back){
 const col=back?pal.pantsD:pal.pants,bc=back?shade(pal.boots,.72):pal.boots;
 const k=limb(hx,hy,L[0],20,15,col),a=limb(k[0],k[1],L[0]-L[1],19,13,col);
 X.save();X.translate(a[0],a[1]);X.fillStyle=bc;rr(-6,-4,20,11,4);X.fill();X.fillStyle='rgba(0,0,0,.4)';X.fillRect(-6,3,20,3.5);if(pal.bootCuff){X.fillStyle=shade(bc,1.35);X.fillRect(-6,-9,13,6)}X.restore();
}
function drawCutlass(h){
 X.save();X.translate(h.x,h.y);X.rotate(-h.a+Math.PI);   // blade along forearm direction
 X.strokeStyle='#8d6e63';X.lineWidth=5;X.beginPath();X.moveTo(0,4);X.lineTo(0,-8);X.stroke();
 X.strokeStyle='#ffd54f';X.lineWidth=3.2;X.beginPath();X.moveTo(-8,-9);X.lineTo(8,-9);X.stroke();
 X.strokeStyle='#d9e3ea';X.lineWidth=6;X.beginPath();X.moveTo(0,-10);X.quadraticCurveTo(10,-34,-2,-58);X.stroke();
 X.strokeStyle='#ffffff';X.lineWidth=2;X.beginPath();X.moveTo(1,-12);X.quadraticCurveTo(10,-34,0,-55);X.stroke();X.restore();
}
function drawHook(h){X.save();X.translate(h.x,h.y);X.strokeStyle='#9aa4ab';X.lineWidth=4;X.beginPath();X.arc(0,8,8,-1.9,1.2);X.stroke();X.beginPath();X.moveTo(0,0);X.lineTo(0,3);X.stroke();X.restore()}

// o: {x,y,z,face,s,pal,state,t,p,chain,flash,alpha}
function drawFighter(o){
 const pal=o.pal,po=getPose(o.state,o.t,o.p||0,o.chain||0),sc=o.s||1,sx=o.x-G.camX,sy=o.y-(o.z||0);
 const al=o.alpha===undefined?1:o.alpha;if(al<=0)return;
 // ground shadow
 X.save();X.globalAlpha=.3*al*clamp(1-(o.z||0)/280,.25,1);X.fillStyle='#000';X.beginPath();X.ellipse(sx,o.y,30*sc,8.5*sc,0,0,6.3);X.fill();X.restore();
 X.save();X.globalAlpha=al;if(o.flash>0)X.filter='brightness(2.4) saturate(.4)';
 X.translate(sx,sy-po.bob*sc);X.scale(o.face*sc,sc);
 if(po.roll){X.translate(0,-50);X.rotate(po.roll);X.translate(0,50)}
 if(po.dead){X.rotate(po.dead);X.translate(0,-12)}
 const hipX=0,hipY=-46,wp=pal.weapon;
 drawLeg(-5,hipY,po.lb,pal,true);
 // back half (lean frame)
 X.save();X.translate(0,hipY);X.rotate(po.lean);X.translate(0,-hipY);
 const hb=drawArm(-4,-80,po.ab,pal,true);if(pal.hook)drawHook(hb);
 drawTorso(pal);
 X.restore();
 drawLeg(5,hipY,po.lf,pal,false);
 X.save();X.translate(0,hipY);X.rotate(po.lean);X.translate(0,-hipY);
 drawHair(pal);drawFace(pal,po);drawHat(pal,po);
 const hf=drawArm(4,-80,po.af,pal,false);if(wp)drawCutlass(hf);
 X.restore();
 X.restore();
}

// ================= HERO =================
const HERO_PAL={skin:'#f5c498',skinD:'#d9a273',hair:'#16161d',hairStyle:'spiky',shirt:'#fff3d6',vest:'#d6322e',pants:'#3a52b8',pantsD:'#2b3e90',boots:'#7a4a24',belt:'#5a3a1c',hat:'straw',emblem:true,wrap:'#ffffff',armW:11};
const pl={x:150,y:540,z:0,vz:0,kx:0,face:1,s:'idle',t:0,d:1,p:0,chain:0,ct:0,buf:false,hit:false,hp:100,max:100,st:100,cd:0,inv:0,dead:false,flash:0,run:false,minX:30,dashDir:1,dashDy:0,ghostT:0,pal:HERO_PAL};
const K={},M={x:640,y:360};

function resetPlayer(){Object.assign(pl,{x:150,y:540,z:0,vz:0,kx:0,face:1,s:'idle',t:0,chain:0,ct:0,buf:false,hit:false,hp:100,st:100,cd:0,inv:1,dead:false,flash:0,minX:30});G.ghosts.length=0}
function free(){return pl.s==='idle'||pl.s==='walk'||pl.s==='run'||pl.s==='jump'||pl.s==='fall'}
function faceMouse(){const wx=M.x+G.camX;if(Math.abs(wx-pl.x)>12)pl.face=wx>pl.x?1:-1}
function startAct(s){pl.s=s;pl.t=0;pl.hit=false;pl.buf=false;pl.d=s==='atk'?.3:s==='heavy'?.62:.55;faceMouse();if(s==='atk')SND.sfx('swing')}
function pressAttack(kind){
 if(pl.dead||G.state!=='play')return;
 if(kind==='sp'){if(pl.cd<=0&&(free()||pl.s==='atk'&&pl.t>pl.d*.6))startAct('sp');return}
 if(pl.s==='atk'||pl.s==='heavy'||pl.s==='sp'){pl.buf=true;return}
 if(!free())return;
 startAct(pl.chain>=2?'heavy':'atk');
}
function playerJump(){if(G.state!=='play'||pl.dead)return;if(free()&&pl.z===0){pl.vz=680;SND.sfx('jump');dust(pl.x,pl.y,6)}}
function playerDash(){
 if(G.state!=='play'||pl.dead||pl.st<25||!(free()||pl.s==='atk'||pl.s==='heavy'))return;
 pl.st-=25;pl.s='dash';pl.t=0;pl.d=.3;pl.inv=Math.max(pl.inv,.42);pl.buf=false;
 const ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),iy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);
 pl.dashDir=ix||(iy?0:pl.face);pl.dashDy=iy;if(ix)pl.face=ix;SND.sfx('dash');dust(pl.x,pl.y,8)
}
function playerInteract(){
 if(G.state!=='play'||pl.dead)return;let best=null,bd=130;
 for(const p of G.props){if(p.broken)continue;const d=Math.hypot(p.x-pl.x,(p.y-pl.y)*1.6);if(d<bd){bd=d;best=p}}
 if(best){pl.face=best.x>=pl.x?1:-1;breakProp(best)}
}
function hurtPlayer(dmg,fromX){
 if(pl.inv>0||pl.dead||G.state!=='play')return;
 pl.hp-=dmg;pl.inv=.75;pl.flash=.15;pl.kx=(pl.x>=fromX?1:-1)*330;pl.buf=false;pl.vz=Math.max(pl.vz,160);
 SND.sfx('hurt');UI.flash();shakeScreen(.4);spark(pl.x,pl.y,80,'#ff5252',10,300);addText(pl.x,pl.y-140,dmg|0,'#ff6b6b');comboReset();G.hitstop=.05;
 if(pl.hp<=0){pl.hp=0;pl.dead=true;pl.s='dead';pl.t=0;pl.d=9;G.state='over';G.overT=0;G.shown=false;SND.sfx('die')}
 else{pl.s='hurt';pl.t=0;pl.d=.34}
}
function updatePlayer(dt){
 const p=pl;p.t+=dt;p.cd=Math.max(0,p.cd-dt);p.inv=Math.max(0,p.inv-dt);p.flash=Math.max(0,p.flash-dt);
 if(p.ct>0)p.ct-=dt;else if(p.chain&&p.s!=='atk'&&p.s!=='heavy')p.chain=0;
 // gravity
 if(p.z>0||p.vz>0){p.vz-=1950*dt;p.z+=p.vz*dt;if(p.z<=0){p.z=0;p.vz=0;dust(p.x,p.y,6)}}
 if(p.dead){p.x+=p.kx*dt;p.kx*=Math.max(0,1-6*dt);p.x=clamp(p.x,20,WORLD-20);return}
 if(G.state==='win'){p.s='win';p.kx=0;p.z=0;return}
 const ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),iy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0),mv=ix||iy,l=Math.hypot(ix,iy)||1;
 let vx=0,vy=0;
 if(free()){
  const run=(K.ShiftLeft||K.ShiftRight)&&mv&&p.st>3&&p.z===0;p.run=run;const spd=run?400:240;
  p.st=run?Math.max(0,p.st-26*dt):Math.min(100,p.st+30*dt);
  vx=ix/l*spd;vy=iy/l*spd*.62;if(ix)p.face=ix;
  if(run&&Math.random()<.35)addPart(p.x-p.face*14,p.y,2,-p.face*50,0,40,'rgba(230,215,180,.7)',.35,3+Math.random()*3,-10);
 }else if(p.s==='dash'){vx=p.dashDir*860;vy=p.dashDy*420;p.ghostT-=dt;if(p.ghostT<=0){p.ghostT=.035;G.ghosts.push({x:p.x,y:p.y,z:p.z,face:p.face,life:.28,pr:p.t/p.d})}}
 else if(p.s==='atk'||p.s==='heavy'||p.s==='sp'){vx=p.face*(p.s==='heavy'?70:110)*(p.t<p.d*.5?1:.3);p.st=Math.min(100,p.st+10*dt)}
 else p.st=Math.min(100,p.st+10*dt);
 p.x=clamp(p.x+(vx+p.kx)*dt,p.minX,WORLD-30);p.y=clamp(p.y+vy*dt,GY0+28,GY1-8);p.kx*=Math.max(0,1-7*dt);
 if(free())p.s=p.z>0?(p.vz>0?'jump':'fall'):mv?(p.run?'run':'walk'):'idle';
 else if(p.t>=p.d){
  const was=p.s;if(was==='atk'){p.chain=(p.chain+1)%3;p.ct=.9}else if(was==='heavy')p.chain=0;
  p.s='idle';if(p.buf&&(was==='atk'||was==='heavy')){p.buf=false;startAct(p.chain>=2?'heavy':'atk')}
 }else if(!p.hit&&p.t>=p.d*(p.s==='sp'?.45:.35)&&(p.s==='atk'||p.s==='heavy'||p.s==='sp')){
  p.hit=true;
  if(p.s==='sp'){spawnWave(p.x,p.y,p.face);shakeScreen(.25)}
  else{const h=p.s==='heavy';slashFx(p.x+p.face*46,p.y,64,p.face,h);if(h){SND.sfx('swing');ringFx(p.x+p.face*70,p.y,120,'#ffd24a',.3)}
   if(hitArea(p.x,p.y,p.face,h?135:92,h?64:48,h?28:10+p.chain*3,h?560:230+p.chain*70,h))if(h)shakeScreen(.45)}
 }
}
function drawPlayer(){
 let al=1;if(pl.inv>0&&pl.s!=='dash'&&!pl.dead&&G.state==='play')al=.45+.55*Math.abs(Math.sin(G.time*40));
 drawFighter({x:pl.x,y:pl.y,z:pl.z,face:pl.face,s:1,pal:pl.pal,state:pl.s==='dash'?'dodge':pl.s,t:G.time,p:pl.s==='dead'?pl.t/1.0:pl.s==='dash'?pl.t/pl.d:Math.min(1,pl.t/pl.d),chain:pl.chain,flash:pl.flash,alpha:al});
}
function drawGhosts(dt){
 for(let i=G.ghosts.length-1;i>=0;i--){const g=G.ghosts[i];g.life-=dt;if(g.life<=0){G.ghosts.splice(i,1);continue}
  drawFighter({x:g.x,y:g.y,z:g.z,face:g.face,s:1,pal:pl.pal,state:'dodge',t:0,p:g.pr,alpha:g.life*1.1})}
}
