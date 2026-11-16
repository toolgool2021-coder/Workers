import {app} from "./firebase-config.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,deleteDoc,collection,onSnapshot,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let members=[],awards=[],selected=null,subscriptions=[];
const message=t=>$("notice").textContent=t;
onAuthStateChanged(auth,async user=>{
 subscriptions.forEach(f=>f());subscriptions=[];$("content").hidden=true;$("locked").hidden=false;
 if(!user){message("Войди как владелец через панель управления.");return;}
 try{await user.getIdToken(true);await getDoc(doc(db,"internal","owner-check"));}
 catch(e){message("Нет доступа владельца: "+e.code);return;}
 $("locked").hidden=true;$("content").hidden=false;message("");
 subscriptions.push(onSnapshot(collection(db,"profiles"),s=>{members=s.docs.map(d=>({uid:d.id,...d.data()}));renderMembers();renderAwards();},e=>message("Ошибка профилей: "+e.code)));
 subscriptions.push(onSnapshot(collection(db,"achievements"),s=>{awards=s.docs.map(d=>({id:d.id,...d.data()}));renderAwards();},e=>message("Ошибка достижений: "+e.code)));
});
function renderMembers(){
 $("total").textContent=members.length;$("members").replaceChildren();
 members.sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0)).forEach(p=>{
  const b=document.createElement("button");b.type="button";b.className="item"+(selected===p.uid?" selected":"");
  const title=document.createElement("strong");title.textContent=p.displayName||"Участник";
  const sub=document.createElement("small");sub.textContent=(p.role||"")+" · "+(p.points||0)+" очков · "+p.uid.slice(0,8);
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
  const del=document.createElement("button");del.type="button";del.className="danger";del.textContent="Удалить";
  del.onclick=async()=>{if(!confirm("Удалить достижение?"))return;try{await deleteDoc(doc(db,"achievements",a.id));message("Достижение удалено.");}catch(e){message(e.code||e.message);}};
  card.append(title,del);$("awardList").append(card);
  if(p){const label=document.createElement("label");label.className="check";const cb=document.createElement("input");cb.type="checkbox";cb.value=a.id;cb.checked=Array.isArray(p.achievementIds)&&p.achievementIds.includes(a.id);label.append(cb,document.createTextNode(" "+(a.icon||"🏅")+" "+a.title));$("awardChecks").append(label);}
 });
}
$("create").addEventListener("submit",async e=>{
 e.preventDefault();const f=new FormData(e.target);const uid=String(f.get("uid")||"").trim();
 if(!/^[a-zA-Z0-9_-]{10,128}$/.test(uid)){message("Некорректный UID.");return;}
 try{
  const ref=doc(db,"profiles",uid);
  if((await getDoc(ref)).exists()){message("Профиль с этим UID уже существует.");return;}
  await setDoc(ref,{displayName:String(f.get("displayName")||"").trim().slice(0,40),role:String(f.get("role")||"Участник").trim().slice(0,40),bio:"",points:0,achievementIds:[],active:true,createdAt:serverTimestamp()});
  message("Профиль создан. Сотрудник может войти через account.html с email и паролем из Firebase Authentication.");e.target.reset();
 }catch(err){message("Ошибка: "+(err.code||err.message));}
});
$("editMember").addEventListener("submit",async e=>{
 e.preventDefault();if(!selected)return;const f=e.target.elements;
 const points=Number(f.points.value);
 if(!Number.isSafeInteger(points)||points<0||points>1000000000){message("Некорректное количество очков.");return;}
 const ids=[...$("awardChecks").querySelectorAll("input:checked")].map(x=>x.value);
 try{await updateDoc(doc(db,"profiles",selected),{role:f.role.value.trim().slice(0,40),points,active:f.active.checked,achievementIds:ids});message("Статистика сотрудника сохранена.");}
 catch(err){message(err.code||err.message);}
});
$("newAward").addEventListener("submit",async e=>{
 e.preventDefault();const f=new FormData(e.target),id=String(f.get("id")||"").trim();
 if(!/^[a-z0-9-]{2,40}$/.test(id)){message("Некорректный ID.");return;}
 try{await setDoc(doc(db,"achievements",id),{title:String(f.get("title")||"").trim().slice(0,60),description:String(f.get("description")||"").trim().slice(0,180),icon:String(f.get("icon")||"🏅").trim().slice(0,8),active:true},{merge:true});message("Достижение сохранено.");e.target.reset();}
 catch(err){message(err.code||err.message);}
});
