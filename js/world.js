// World: constants, shared state, and the whole island background (all drawn with canvas shapes)
const W=1280,H=720,WORLD=4600,GY0=400,GY1=650;   // GY0..GY1 = walkable depth band
const G={state:'menu',score:0,time:0,camX:0,zoom:1,shake:0,hitstop:0,ts:1,props:[],coins:[],enemies:[],fx:[],parts:[],texts:[],waves:[],ghosts:[],mt:0,overT:0,winT:0,shown:false};
const cv=document.getElementById('c'),X=cv.getContext('2d');
const fr=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rr(x,y,w,h,r){X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function circ(x,y,r){X.beginPath();X.arc(x,y,r,0,6.2832)}

const CLOUDS=Array.from({length:9},(_,i)=>({x:fr(i)*2000,y:35+fr(i+9)*160,s:.7+fr(i+3)*.9,v:5+fr(i+5)*9}));
const HOUSES=[
 {x:1680,w:240,h:170,c:'#ecd9ab',roof:'#c0392b',smoke:1},{x:1990,w:200,h:150,c:'#d9c79c',roof:'#2e6da4'},
 {x:2270,w:260,h:195,c:'#efe0b8',roof:'#8e44ad',smoke:1},{x:2610,w:210,h:160,c:'#d8c598',roof:'#c0392b'},
 {x:2900,w:240,h:185,c:'#ecd9ab',roof:'#27816b',smoke:1},{x:3190,w:180,h:145,c:'#d9c79c',roof:'#d35400'}];
const PALMS=[[90,412,1.1],[330,418,.9],[640,410,1.2],[930,416,1],[1250,412,1.15],[1450,418,.95],[3440,408,1.1],[4570,408,1.2]];
const ROCKS=[[260,438,1],[880,442,1.3],[1180,436,.9],[1610,438,1],[3090,438,1.1],[3420,446,.8]];

function resetProps(){
 const L=[[560,540,'crate'],[700,470,'barrel'],[1250,600,'crate'],[1500,480,'barrel'],[1900,500,'barrel'],[2150,610,'crate'],[2700,470,'crate'],[3000,590,'barrel'],[3520,480,'barrel'],[3620,610,'crate'],[3800,450,'crate'],[820,610,'barrel']];
 G.props=L.map(([x,y,k])=>({x,y,k,broken:false,wob:0}));
}

// ---------- sky / sea ----------
function drawSky(){
 let g=X.createLinearGradient(0,0,0,300);g.addColorStop(0,'#3f9ff0');g.addColorStop(1,'#c4ebff');X.fillStyle=g;X.fillRect(0,0,W,300);
 const sx=1000-G.camX*.03;g=X.createRadialGradient(sx,115,10,sx,115,190);g.addColorStop(0,'rgba(255,252,210,1)');g.addColorStop(.3,'rgba(255,240,170,.55)');g.addColorStop(1,'rgba(255,240,170,0)');
 X.fillStyle=g;X.fillRect(sx-200,0,400,320);X.fillStyle='#fff8c8';circ(sx,115,34);X.fill();
 for(const c of CLOUDS){const m=W+500,x=((c.x+G.time*c.v-G.camX*.12)%m+m)%m-250,y=c.y,s=c.s;
  X.fillStyle='rgba(255,255,255,.93)';for(const[dx,dy,r]of[[0,0,26],[30,-12,32],[66,-4,28],[96,4,22],[-28,6,20]]){circ(x+dx*s,y+dy*s,r*s);X.fill()}
  X.fillStyle='rgba(190,215,240,.5)';X.fillRect(x-48*s,y+16*s,150*s,6*s)}
 // seagulls
 X.strokeStyle='#34495e';X.lineWidth=2.5;X.lineCap='round';
 for(let i=0;i<4;i++){const m=W+400,x=((i*430+G.time*(26+i*6)-G.camX*.2)%m+m)%m-200,y=110+i*38+Math.sin(G.time*.8+i)*14,f=Math.sin(G.time*7+i*2)*7;
  X.beginPath();X.moveTo(x-14,y+f);X.quadraticCurveTo(x-6,y-5,x,y);X.quadraticCurveTo(x+6,y-5,x+14,y+f);X.stroke()}
}
function drawSea(){
 let g=X.createLinearGradient(0,258,0,430);g.addColorStop(0,'#62c6f2');g.addColorStop(1,'#1b78c0');X.fillStyle=g;X.fillRect(0,258,W,175);
 // far islands (parallax)
 for(const b of[260,1250,2250]){const sx=b-G.camX*.22;if(sx<-260||sx>W+260)continue;
  X.fillStyle='#6aa89a';X.beginPath();X.moveTo(sx-190,264);X.quadraticCurveTo(sx-90,212,sx,222);X.quadraticCurveTo(sx+100,200,sx+200,264);X.closePath();X.fill();
  X.fillStyle='#4f8f80';X.beginPath();X.moveTo(sx-60,264);X.quadraticCurveTo(sx+10,232,sx+110,264);X.closePath();X.fill();
  X.strokeStyle='#3a6d62';X.lineWidth=3;X.beginPath();X.moveTo(sx+40,228);X.lineTo(sx+46,204);X.stroke();X.beginPath();X.moveTo(sx+46,204);X.quadraticCurveTo(sx+60,198,sx+68,206);X.moveTo(sx+46,204);X.quadraticCurveTo(sx+32,196,sx+22,206);X.stroke()}
 X.fillStyle='rgba(255,255,255,.35)';X.fillRect(0,260,W,3);
 X.lineWidth=2;
 for(let k=0;k<7;k++){const y=278+k*20;X.strokeStyle='rgba(255,255,255,'+(.12+k*.035)+')';X.beginPath();
  for(let x=0;x<=W;x+=16){const wx=x+G.camX*(.6+k*.07),yy=y+Math.sin(wx*.03+G.time*(1.2+k*.15)+k)*(2+k*.5);x?X.lineTo(x,yy):X.moveTo(x,yy)}X.stroke()}
 // sun glitter
 const gx=1000-G.camX*.03;X.fillStyle='rgba(255,255,220,.5)';
 for(let i=0;i<14;i++){const y=268+i*10,w=10+fr(i)*40+Math.sin(G.time*3+i)*8;X.fillRect(gx-w/2+Math.sin(G.time*2+i*3)*10,y,w,2)}
}

// ---------- pirate ship (background, moored by the dock) ----------
function drawShip(wx){
 const cx=wx-G.camX;if(cx<-520||cx>W+520)return;
 const bob=Math.sin(G.time*1.2)*4,rot=Math.sin(G.time*.9)*.012;
 X.save();X.translate(cx,396+bob);X.rotate(rot);
 // masts + sails behind hull
 X.fillStyle='#4a2e14';for(const[mx,top]of[[-215,-285],[-30,-335],[175,-265]])X.fillRect(mx-6,top,12,top*-1-60);
 const sail=(x0,y0,x1,y1,bulge)=>{X.fillStyle='#f6edd3';X.strokeStyle='#cdbf98';X.lineWidth=2;X.beginPath();X.moveTo(x0,y0);X.quadraticCurveTo((x0+x1)/2+bulge,y0+8,x1,y0);X.lineTo(x1,y1);X.quadraticCurveTo((x0+x1)/2+bulge,y1+14,x0,y1);X.closePath();X.fill();X.stroke();
  X.strokeStyle='rgba(0,0,0,.12)';X.beginPath();X.moveTo((x0+x1)/2+bulge*.5,y0+4);X.lineTo((x0+x1)/2+bulge*.5,y1+8);X.stroke()};
 sail(-125,-320,65,-215,26);sail(-110,-205,50,-120,22);sail(-285,-270,-150,-170,-18);sail(-270,-160,-160,-110,-14);
 X.fillStyle='#f6edd3';X.strokeStyle='#cdbf98';X.beginPath();X.moveTo(180,-250);X.lineTo(300,-135);X.lineTo(180,-125);X.closePath();X.fill();X.stroke();
 // skull on main sail
 X.fillStyle='#1b1b1f';circ(-30,-265,20);X.fill();X.fillRect(-40,-250,20,14);X.fillStyle='#f6edd3';circ(-37,-268,5);X.fill();circ(-23,-268,5);X.fill();X.fillRect(-32,-248,3,8);X.fillRect(-26,-248,3,8);
 X.strokeStyle='#1b1b1f';X.lineWidth=5;X.beginPath();X.moveTo(-52,-232);X.lineTo(-8,-238);X.moveTo(-52,-238);X.lineTo(-8,-232);X.stroke();
 // patches
 X.fillStyle='#c9a86a';X.fillRect(-90,-175,26,20);X.fillStyle='#d9534f';X.fillRect(10,-160,22,18);
 // flag
 const fw=Math.sin(G.time*5)*5;X.fillStyle='#17171c';X.beginPath();X.moveTo(-30,-335);X.quadraticCurveTo(-4,-347+fw,26,-335);X.quadraticCurveTo(0,-326-fw,-30,-321);X.closePath();X.fill();X.fillStyle='#f6edd3';circ(-14,-333,3.5);X.fill();
 // crow's nests + rigging
 X.fillStyle='#5b3a1c';X.fillRect(-42,-338,24,10);X.fillRect(-227,-290,24,9);X.fillRect(163,-270,24,9);
 X.strokeStyle='rgba(40,25,10,.7)';X.lineWidth=1.5;X.beginPath();X.moveTo(-30,-330);X.lineTo(-380,-98);X.moveTo(-30,-330);X.lineTo(180,-168);X.moveTo(-215,-282);X.lineTo(-385,-100);X.moveTo(175,-262);X.lineTo(400,-110);X.stroke();
 // hull
 let g=X.createLinearGradient(0,-120,0,30);g.addColorStop(0,'#7b4a28');g.addColorStop(1,'#4d2c15');X.fillStyle=g;
 X.beginPath();X.moveTo(-392,-104);X.quadraticCurveTo(-372,0,-250,30);X.lineTo(260,30);X.quadraticCurveTo(385,0,412,-124);X.lineTo(250,-104);X.lineTo(-300,-104);X.closePath();X.fill();
 X.strokeStyle='rgba(30,15,5,.55)';X.lineWidth=2;for(const y of[-78,-52,-26,0]){X.beginPath();X.moveTo(-370+Math.abs(y)*.2,y);X.lineTo(390-Math.abs(y)*.2,y);X.stroke()}
 X.fillStyle='#e0b040';X.fillRect(-392,-104,804,7);X.fillRect(-380,-60,780,3);
 X.fillStyle='#352010';for(let i=-3;i<=3;i++){X.fillRect(i*90-12,-92,24,18);}
 X.fillStyle='#202020';for(let i=-3;i<=3;i++){circ(i*90,-82,5);X.fill()}
 // forecastle + stern castle
 X.fillStyle='#6a3f20';X.fillRect(-392,-150,95,50);X.fillRect(235,-182,177,82);X.fillStyle='#8a5530';X.fillRect(-392,-154,95,6);X.fillRect(235,-186,177,6);
 X.fillStyle='#ffd66b';for(const wx of[262,312,362]){rr(wx,-166,28,30,6);X.fill();X.fillStyle='rgba(0,0,0,.25)';X.fillRect(wx+13,-166,3,30);X.fillStyle='#ffd66b'}
 X.strokeStyle='#8a5530';X.lineWidth=3;X.beginPath();for(let x=-390;x<=-300;x+=18){X.moveTo(x,-154);X.lineTo(x,-176)}X.moveTo(-392,-176);X.lineTo(-300,-176);X.stroke();
 // foam
 X.fillStyle='rgba(255,255,255,.55)';for(let x=-380;x<=400;x+=26){X.beginPath();X.ellipse(x+Math.sin(G.time*2+x)*5,28,16,4,0,0,6.3);X.fill()}
 X.restore();
}

// ---------- decor ----------
function palm(wx,by,s){
 const x=wx-G.camX;if(x<-200||x>W+200)return;const sw=Math.sin(G.time*1.4+wx)*3*s;
 X.save();X.translate(x,by);X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.ellipse(10*s,2,34*s,8*s,0,0,6.3);X.fill();
 const tx=16*s+sw*.4,ty=-140*s;X.lineCap='round';X.strokeStyle='#7a5230';X.lineWidth=12*s;X.beginPath();X.moveTo(0,0);X.quadraticCurveTo(-10*s,ty*.5,tx,ty);X.stroke();
 X.strokeStyle='#a2744a';X.lineWidth=4*s;X.beginPath();X.moveTo(-3*s,0);X.quadraticCurveTo(-13*s,ty*.5,tx-3*s,ty);X.stroke();
 const A=[-2.9,-2.35,-1.85,-1.25,-.75,-.25,.2];
 A.forEach((a,k)=>{const ex=tx+Math.cos(a)*92*s+sw,ey=ty+Math.sin(a)*38*s+38*s*Math.abs(Math.cos(a)),cx2=tx+Math.cos(a)*48*s,cy2=ty+Math.sin(a)*58*s-8*s;
  X.fillStyle=k%2?'#2f9440':'#3fae4b';X.beginPath();X.moveTo(tx,ty);X.quadraticCurveTo(cx2,cy2,ex,ey);X.quadraticCurveTo(cx2+4,cy2+16*s,tx,ty+4);X.fill()});
 X.fillStyle='#5b3a1c';for(const d of[-6,5])circ(tx+d*s,ty+8*s,6*s),X.fill();
 X.restore();
}
function rock(wx,by,s){const x=wx-G.camX;if(x<-80||x>W+80)return;X.save();X.translate(x,by);X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.ellipse(0,2,32*s,7*s,0,0,6.3);X.fill();
 X.fillStyle='#8f969c';X.beginPath();X.moveTo(-28*s,0);X.lineTo(-22*s,-18*s);X.lineTo(-6*s,-28*s);X.lineTo(16*s,-22*s);X.lineTo(30*s,-4*s);X.lineTo(26*s,0);X.closePath();X.fill();
 X.fillStyle='#b7bec4';X.beginPath();X.moveTo(-22*s,-18*s);X.lineTo(-6*s,-28*s);X.lineTo(6*s,-20*s);X.lineTo(-10*s,-12*s);X.closePath();X.fill();X.restore()}
function house(h){
 const x=h.x-G.camX;if(x<-320||x>W+100)return;const by=424,top=by-h.h,peak=top-h.h*.5;
 X.fillStyle='rgba(0,0,0,.22)';X.beginPath();X.ellipse(x+h.w/2,by+4,h.w*.62,11,0,0,6.3);X.fill();
 // smoke
 if(h.smoke){const px=x+h.w*.74,pyy=peak+(top+6-peak)*((h.w*.74-h.w/2)/(h.w/2+18));
  X.fillStyle='#8c5a3c';X.fillRect(px-9,pyy-34,18,40);X.fillStyle='#6d4430';X.fillRect(px-11,pyy-38,22,7);
  for(let k=0;k<5;k++){const u=((G.time*.35+k*.2)%1);X.fillStyle='rgba(70,70,75,'+(.5*(1-u))+')';circ(px+u*40+Math.sin(u*6+k)*8,pyy-44-u*110,10+u*26);X.fill()}}
 X.fillStyle=h.c;X.fillRect(x,top,h.w,h.h);
 X.fillStyle='rgba(0,0,0,.07)';for(let y=top+14;y<by;y+=16)X.fillRect(x,y,h.w,2);
 X.fillStyle='#8a5a35';X.fillRect(x,top,7,h.h);X.fillRect(x+h.w-7,top,7,h.h);X.fillRect(x,by-14,h.w,14);X.fillRect(x,top+h.h*.45,h.w,6);
 X.fillStyle=h.roof;X.beginPath();X.moveTo(x-20,top+8);X.lineTo(x+h.w/2,peak);X.lineTo(x+h.w+20,top+8);X.closePath();X.fill();
 X.strokeStyle='rgba(0,0,0,.2)';X.lineWidth=2;for(let k=1;k<4;k++){const t=k/4;X.beginPath();X.moveTo(x-20+20*t+ (h.w/2+20)*0,top+8-(top+8-peak)*t);X.lineTo(x+h.w+20-20*t,top+8-(top+8-peak)*t);X.stroke()}
 X.fillStyle='rgba(0,0,0,.18)';X.beginPath();X.moveTo(x-20,top+8);X.lineTo(x+h.w+20,top+8);X.lineTo(x+h.w+20,top+16);X.lineTo(x-20,top+16);X.fill();
 // door
 const dw=36,dh=66,dx=x+h.w/2-dw/2;X.fillStyle='#5a3418';rr(dx,by-dh,dw,dh+2,10);X.fill();X.fillStyle='#e0b040';circ(dx+dw-9,by-30,3);X.fill();
 // windows
 for(const f of[.16,.72]){const wx=x+h.w*f,wy=top+h.h*.12,ww=h.w*.12+14,wh=40;X.fillStyle='#ffe38a';rr(wx,wy,ww,wh,5);X.fill();X.strokeStyle='#6b4326';X.lineWidth=4;X.stroke();X.beginPath();X.moveTo(wx+ww/2,wy);X.lineTo(wx+ww/2,wy+wh);X.moveTo(wx,wy+wh/2);X.lineTo(wx+ww,wy+wh/2);X.stroke();
  X.fillStyle='#4f8f45';X.fillRect(wx-4,wy+wh+2,ww+8,8);X.fillStyle='#e57373';for(let k=0;k<3;k++){circ(wx+6+k*(ww/3),wy+wh+1,4);X.fill()}}
 if(h.smoke){X.fillStyle='rgba(30,20,10,.28)';circ(x+h.w*.4,top+h.h*.25,18);X.fill()}
}
function fence(){
 const x0=Math.floor((G.camX-40)/24)*24;X.fillStyle='#f4efe2';X.strokeStyle='#cbbf9f';X.lineWidth=1.5;
 for(let wx=x0;wx<G.camX+W+40;wx+=24){if(wx<1560||wx>3400)continue;
  let gap=false;for(const h of HOUSES)if(Math.abs(wx-(h.x+h.w/2))<44)gap=true;if(gap)continue;
  const x=wx-G.camX;X.beginPath();X.moveTo(x,444);X.lineTo(x,426);X.lineTo(x+5,420);X.lineTo(x+10,426);X.lineTo(x+10,444);X.closePath();X.fill();X.stroke()}
 X.fillStyle='#d9ceb0';for(const y of[428,438]){X.fillRect(Math.max(0,1560-G.camX),y,Math.min(W,3400-G.camX)-Math.max(0,1560-G.camX),3)}
}
function lamp(wx){const x=wx-G.camX;if(x<-40||x>W+40)return;X.fillStyle='#3a3a40';X.fillRect(x-3,340,6,90);X.fillStyle='#ffd966';rr(x-9,324,18,22,4);X.fill();X.fillStyle='rgba(255,220,120,.18)';circ(x,336,34);X.fill()}
function torch(wx){const x=wx-G.camX;if(x<-60||x>W+60)return;
 X.fillStyle='#4a2e14';X.fillRect(x-4,350,8,58);X.fillStyle='#6a4a2a';X.fillRect(x-8,344,16,10);
 const f=Math.sin(G.time*14+wx)*2;let g=X.createRadialGradient(x,336,2,x,336,70);g.addColorStop(0,'rgba(255,190,80,.45)');g.addColorStop(1,'rgba(255,150,40,0)');X.fillStyle=g;X.fillRect(x-70,266,140,140);
 X.fillStyle='#ff8a1f';X.beginPath();X.moveTo(x-9,346);X.quadraticCurveTo(x-12+f,326,x,308+f);X.quadraticCurveTo(x+12-f,326,x+9,346);X.fill();
 X.fillStyle='#ffe066';X.beginPath();X.moveTo(x-5,346);X.quadraticCurveTo(x-6,334,x,324+f);X.quadraticCurveTo(x+6,334,x+5,346);X.fill()}
function crateStack(wx,by){const x=wx-G.camX;if(x<-80||x>W+80)return;
 const c=(cx,cy,s)=>{X.fillStyle='#b8864b';X.fillRect(cx,cy,s,s);X.strokeStyle='#6d4a22';X.lineWidth=3;X.strokeRect(cx+1.5,cy+1.5,s-3,s-3);X.beginPath();X.moveTo(cx,cy);X.lineTo(cx+s,cy+s);X.moveTo(cx+s,cy);X.lineTo(cx,cy+s);X.stroke()};
 X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.ellipse(x+34,by+2,60,8,0,0,6.3);X.fill();c(x,by-44,44);c(x+46,by-44,44);c(x+22,by-88,44)}
function bush(wx,by,s){const x=wx-G.camX;if(x<-60||x>W+60)return;X.fillStyle='#3f9a46';for(const[dx,dy,r]of[[0,-12,16],[16,-8,13],[-16,-6,12]]){circ(x+dx*s,by+dy*s,r*s);X.fill()}X.fillStyle='#e57373';circ(x+4*s,by-16*s,2.5*s);X.fill();circ(x-9*s,by-9*s,2.5*s);X.fill()}
function tree(wx,by,s){const x=wx-G.camX;if(x<-100||x>W+100)return;X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.ellipse(x,by+2,34*s,7*s,0,0,6.3);X.fill();X.fillStyle='#6d4a2a';X.fillRect(x-7*s,by-70*s,14*s,70*s);X.fillStyle='#2f8f3f';for(const[dx,dy,r]of[[0,-92,36],[-26,-72,28],[26,-72,28]]){circ(x+dx*s,by+dy*s,r*s);X.fill()}X.fillStyle='#43a950';circ(x-8*s,by-100*s,22*s);X.fill()}

// ---------- ground ----------
function drawGround(){
 const cx=G.camX,x0=cx-20,x1=cx+W+20;let g;
 // village hills (behind houses)
 X.fillStyle='#78c860';for(const[hx,rx,ry]of[[1900,520,110],[2650,640,135],[3150,420,100]]){const s=hx-cx;if(s+rx<0||s-rx>W)continue;X.beginPath();X.ellipse(s,GY0+14,rx,ry,0,Math.PI,0);X.fill()}
 X.fillStyle='#62b552';for(const[hx,rx,ry]of[[2300,420,75],[2900,380,80]]){const s=hx-cx;if(s+rx<0||s-rx>W)continue;X.beginPath();X.ellipse(s,GY0+14,rx,ry,0,Math.PI,0);X.fill()}
 for(const t of[[1620,412,.8],[1760,408,.7],[2180,410,.75],[2540,408,.9],[2840,410,.7],[3120,408,.8],[3330,412,.75]])tree(t[0],t[1],t[2]);
 // sand
 if(x0<1580){g=X.createLinearGradient(0,GY0,0,H);g.addColorStop(0,'#f7e5aa');g.addColorStop(1,'#e3c485');X.fillStyle=g;X.fillRect(0,GY0,Math.min(W,1580-cx),H-GY0);
  X.fillStyle='rgba(190,150,80,.35)';for(let i=0;i<70;i++){const wx=i*23+fr(i)*14,x=wx-cx;if(x<-10||x>W)continue;X.beginPath();X.ellipse(x,GY0+30+fr(i+7)*245,2+fr(i+3)*3,1.4,0,0,6.3);X.fill()}
  X.fillStyle='#f3b6c4';for(const[wx,wy]of[[210,500],[640,590],[1010,470],[1330,620]]){const x=wx-cx;if(x<-10||x>W)continue;circ(x,wy,5);X.fill();X.fillStyle='#e591a7';circ(x,wy,2.2);X.fill();X.fillStyle='#f3b6c4'}
  // shore
  X.fillStyle='#2d9be0';X.fillRect(0,694,Math.min(W,1580-cx),26);X.fillStyle='rgba(255,255,255,.85)';X.beginPath();X.moveTo(0,694);
  for(let x=0;x<=W;x+=14){X.lineTo(x,692+Math.sin((x+cx)*.04+G.time*2)*3)}X.lineTo(W,700);X.lineTo(0,700);X.fill()}
 // grass
 if(x1>1500&&x0<3420){const a=Math.max(0,1500-cx),b=Math.min(W,3420-cx);g=X.createLinearGradient(0,GY0,0,H);g.addColorStop(0,'#73d05c');g.addColorStop(1,'#48a63f');X.fillStyle=g;X.fillRect(a,GY0,b-a,H-GY0);
  X.fillStyle='#d9bb82';X.beginPath();for(let wx=Math.max(1500,cx-40);wx<=Math.min(3420,cx+W+40);wx+=30)X.lineTo(wx-cx,505+Math.sin(wx*.012)*16);for(let wx=Math.min(3420,cx+W+40);wx>=Math.max(1500,cx-40);wx-=30)X.lineTo(wx-cx,590+Math.sin(wx*.012+1)*14);X.closePath();X.fill();
  X.fillStyle='#e8cf9c';X.beginPath();for(let wx=Math.max(1500,cx-40);wx<=Math.min(3420,cx+W+40);wx+=30)X.lineTo(wx-cx,520+Math.sin(wx*.012)*16);for(let wx=Math.min(3420,cx+W+40);wx>=Math.max(1500,cx-40);wx-=30)X.lineTo(wx-cx,534+Math.sin(wx*.012)*16);X.closePath();X.fill();
  X.fillStyle='#3d963a';for(let i=0;i<110;i++){const wx=1500+i*18+fr(i)*12,x=wx-cx;if(x<-10||x>W||wx>3420)continue;const y=GY0+20+fr(i+5)*250;X.beginPath();X.moveTo(x-4,y);X.lineTo(x-1,y-8);X.lineTo(x+1,y);X.lineTo(x+4,y-7);X.lineTo(x+6,y);X.fill()}
  const fl=['#ffffff','#ffd54f','#f48fb1'];for(let i=0;i<50;i++){const wx=1520+i*38+fr(i+11)*20,x=wx-cx;if(x<-10||x>W||wx>3400)continue;X.fillStyle=fl[i%3];circ(x,GY0+30+fr(i+2)*240,3);X.fill()}
  X.fillStyle='#f7e5aa';const sx=1500-cx;if(sx>-40&&sx<W)for(let y=GY0;y<H;y+=36){circ(sx,y,26);X.fill()}}
 // dock
 if(x1>3380){const a=Math.max(0,3400-cx);g=X.createLinearGradient(0,GY0,0,GY1+18);g.addColorStop(0,'#a97646');g.addColorStop(1,'#8a5c33');X.fillStyle=g;X.fillRect(a,GY0,W-a,GY1+18-GY0);
  X.strokeStyle='rgba(50,28,10,.55)';X.lineWidth=3;for(let wx=Math.ceil(Math.max(3400,cx)/70)*70;wx<cx+W+70;wx+=70){X.beginPath();X.moveTo(wx-cx,GY0);X.lineTo(wx-cx,GY1+18);X.stroke()}
  X.strokeStyle='rgba(50,28,10,.18)';X.lineWidth=2;for(let y=GY0+34;y<GY1;y+=48){X.beginPath();X.moveTo(a,y);X.lineTo(W,y);X.stroke()}
  X.fillStyle='rgba(255,230,170,.1)';for(let wx=Math.ceil(Math.max(3400,cx)/140)*140;wx<cx+W+70;wx+=140)X.fillRect(wx-cx+3,GY0,67,GY1+18-GY0);
  X.fillStyle='#5a3818';X.fillRect(a,GY1+18,W-a,16);X.fillStyle='#7b5128';X.fillRect(a,GY1+18,W-a,4);
  X.fillStyle='#1b78bd';X.fillRect(a,GY1+34,W-a,H);X.fillStyle='rgba(255,255,255,.25)';for(let x=a;x<W;x+=40){X.fillRect(x+Math.sin(G.time*2+x)*8,GY1+50+(x%3)*7,22,2)}
  for(let wx=Math.ceil(Math.max(3400,cx)/210)*210;wx<cx+W+70;wx+=210){const x=wx-cx;X.fillStyle='#3d2511';X.fillRect(x-8,GY1+30,16,H);X.fillStyle='#5b3a1c';X.fillRect(x-9,GY1+14,18,10);
   X.strokeStyle='#cbb98a';X.lineWidth=3;X.beginPath();X.moveTo(x,GY1+17);X.quadraticCurveTo(x+105,GY1+40,x+210,GY1+17);X.stroke()}
  X.fillStyle='#a18a63';const sx=3400-cx;if(sx>-30&&sx<W){for(let i=0;i<3;i++){X.fillRect(sx-16+i*6,GY0,8,GY1+18-GY0)}}
  // arena rune
  const ax=4000-cx;if(ax>-400&&ax<W+400){X.save();X.translate(ax,526);X.scale(1,.3);X.strokeStyle='rgba(255,226,140,.5)';X.lineWidth=7;X.setLineDash([22,14]);circ(0,0,330);X.stroke();X.setLineDash([]);X.strokeStyle='rgba(255,226,140,.35)';circ(0,0,250);X.stroke();
   X.beginPath();for(let k=0;k<5;k++){const an=k*2.5133-1.5708;X.lineTo(Math.cos(an)*250,Math.sin(an)*250)}X.closePath();X.stroke();X.restore()}}
}

function drawWorld(){
 drawSky();drawSea();drawShip(4290);drawGround();
 for(const p of PALMS)palm(p[0],p[1],p[2]);
 for(const r of ROCKS)rock(r[0],r[1],r[2]);
 for(const h of HOUSES)house(h);
 fence();lamp(1640);lamp(2440);lamp(3260);
 for(const wx of[3520,3840,4180,4500])torch(wx);
 crateStack(3480,410);crateStack(4450,410);
 for(const b of[1590,1930,2230,2570,2860,3150,3380])bush(b,436,1.1);
}

// ---------- breakable props ----------
function drawProp(p){
 const x=p.x-G.camX;if(x<-60||x>W+60)return;const w=Math.sin(G.time*60)*p.wob*4;
 X.save();X.translate(x+w,p.y);X.fillStyle='rgba(0,0,0,.28)';X.beginPath();X.ellipse(0,2,28,8,0,0,6.3);X.fill();
 if(p.k==='crate'){X.fillStyle='#c0904f';X.fillRect(-23,-46,46,46);X.fillStyle='#a8793c';X.fillRect(-23,-46,46,7);X.fillRect(-23,-7,46,7);X.fillRect(-23,-46,7,46);X.fillRect(16,-46,7,46);
  X.strokeStyle='#6d4a22';X.lineWidth=3;X.strokeRect(-22,-45,44,44);X.beginPath();X.moveTo(-18,-8);X.lineTo(18,-42);X.stroke()}
 else{X.fillStyle='#8d5a2b';X.beginPath();X.moveTo(-19,0);X.quadraticCurveTo(-26,-26,-19,-52);X.lineTo(19,-52);X.quadraticCurveTo(26,-26,19,0);X.closePath();X.fill();
  X.fillStyle='#b27a3f';X.fillRect(-6,-52,12,52);X.fillStyle='#46474d';for(const y of[-44,-26,-8])X.fillRect(-24+(y===-26?-2:2)*0,y,48,5);X.fillStyle='#6b4423';X.beginPath();X.ellipse(0,-52,19,6,0,0,6.3);X.fill()}
 X.restore();
}
