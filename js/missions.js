// 3 missions: Pirate Attack -> Rescue the Village -> Pirate Captain
const MI={i:0,k:0,ph:0};
const MTITLE=['MISSION 1 — PIRATE ATTACK','MISSION 2 — RESCUE THE VILLAGE','MISSION 3 — PIRATE CAPTAIN'];
const VILLAGE_X=1950,DOCK_X=3700;
function startMissions(){
 MI.i=0;MI.k=0;MI.ph=0;
 [[820,'grunt',520],[1020,'fighter',600],[1180,'grunt',470],[1350,'grunt',580],[1520,'fighter',520]].forEach(([x,t,y])=>spawnEnemy(t,x,y,false));
 UI.banner('PIRATE ATTACK!','Find the pirates and defeat them');
}
function onKill(e){
 if(e.boss){G.state='win';G.winT=0;G.shown=false;G.ts=.3;UI.boss(null);UI.hud(false);SND.sfx('win');SND.music('victory');comboReset();return}
 MI.k++;
}
function missionDone(next){SND.sfx('mission');UI.banner('MISSION COMPLETE',next||'')}
function objectiveX(){
 if(MI.i===0){let b=null;for(const e of G.enemies)if(!e.dead&&(!b||e.x<b.x))b=e;return b?b.x:800}
 if(MI.i===1&&MI.ph===0)return VILLAGE_X;
 if(MI.i===2&&MI.ph===0)return DOCK_X;
 return null;
}
function updateMissions(){
 if(MI.i===0){UI.mission(MTITLE[0],'Defeat the pirates: '+Math.min(MI.k,5)+' / 5');
  if(MI.k>=5){MI.i=1;MI.k=0;MI.ph=0;missionDone('Head east to the village')}}
 else if(MI.i===1){
  if(MI.ph===0){UI.mission(MTITLE[1],'Reach the village (follow the arrow)');
   if(pl.x>=VILLAGE_X){MI.ph=1;MI.k=0;[[pl.x+560,'grunt'],[pl.x+680,'fighter'],[pl.x+800,'grunt'],[pl.x+920,'fighter']].forEach(([x,t],j)=>spawnEnemy(t,x,480+j%2*110,true));UI.banner('PIRATES ARE ATTACKING!','Defend the village')}}
  else{UI.mission(MTITLE[1],'Defeat the attackers: '+Math.min(MI.k,4)+' / 4');if(MI.k>=4){MI.i=2;MI.ph=0;missionDone('Travel to the pirate dock')}}}
 else{
  if(MI.ph===0){UI.mission(MTITLE[2],'Travel to the pirate dock (follow the arrow)');
   if(pl.x>=DOCK_X){MI.ph=1;pl.minX=3420;spawnEnemy('captain',4380,540,true);UI.banner('THE PIRATE CAPTAIN!','Defeat him to save the village')}}
  else{UI.mission(MTITLE[2],'Defeat the Pirate Captain!');const b=G.enemies.find(e=>e.boss);UI.boss(b&&!b.dead?b.hp/b.max:null)}}
}
