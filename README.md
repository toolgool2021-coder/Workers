# Workers — панель управления Firebase

Сайт команды: список участников, уровни, аватары, значки, анимации. **Данные редактируются через \`admin.html\`**, автоматически синхронизируются с Firebase Firestore. Старые TXT оставлены для миграции и резервного отображения.

## Запуск

1. В Firebase Console открой проект **workers-66fd8**.
2. В **Build → Authentication → Sign-in method** включи **Email/Password**. Создай свой аккаунт во вкладке Users и подтверди его почту. Открытую регистрацию на сайте мы не включаем.
3. В **Build → Firestore Database** создай базу (Production mode).
4. Открой опубликованный сайт **/admin.html**. Войди в Firebase Auth. Внизу блока будет показан **Firebase UID**.
5. В Firestore → Rules скопируй содержимое **firestore.rules**, замени \`PASTE_YOUR_FIREBASE_AUTH_UID_HERE\` на свой UID и нажми **Publish**.
6. Вернись в админку и нажми **Проверить доступ** (письмо должно быть подтверждено).
7. Нажми **Импорт TXT** один раз: он перенесёт Workers/Crafters.txt и Class/List.txt в Firestore, включит динамические данные и сохранит прежнее содержимое.
8. Далее редактируй участников, уровни и настройки **только в админке**. Новые записи сразу появляются на публичном сайте без коммитов GitHub.

## Структура Firestore
- \`workers/{id}\`: id, name, user, class, job, xp, photo, badge, badge_2, badge_3, color, teg, nameColor, outline, range.
- \`levels/{order}\`: order, name, oil, color, teg, advantages (массив строк), rang, outline.
- \`meta/site\`: title, subtitle, maintenance, maintenanceText, firebaseEnabled.

Для изображений подходят относительные пути из GitHub (например \`Image/icon_1.jpg\`) и прямые ссылки https://...; загрузка новых изображений в Firebase Storage пока не реализована.

**Важно:** Firebase Web API key не является серверным секретом. Безопасность держится на опубликованных правилах Firestore и проверке UID/emailVerified. Не заменяй правила на \`allow write: if true\`. Никогда не размещай сервисные ключи Firebase Admin SDK в публичном репозитории.

**Резервное поведение:** пока \`firebaseEnabled\` не включён, сайт отображает данные из TXT. \`Импорт TXT\` перезаписывает текущие записи в Firestore; не нажимай его повторно, если уже вручную изменил команду, иначе эти изменения потеряются.
