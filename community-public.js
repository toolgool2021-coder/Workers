import {app} from "./firebase-config.js";
import {getFirestore,collection,onSnapshot} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
const db=getFirestore(app);
const rank=document.getElementById("rankList"), awards=document.getElementById("achievementGrid");
let people=[], achievements=[];
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function draw(){
  rank.replaceChildren();
  const sorted=people.filter(p=>p.active!==false).sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0)).slice(0,30);
  if(!sorted.length)rank.append(el("p","empty-message","Пока нет участников рейтинга."));
  sorted.forEach((p,i)=>{
    const item=el("div","rank-entry");
    item.append(el("span","rank-position",i+1));
    const info=el("div");info.append(el("div","rank-name",p.displayName||"Участник"),el("div","rank-role",p.role||"Участник"));
    const score=el("div","rank-score",Math.max(0,Number(p.points)||0).toLocaleString("ru-RU"));score.append(el("small","","очков"));
    item.append(info,score);rank.append(item);
  });
  awards.replaceChildren();
  const earned=achievements.filter(a=>a.active!==false).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
  if(!earned.length)awards.append(el("p","empty-message","Достижения появятся после их создания."));
  earned.forEach(a=>{
    const card=el("article","achievement-card");
    card.append(el("span","achievement-symbol",a.icon||"🏅"));
    const info=el("div");info.append(el("h3","",a.title||"Достижение"),el("p","",a.description||""));
    const owners=people.filter(p=>Array.isArray(p.achievementIds)&&p.achievementIds.includes(a.id)).map(p=>p.displayName).slice(0,5);
    info.append(el("small","",owners.length?"Получили: "+owners.join(", "):"Пока никто не получил"));
    card.append(info);awards.append(card);
  });
}
onSnapshot(collection(db,"profiles"),snap=>{people=snap.docs.map(d=>({uid:d.id,...d.data()}));draw();},err=>{rank.replaceChildren(el("p","empty-message","Рейтинг временно недоступен: "+err.code));});
onSnapshot(collection(db,"achievements"),snap=>{achievements=snap.docs.map(d=>({id:d.id,...d.data()}));draw();},err=>{awards.replaceChildren(el("p","empty-message","Не удалось загрузить достижения: "+err.code));});
