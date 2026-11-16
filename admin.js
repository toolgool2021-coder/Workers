import { app } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, reload } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const auth=getAuth(app), db=getFirestore(app);
const $=(id)=>document.getElementById(id);
let kind="workers", selected=null, workers=[], levels=[], settings={firebaseEnabled:false};
let unsubWorkers=null, unsubLevels=null, unsubSite=null;
const WORKER_FIELDS=[
  ["id","ID","number"],["name","Имя","text"],["user","Ссылка / @ник","text"],
  ["class","Уровень","text"],["job","Роль / должность","text"],["xp","XP (например, 0/40000 30000)","text"],
  ["photo","Аватар: ссылка или путь","text"],["color","Цвет карточки: cyan, gold или #HEX","text"],
  ["teg","Тег","text"],["nameColor","Цвет имени (#HEX)","text"],
  ["badge","Бейдж №1: путь / ссылка","text"],["badge_2","Бейдж №2","text"],
  ["badge_3","Бейдж №3","text"],["outline","Обводка: путь, пусто или -","text"],
  ["range","Ранг: путь, пусто или -","text"]];
const LEVEL_FIELDS=[
  ["order","Порядок / номер","number"],["name","Название уровня","text"],
  ["oil","Диапазон","text"],["color","Цвет","text"],["teg","Тег","text"],
  ["advantages","Преимущества (через запятую)","textarea"],
  ["rang","Изображение ранга (путь / ссылка)","text"],
  ["outline","Изображение обводки (путь / ссылка)","text"]];

function notice(message){$("notice").textContent=message||"";}
function list(){return kind==="workers"?workers:levels;}
function key(item){return String(kind==="workers"?item.id:item.order);}
function createField([field,title,type],data){
  const label=document.createElement("label");label.textContent=title;
  const input=document.createElement(type==="textarea"?"textarea":"input");input.name=field;
  if(type!=="textarea")input.type=type;
  if(type==="number"){input.min="1";input.step="1";input.required=true;}
  if(["name","id","order"].includes(field))input.required=true;
  const value=data&&data[field]!==undefined?data[field]:"";
  input.value=Array.isArray(value)?value.join(", "):String(value??"");
  if(["name","user","job","xp","advantages","photo"].includes(field))label.classList.add("wide");
  label.appendChild(input);return label;
}
function renderForm(data){
  $("fields").replaceChildren();
  (kind==="workers"?WORKER_FIELDS:LEVEL_FIELDS).forEach(field=>$("fields").appendChild(createField(field,data)));
  $("editorTitle").textContent=data?"Редактировать: "+(data.name||data.id):"Новая запись";
  $("deleteItem").hidden=!data;
  const idInput=$("fields").querySelector('[name="'+(kind==="workers"?"id":"order")+'"]');
  if(data)idInput.readOnly=true;
}
function choose(item){
  selected=item?key(item):null;renderForm(item);renderList();
}
function renderList(){
  $("recordList").replaceChildren();
  const q=$("search").value.toLocaleLowerCase().trim();
  list().filter(item=>JSON.stringify(item).toLocaleLowerCase().includes(q)).forEach(item=>{
    const btn=document.createElement("button");btn.type="button";btn.className="item"+(key(item)===selected?" selected":"");
    const strong=document.createElement("strong");strong.textContent=(kind==="workers"?"#"+item.id+" · ":"LVL "+item.order+" · ")+(item.name||"Без имени");
    const desc=document.createElement("small");desc.textContent=kind==="workers"?(item.job||"")+" · "+(item.user||""):(item.oil||"")+" · "+(item.teg||"");
    btn.append(strong,desc);btn.addEventListener("click",()=>choose(item));$("recordList").append(btn);
  });
  if(!$("recordList").children.length){const p=document.createElement("p");p.textContent="Записей нет";$("recordList").append(p);}
  $("workersCount").textContent=workers.length;$("levelsCount").textContent=levels.length;
}
function setTab(tab){
  kind=tab;$("editArea").hidden=tab==="settings";$("settingsForm").hidden=tab!=="settings";
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  $("search").value="";choose(null);
  if(tab==="settings")renderSettings();
}
function renderSettings(){
  $("settingsForm").elements.title.value=settings.title||"⚡ Мои Рабочие";
  $("settingsForm").elements.subtitle.value=settings.subtitle||"Список команды разработчиков и специалистов";
  $("settingsForm").elements.maintenance.checked=!!settings.maintenance;
  $("settingsForm").elements.maintenanceText.value=settings.maintenanceText||"Сайт временно недоступен, ведутся работы";
}
function detach(){[unsubWorkers,unsubLevels,unsubSite].forEach(f=>f&&f());unsubWorkers=unsubLevels=unsubSite=null;}
function start(){
  detach();
  unsubWorkers=onSnapshot(collection(db,"workers"),snap=>{workers=snap.docs.map(d=>d.data()).sort((a,b)=>Number(a.id)-Number(b.id));renderList();},error=>notice(error.message));
  unsubLevels=onSnapshot(collection(db,"levels"),snap=>{levels=snap.docs.map(d=>d.data()).sort((a,b)=>Number(a.order)-Number(b.order));renderList();},error=>notice(error.message));
  unsubSite=onSnapshot(doc(db,"meta","site"),snap=>{settings=snap.exists()?snap.data():{firebaseEnabled:false};renderSettings();$("syncStatus").textContent=settings.firebaseEnabled?"● Активно":"○ TXT";},error=>notice(error.message));
}
async function checkAccess(user){
  if(!user)return;
  $("uidText").textContent="Твой Firebase UID: "+user.uid+(user.emailVerified?" · Почта подтверждена":" · Подтверди почту");
  $("accountHelp").hidden=false;
  try{
    await user.getIdToken(true);
    await getDoc(doc(db,"internal","owner-check"));
    $("authBox").hidden=true;$("dashboard").hidden=false;notice("");start();renderForm(null);
  }catch(error){
    $("authBox").hidden=false;$("dashboard").hidden=true;detach();
    notice(user.emailVerified?"Доступ к редактированию закрыт. Укажи свой UID в firestore.rules и опубликуй правила. ("+error.code+")":"Подтверди почту и опубликуй правила Firestore с твоим UID.");
  }
}
onAuthStateChanged(auth,user=>{
  $("logout").hidden=!user;
  $("loginForm").hidden=!!user;
  if(!user){detach();$("authBox").hidden=false;$("dashboard").hidden=true;$("accountHelp").hidden=true;return;}
  checkAccess(user);
});
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();notice("Вход…");
  try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);}catch(e){notice("Не удалось войти: "+e.message);}
});
$("verifyEmail").addEventListener("click",async()=>{
  if(!auth.currentUser)return;
  try{await sendEmailVerification(auth.currentUser);notice("Письмо подтверждения отправлено.");}catch(e){notice(e.message);}
});
$("retryAccess").addEventListener("click",async()=>{
  if(!auth.currentUser)return;
  try{await reload(auth.currentUser);await checkAccess(auth.currentUser);}catch(e){notice(e.message);}
});
$("logout").addEventListener("click",()=>signOut(auth));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
$("newItem").addEventListener("click",()=>choose(null));
$("resetForm").addEventListener("click",()=>choose(null));
$("search").addEventListener("input",renderList);
$("editor").addEventListener("submit",async(e)=>{
  e.preventDefault();
  if(!settings.firebaseEnabled){notice("Сначала нажми «Импорт TXT», чтобы включить Firestore и сохранить существующую команду.");return;}
  const form=new FormData($("editor")), data={};
  for(const [k,v] of form.entries())data[k]=String(v).trim();
  const identifier=kind==="workers"?"id":"order";
  const id=Number(data[identifier]);
  if(!Number.isSafeInteger(id)||id<=0){notice("Неверный числовой ID");return;}
  data[identifier]=id;
  if(kind==="levels")data.advantages=data.advantages.split(",").map(s=>s.trim()).filter(Boolean);
  if(kind==="workers"&&(!data.name||!data.user)){notice("Укажи имя и профиль участника.");return;}
  try{await setDoc(doc(db,kind,String(id)),data);selected=String(id);notice("Запись сохранена. Сайт обновляется автоматически.");}
  catch(error){notice("Ошибка сохранения: "+error.message);}
});
$("deleteItem").addEventListener("click",async()=>{
  if(!selected||!confirm("Удалить выбранную запись?"))return;
  try{await deleteDoc(doc(db,kind,selected));selected=null;renderForm(null);notice("Запись удалена.");}
  catch(error){notice(error.message);}
});
$("settingsForm").addEventListener("submit",async(e)=>{
  e.preventDefault();const f=e.target.elements;
  try{
    await setDoc(doc(db,"meta","site"),{
      ...settings,
      title:f.title.value.trim(),subtitle:f.subtitle.value.trim(),
      maintenance:f.maintenance.checked,maintenanceText:f.maintenanceText.value.trim(),
      firebaseEnabled:!!settings.firebaseEnabled
    });
    notice("Настройки сохранены.");
  }catch(err){notice(err.message);}
});
function parseWorkers(text){
  return text.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith("#")).map(line=>{
    const p=line.split(":");if(p.length<7)return null;
    const id=Number(p[0]);if(!Number.isSafeInteger(id)||id<=0)return null;
    return {id,class:p[1]||"",job:p[2]||"",xp:p[3]||"",name:p[4]||"",user:p[5]||"",photo:p[6]||"",badge:p[7]||"",badge_2:p[8]||"",badge_3:p[9]||"",color:p[10]||"cyan",teg:p[11]||"",nameColor:p[12]||"",outline:p[13]||"",range:p[14]||""};
  }).filter(Boolean);
}
function parseLevels(text){
  const list=[];
  for(const block of text.matchAll(/\{([^}]*)\}/g)){
    const item={};
    for(const line of block[1].split(/\r?\n/)){
      const pos=line.indexOf(":");if(pos<0)continue;
      const key=line.slice(0,pos).trim().toLowerCase(),value=line.slice(pos+1).trim();
      if(key==="advantages")item.advantages=value.split(",").map(s=>s.trim()).filter(Boolean);
      else if(key==="rang")item.rang=value.replace(/^Ranges\//,"Rangers/");
      else if(key==="outline")item.outline=value;
      else if(["name","oil","color","teg"].includes(key))item[key]=value;
    }
    if(item.name){item.order=list.length+1;list.push(item);}
  }
  return list;
}
$("importData").addEventListener("click",async()=>{
  if(!confirm("Импортировать TXT в Firestore? Существующие записи сотрудников и уровней будут заменены содержимым файлов TXT."))return;
  notice("Загрузка и перенос TXT…");
  try{
    const [w,l]=await Promise.all([fetch("./Workers/Crafters.txt",{cache:"no-store"}),fetch("./Class/List.txt",{cache:"no-store"})]);
    if(!w.ok||!l.ok)throw Error("Не удалось загрузить TXT");
    const incomingWorkers=parseWorkers(await w.text()), incomingLevels=parseLevels(await l.text());
    if(!incomingWorkers.length||!incomingLevels.length)throw Error("TXT пуст или формат не распознан");
    const batch=writeBatch(db);
    const currentWorkers=await getDocs(collection(db,"workers")), currentLevels=await getDocs(collection(db,"levels"));
    if(currentWorkers.size+currentLevels.size+incomingWorkers.length+incomingLevels.length+1>500)throw Error("Слишком много записей для одного пакетного импорта (500 операций).");
    currentWorkers.docs.forEach(d=>batch.delete(d.ref));currentLevels.docs.forEach(d=>batch.delete(d.ref));
    incomingWorkers.forEach(item=>batch.set(doc(db,"workers",String(item.id)),item));
    incomingLevels.forEach(item=>batch.set(doc(db,"levels",String(item.order)),item));
    batch.set(doc(db,"meta","site"),{...settings,firebaseEnabled:true});
    await batch.commit();notice("Готово: "+incomingWorkers.length+" участников и "+incomingLevels.length+" уровней перенесены в Firestore.");
  }catch(error){notice("Ошибка импорта: "+error.message);}
});
