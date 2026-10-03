// DOM HUD + menus
const $=id=>document.getElementById(id);
const UI=(function(){
 let bt=null;
 return{
  scr(id){document.querySelectorAll('.scr').forEach(e=>e.classList.add('hide'));if(id)$(id).classList.remove('hide')},
  hud(on){$('hud').classList.toggle('hide',!on)},
  bars(p,score){$('hp').style.width=Math.max(0,p.hp/p.max*100)+'%';$('st').style.width=p.st+'%';$('scn').textContent=score},
  cd(sp,dashOk,heavy){$('a3').style.setProperty('--c',(sp*100)+'%');$('a3').classList.toggle('on',sp===0);$('a2').style.setProperty('--c',dashOk?'0%':'55%');$('a2').classList.toggle('on',dashOk);$('a1').classList.toggle('on',heavy)},
  mission(a,b){$('mt1').textContent=a;$('mt2').textContent=b},
  banner(t,sub){$('b1').textContent=t;$('b2').textContent=sub||'';const b=$('banner');b.style.opacity=1;clearTimeout(bt);bt=setTimeout(()=>b.style.opacity=0,2400)},
  combo(n){const c=$('combo');if(n>1){c.textContent=n+' HIT COMBO!';c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}else c.textContent=''},
  boss(f){$('boss').classList.toggle('hide',f==null);if(f!=null)$('bh').style.width=Math.max(0,f*100)+'%'},
  flash(){const f=$('flash');f.style.opacity=.7;setTimeout(()=>f.style.opacity=0,140)},
  fit(){const s=Math.min(innerWidth/1280,innerHeight/720);$('stage').style.transform='translate(-50%,-50%) scale('+s+')'}
 };
})();
