import {app} from "./firebase-config.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {getFirestore,doc,collection,onSnapshot,updateDoc} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
const OWNER_UID="5oUqbwq21TYRJDzP68t3KMgS7552";
let unsubs=[],current=null,profile=null,all=[],achievements=[];
const message=s=>$("notice").textContent=s;
const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;x.textContent=txt;return x;};
function renderColleagues(){
 const box=$("colleagues");if(!box)return;box.replaceChildren();
 const q=$("colleagueSearch").value.trim().toLocaleLowerCase();
 const ranked=all.filter(p=>p.active!==false).sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0));
 $("colleagueCount").textContent=ranked.length+" участников";
 ranked.forEach((p,i)=>{
  if(!(p.displayName||"").toLocaleLowerCase().includes(q)&&!(p.role||"").toLocaleLowerCase().includes(q))return;
  const card=node("article","colleague-card","");
  const avatar=node("div","colleague-avatar",(p.displayName||"W").charAt(0).toUpperCase());
  const info=node("div","colleague-info","");info.append(node("strong","",p.displayName||"Участник"),node("small","",p.role||"Участник"));
  const score=node("div","colleague-score",String(Math.max(0,Number(p.points)||0).toLocaleString("ru-RU")));score.append(node("small","","#"+(i+1)+" · очков"));
  card.append(avatar,info,score);if(p.uid===current?.uid)card.classList.add("self");box.append(card);
 });
 if(!box.children.length)box.append(node("p","empty-note","Коллеги не найдены."));
}
$("colleagueSearch")?.addEventListener("input",renderColleagues);
function render(){
 if(!profile)return;
 renderColleagues();
 $("displayName").textContent=profile.displayName||"Участник";$("initial").textContent=(profile.displayName||"W")[0].toUpperCase();
 $("role").textContent=profile.role||"Участник";$("points").textContent=Math.max(0,Number(profile.points)||0).toLocaleString("ru-RU");
 const earned=Array.isArray(profile.achievementIds)?profile.achievementIds:[];
 $("badgeCount").textContent=earned.length;
 const ranked=all.filter(p=>p.active!==false).sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0));
 const pos=ranked.findIndex(p=>p.uid===current.uid);$("rank").textContent=pos<0?"—":pos+1;
 $("myAwards").replaceChildren();
 earned.forEach(id=>{const a=achievements.find(a=>a.id===id);if(!a)return;const card=node("div","achievement-card","");card.append(node("span","achievement-symbol",a.icon||"🏅"));const info=node("div");info.append(node("h3","",a.title||"Награда"),node("p","",a.description||""));card.append(info);$("myAwards").append(card);});
 if(!$("myAwards").children.length)$("myAwards").append(node("p","","Достижений пока нет."));
 if(document.activeElement?.closest("#profileForm")===null){$("profileForm").elements.displayName.value=profile.displayName||"";$("profileForm").elements.bio.value=profile.bio||"";}
}
onAuthStateChanged(auth,user=>{
 unsubs.forEach(f=>f());unsubs=[];current=user;profile=null;
 $("ownerNav").hidden=!user||user.uid!==OWNER_UID;
 $("signout").hidden=!user;$("authPanel").hidden=!!user;$("profilePanel").hidden=!user;
 if(!user)return;
 unsubs.push(onSnapshot(doc(db,"profiles",user.uid),snap=>{if(!snap.exists()){message(user.uid===OWNER_UID?"Вход владельца выполнен. Открой раздел «Управление» сверху. Для личной статистики создай себе профиль в «Аккаунты и награды».":"Профиль ещё не создан. Обратись к владельцу WORKERS.");return;}profile=snap.data();render();},err=>message("Ошибка профиля: "+err.code)));
 unsubs.push(onSnapshot(collection(db,"profiles"),snap=>{all=snap.docs.map(d=>({uid:d.id,...d.data()}));renderColleagues();render();}));
 unsubs.push(onSnapshot(collection(db,"achievements"),snap=>{achievements=snap.docs.map(d=>({id:d.id,...d.data()}));render();}));
});
$("signin").addEventListener("submit",async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);message("");}catch(err){message("Ошибка входа: "+err.code);}});
$("signout").addEventListener("click",()=>signOut(auth));
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();if(!current||!profile)return;try{await updateDoc(doc(db,"profiles",current.uid),{displayName:e.target.elements.displayName.value.trim(),bio:e.target.elements.bio.value.trim()});message("Профиль обновлён.");}catch(err){message("Не удалось сохранить: "+err.code);}});
