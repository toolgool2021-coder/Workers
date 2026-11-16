const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore,FieldValue}=require("firebase-admin/firestore");
initializeApp();
const db=getFirestore();
const OWNER_UID=process.env.WORKERS_OWNER_UID;
function owner(request){
 if(!OWNER_UID || !request.auth || request.auth.uid!==OWNER_UID || request.auth.token.email_verified!==true)
   throw new HttpsError("permission-denied","Доступ только владельцу с подтверждённой почтой.");
}
function clean(v,max=100){return String(v??"").trim().slice(0,max);}
function validUid(uid){return typeof uid==="string" && uid.length>10 && uid.length<150;}
exports.createMember=onCall({region:"us-central1",enforceAppCheck:false},async request=>{
 owner(request);
 const {email,password,displayName,role}=request.data||{};
 if(typeof email!=="string"||!/^.+@.+\..+$/.test(email)||email.length>254)throw new HttpsError("invalid-argument","Неверный email.");
 if(typeof password!=="string"||password.length<12||password.length>128)throw new HttpsError("invalid-argument","Пароль должен содержать 12–128 символов.");
 if(!clean(displayName,40))throw new HttpsError("invalid-argument","Нужно имя.");
 let user;
 try{user=await getAuth().createUser({email:email.trim(),password,displayName:clean(displayName,40),emailVerified:false});}
 catch(e){throw new HttpsError("already-exists","Не удалось создать аккаунт: "+e.code);}
 try{
 await db.doc("profiles/"+user.uid).create({displayName:clean(displayName,40),role:clean(role,40)||"Участник",bio:"",points:0,achievementIds:[],active:true,createdAt:FieldValue.serverTimestamp()});
 }catch(e){await getAuth().deleteUser(user.uid);throw new HttpsError("internal","Ошибка создания профиля.");}
 return {uid:user.uid};
});
exports.manageMember=onCall({region:"us-central1"},async request=>{
 owner(request);
 const {uid,role,points,active,achievementIds}=request.data||{};
 if(!validUid(uid)||!Number.isSafeInteger(points)||points<0||points>1000000000||typeof active!=="boolean"||!Array.isArray(achievementIds)||achievementIds.length>100||achievementIds.some(x=>typeof x!=="string"||!/^[a-z0-9-]{2,40}$/.test(x)))
 throw new HttpsError("invalid-argument","Некорректные данные участника.");
 const ref=db.doc("profiles/"+uid);
 const snap=await ref.get();if(!snap.exists)throw new HttpsError("not-found","Участник не найден.");
 await ref.update({role:clean(role,40),points,active,achievementIds:[...new Set(achievementIds)]});
 return {ok:true};
});
exports.manageAchievement=onCall({region:"us-central1"},async request=>{
 owner(request);
 const {action,id,title,description,icon}=request.data||{};
 if(typeof id!=="string"||!/^[a-z0-9-]{2,40}$/.test(id))throw new HttpsError("invalid-argument","Неверный ID достижения.");
 const ref=db.doc("achievements/"+id);
 if(action==="delete"){await ref.delete();return {ok:true};}
 if(action!=="upsert"||!clean(title,60))throw new HttpsError("invalid-argument","Укажи название.");
 await ref.set({title:clean(title,60),description:clean(description,180),icon:clean(icon,8)||"🏅",active:true},{merge:true});
 return {ok:true};
});
