import {app} from "./firebase-config.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {getFirestore,doc,collection,onSnapshot,updateDoc} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let unsubs=[],current=null,profile=null,all=[],achievements=[];
const message=s=>$("notice").textContent=s;
const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;x.textContent=txt;return x;};
function render(){
 if(!profile)return;
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
 $("signout").hidden=!user;$("authPanel").hidden=!!user;$("profilePanel").hidden=!user;
 if(!user)return;
 unsubs.push(onSnapshot(doc(db,"profiles",user.uid),snap=>{if(!snap.exists()){message("Профиль ещё не создан. Обратись к администратору.");return;}profile=snap.data();render();},err=>message("Ошибка профиля: "+err.code)));
 unsubs.push(onSnapshot(collection(db,"profiles"),snap=>{all=snap.docs.map(d=>({uid:d.id,...d.data()}));render();}));
 unsubs.push(onSnapshot(collection(db,"achievements"),snap=>{achievements=snap.docs.map(d=>({id:d.id,...d.data()}));render();}));
});
$("signin").addEventListener("submit",async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);message("");}catch(err){message("Ошибка входа: "+err.code);}});
$("signout").addEventListener("click",()=>signOut(auth));
$("reset").addEventListener("click",async()=>{const email=$("email").value.trim();if(!email){message("Сначала введи email.");return;}try{await sendPasswordResetEmail(auth,email);message("Если адрес зарегистрирован, на него отправлено письмо.");}catch(err){message("Не удалось отправить письмо: "+err.code);}});
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();if(!current||!profile)return;try{await updateDoc(doc(db,"profiles",current.uid),{displayName:e.target.elements.displayName.value.trim(),bio:e.target.elements.bio.value.trim()});message("Профиль обновлён.");}catch(err){message("Не удалось сохранить: "+err.code);}});
