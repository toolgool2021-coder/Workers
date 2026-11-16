import { app } from "./firebase-config.js";
import { getFirestore, doc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const db = getFirestore(app);
let workerUnsub = null;
let levelUnsub = null;
let active = false;

function stopSubscriptions() {
  if (workerUnsub) workerUnsub();
  if (levelUnsub) levelUnsub();
  workerUnsub = levelUnsub = null;
}

onSnapshot(doc(db, "meta", "site"), (snapshot) => {
  const settings = snapshot.exists() ? snapshot.data() : {};
  if (typeof window.applySiteSettings === "function") window.applySiteSettings(settings);
  if (!settings.firebaseEnabled) {
    stopSubscriptions();
    if (active) {
      active = false;
      window.loadWorkers && window.loadWorkers();
      window.loadLevels && window.loadLevels();
    }
    return;
  }
  if (active) return;
  active = true;

  workerUnsub = onSnapshot(collection(db, "workers"), (snap) => {
    const workers = snap.docs.map(item => item.data()).filter(item => item && item.id !== undefined);
    workers.sort((a, b) => Number(a.id) - Number(b.id));
    if (typeof window.applyFirestoreWorkers === "function") window.applyFirestoreWorkers(workers);
  }, (err) => console.error("Ошибка загрузки сотрудников из Firestore", err));

  levelUnsub = onSnapshot(collection(db, "levels"), (snap) => {
    const levels = snap.docs.map(item => item.data())
      .sort((a, b) => Number(a.order) - Number(b.order));
    if (typeof window.applyFirestoreLevels === "function") window.applyFirestoreLevels(levels);
  }, (err) => console.error("Ошибка загрузки уровней из Firestore", err));
}, (error) => {
  console.warn("Firebase недоступен, используются резервные TXT", error);
});
