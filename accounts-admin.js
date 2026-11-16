import {app} from "./firebase-config.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {getFirestore,doc,getDoc,collection,onSnapshot} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import {getFunctions,httpsCallable} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-functions.js";
const auth=getAuth(app),db=getFirestore(app),fn=getFunctions(app,"us-central1"),$=id=>document.getElementById(id);
let members=[],awards=[],selected=null,subscriptions=[];
const message=t=>$("notice").textContent=t;
const run=(action,data)=>httpsCallable(fn,action)(data);
onAuthStateChanged(auth,async user=>{
 subscriptions.forEach(f=>f());subscriptions=[];$("content").hidden=true;$("locked").hidden=false;
 if(!user){message("Требуется вход администратора.");return;}
 try{await user.getIdToken(true);await getDoc(doc(db,"internal","owner-check"));}
 catch(e){message("Нет прав администратора: "+e.code);return;}
 $("locked").hidden=true;$("content").hidden=false;message("");
 subscriptions.push(onSnapshot(collection(db,"profiles"),s=>{members=s.docs.map(d=>({uid:d.id,...d.data()}));renderMembers();},e=>message(e.code)));
 subscriptions.push(onSnapshot(collection(db,"achievements"),s=>{awards=s.docs.map(d=>({id:d.id,...d.data()}));renderAwards();},e=>message(e.code)));
});
function renderMembers(){
 $("total").textContent=members.length;$("members").replaceChildren();
 members.sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0)).forEach(p=>{
 const b=document.createElement("button");b.type="button";b.className="item"+(selected===p.uid?" selected":"");
 const title=document.createElement("strong");title.textContent=p.displayName||"Участник";
 const sub=document.createElement("small");sub.textContent=(p.role||"")+" · "+(p.points||0)+" очков";
 b.append(title,sub);b.onclick=()=>{selected=p.uid;renderMembers();renderAwards();};$("members").append(b);
 });
 const p=members.find(x=>x.uid===selected);$("memberTitle").textContent=p?p.displayName:"Выбери участника";
 $("editMember").hidden=!p;
 if(p){$("editMember").elements.role.value=p.role||"";$("editMember").elements.points.value=p.points||0;$("editMember").elements.active.checked=p.active!==false;}
}
function renderAwards(){
 $("awardsTotal").textContent=awards.length;$("awardList").replaceChildren();$("awardChecks").replaceChildren();
 const p=members.find(x=>x.uid===selected);
 awards.forEach(a=>{
 const card=document.createElement("div");card.className="award-item";
 const title=document.createElement("span");title.textContent=(a.icon||"🏅")+" "+(a.title||a.id);
 const del=document.createElement("button");del.type="button";del.className="danger";del.textContent="Удалить";del.onclick=async()=>{if(!confirm("Удалить достижение?"))return;try{await run("manageAchievement",{action:"delete",id:a.id});message("Удалено");}catch(e){message(e.message);}};
 card.append(title,del);$("awardList").append(card);
 if(p){const label=document.createElement("label");label.className="check";const cb=document.createElement("input");cb.type="checkbox";cb.value=a.id;cb.checked=Array.isArray(p.achievementIds)&&p.achievementIds.includes(a.id);label.append(cb,document.createTextNode(" "+(a.icon||"🏅")+" "+a.title));$("awardChecks").append(label);}
 });
}
$("create").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);try{const r=await run("createMember",{email:f.get("email"),password:f.get("password"),displayName:f.get("displayName"),role:f.get("role")});message("Аккаунт создан. UID: "+r.data.uid);e.target.reset();}catch(err){message("Ошибка: "+err.message);}});
$("editMember").addEventListener("submit",async e=>{e.preventDefault();if(!selected)return;const f=e.target.elements;const ids=[...$("awardChecks").querySelectorAll("input:checked")].map(x=>x.value);try{await run("manageMember",{uid:selected,role:f.role.value,points:Number(f.points.value),active:f.active.checked,achievementIds:ids});message("Данные обновлены.");}catch(err){message(err.message);}});
$("newAward").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);try{await run("manageAchievement",{action:"upsert",id:f.get("id"),icon:f.get("icon"),title:f.get("title"),description:f.get("description")});message("Достижение сохранено.");e.target.reset();}catch(err){message(err.message);}});
