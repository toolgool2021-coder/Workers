// Защита карточек и внешних медиа от HTML/URL-инъекций.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function safeColor(value) {
  const color = String(value ?? "cyan").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) || /^[a-zA-Z-]{1,30}$/.test(color) ? color : "cyan";
}
function safeMediaURL(value) {
  const path = String(value ?? "").trim().replace(/^Ranges\//i,"Rangers/");
  if (!path || path === "-") return "";
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (["https:", "http:"].includes(url.protocol)) return url.href;
    } catch (_) {}
    return "";
  }
  if (path.startsWith("/") || path.includes("..") || path.includes("\\") || /[<>"'?#]/.test(path)) return "";
  if (!/^[\w \-./+()а-яёА-ЯЁ]+$/u.test(path)) return "";
  return "./" + path.replace(/^\.\//,"");
}

// Таблица цветов для быстрого доступа
const colorMap = {
    cyan: { hex: '#00ffff', bg: 'rgba(0, 255, 255, 0.2)', bg2: 'rgba(168, 85, 247, 0.1)' },
    purple: { hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', bg2: 'rgba(0, 255, 200, 0.05)' },
    gold: { hex: '#ffd700', bg: 'rgba(255, 215, 0, 0.2)', bg2: 'rgba(255, 165, 0, 0.1)' },
    green: { hex: '#00ff88', bg: 'rgba(0, 255, 136, 0.2)', bg2: 'rgba(0, 200, 100, 0.1)' },
    pink: { hex: '#ff69b4', bg: 'rgba(255, 105, 180, 0.2)', bg2: 'rgba(255, 20, 147, 0.1)' },
    orange: { hex: '#ff8c00', bg: 'rgba(255, 140, 0, 0.2)', bg2: 'rgba(255, 100, 0, 0.1)' },
    red: { hex: '#ff4545', bg: 'rgba(255, 69, 69, 0.2)', bg2: 'rgba(255, 0, 0, 0.1)' },
    blue: { hex: '#1e90ff', bg: 'rgba(30, 144, 255, 0.2)', bg2: 'rgba(0, 102, 204, 0.1)' },
    yellow: { hex: '#ffff00', bg: 'rgba(255, 255, 0, 0.2)', bg2: 'rgba(255, 215, 0, 0.1)' },
    grey: { hex: '#adb5c4', bg: 'rgba(173, 181, 196, 0.16)', bg2: 'rgba(130, 143, 165, 0.06)' },
    violet: { hex: '#9565ed', bg: 'rgba(149, 101, 237, 0.18)', bg2: 'rgba(85, 62, 180, 0.07)' },
    'violet-dark': { hex: '#7351b8', bg: 'rgba(115, 81, 184, 0.18)', bg2: 'rgba(55, 30, 110, 0.07)' },
    'dark-red': { hex: '#ac3349', bg: 'rgba(172, 51, 73, 0.18)', bg2: 'rgba(93, 20, 30, 0.07)' },
    legend: { hex: '#ff8c42', bg: 'rgba(255, 140, 66, 0.2)', bg2: 'rgba(184, 134, 11, 0.1)' }
};

// Таблица уровней с преимуществами
let levelsData = [];

// Загрузка уровней из Class/List.txt
async function loadLevels() {
  try {
    const response = await fetch("./Class/List.txt");
    if (!response.ok) throw Error("HTTP " + response.status);
    levelsData = parseLevels(await response.text());
    initLevelsModal();
  } catch (error) {
    console.warn("Ошибка резервной загрузки уровней", error);
  }
}

function parseLevels(text) {
  const levels = [];
  for (const block of text.matchAll(/\{([^}]*)\}/g)) {
    const level = {};
    for (const line of block[1].split(/\r?\n/)) {
      const separator = line.indexOf(":");
      if (separator === -1) continue;
      const key = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();
      if (key === "advantages") level.advantages = value.split(",").map(v => v.trim()).filter(Boolean);
      else if (key === "rang") level.rang = value.replace(/^Ranges\//i, "Rangers/");
      else if (["name", "oil", "color", "teg", "outline"].includes(key)) level[key] = value;
    }
    if (level.name) {
      level.order = levels.length + 1;
      levels.push(level);
    }
  }
  return levels;
}

function initLevelsModal() {
    const levelsBtn = document.getElementById('levelsBtn');
    const levelsModal = document.getElementById('levelsModal');
    const closeBtn = document.querySelector('.close-levels-modal');
    const levelsList = document.getElementById('levelsList');
    const levelDetails = document.getElementById('levelDetails');
    
    if (!levelsBtn) return;
    
    // Заполняем список уровней
    levelsList.innerHTML = '';
    levelsData.forEach((level, index) => {
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';
        levelItem.textContent = level.name;
        levelItem.onclick = () => showLevelDetails(index);
        levelsList.appendChild(levelItem);
    });
    
    // Открытие модала
    levelsBtn.onclick = () => {
        levelsModal.style.display = 'flex';
        if (levelsData.length > 0) {
            showLevelDetails(0);
        }
    };
    
    // Закрытие модала
    closeBtn.onclick = () => {
        levelsModal.style.display = 'none';
    };
    
    levelsModal.onclick = event => {
        if (event.target === levelsModal) levelsModal.style.display = 'none';
    };
}

function showLevelDetails(index) {
  const level = levelsData[index];
  if (!level) return;
  const previous = index ? levelsData[index - 1] : null;
  const details = document.getElementById("levelDetails");
  const list = document.getElementById("levelsList");
  [...list.children].forEach((item, i) => item.classList.toggle("active", i === index));
  const box = document.createElement("div");
  box.className = "level-details-content";
  const title = document.createElement("h3");
  title.textContent = level.name || "Уровень";
  box.append(title);

  const badges = document.createElement("div");
  badges.className = "level-badges-container";
  const levelNum = Number(level.order) || index + 1;
  const fallbackName = levelNum >= 10 ? "10+" : String(levelNum);
  const images = [
    level.outline === "-" ? "" : (level.outline || "Outline/" + fallbackName + " LVL.jpg.png"),
    level.rang === "-" ? "" : (level.rang || "Rangers/" + fallbackName + " LVL.jpg.png")
  ];
  images.forEach((value, i) => {
    const url = safeMediaURL(value);
    if (!url) return;
    const wrapper = document.createElement("div");
    wrapper.className = "level-badge-wrapper";
    const img = document.createElement("img");
    img.src = url;
    img.alt = i ? "Ранг" : "Обводка";
    img.className = "level-badge";
    img.onerror = () => wrapper.remove();
    const preview = document.createElement("div");
    preview.className = "level-badge-preview";
    const large = img.cloneNode();
    large.className = "level-badge-preview-img";
    preview.append(large); wrapper.append(img, preview); badges.append(wrapper);
  });
  if (badges.children.length) box.append(badges);
  [["Диапазон", level.oil], ["Цвет", level.color], ["Тег", level.teg]].forEach(([label, value]) => {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    p.append(strong, document.createTextNode(value || "—"));
    box.append(p);
  });
  const section = document.createElement("div");
  section.className = "level-advantages";
  const caption = document.createElement("h4");
  caption.textContent = "Преимущества:";
  section.append(caption);
  const ul = document.createElement("ul");
  const advantages = Array.isArray(level.advantages) ? level.advantages : [];
  const old = previous && Array.isArray(previous.advantages) ? previous.advantages : [];
  advantages.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    if (!old.includes(text)) {
      li.className = "new-advantage";
      const tag = document.createElement("span");
      tag.className = "new-badge";
      tag.textContent = " [NEW]";
      li.append(tag);
    }
    ul.append(li);
  });
  old.filter(text => !advantages.includes(text)).forEach(text => {
    const li = document.createElement("li");
    li.className = "removed-advantage";
    li.textContent = text;
    ul.append(li);
  });
  section.append(ul);box.append(section);details.replaceChildren(box);
}

async function loadWorkers() {
  try {
    const response = await fetch("./Workers/Crafters.txt");
    if (!response.ok) throw Error("HTTP " + response.status);
    const backupWorkers = parseWorkers(await response.text());
    if (!firestoreWorkersLoaded) renderWorkers(backupWorkers);
  } catch (error) {
    console.warn("Ошибка резервной загрузки команды", error);
    document.getElementById("workersList").textContent = "Не удалось загрузить резервный список.";
  }
}

function parseWorkers(text) {
  const workers = [];
  text.split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#")).forEach(line => {
    const parts = line.split(":");
    if (parts.length < 7) return;
    const id = Number(parts[0]);
    if (!Number.isSafeInteger(id) || id <= 0) return;
    workers.push({
      id, class: parts[1], job: parts[2], xp: parts[3], name: parts[4],
      user: parts[5], photo: parts[6], badge: parts[7] || "",
      badge_2: parts[8] || "", badge_3: parts[9] || "",
      color: parts[10] || "cyan", teg: parts[11] || "",
      nameColor: parts[12] || "", outline: parts[13] || "", range: parts[14] || ""
    });
  });
  return workers.sort((a, b) => a.id - b.id);
}

function parseXPValue(xpString) {
    if (!xpString) return 0;
    
    const str = xpString.toString().trim().toLowerCase();
    
    // Проверяем на k (тысячи)
    if (str.includes('k')) {
        const num = parseFloat(str.replace('k', ''));
        return isNaN(num) ? 0 : num * 1000;
    }
    
    // Проверяем на m (миллионы)
    if (str.includes('m')) {
        const num = parseFloat(str.replace('m', ''));
        return isNaN(num) ? 0 : num * 1000000;
    }
    
    // Обычное число
    const num = parseInt(str);
    return isNaN(num) ? 0 : num;
}

// ИСПРАВЛЕННАЯ функция парсинга XP с тремя показателями
function parseXP(xpString) {
    // Формат: "0/40000 30000" - 0(начало), 40000(конец), 30000(текущий прогресс пользователя)
    const parts = xpString.trim().split(/\s+/);
    
    let xpValue = parts[0]; // "0/40000"
    let xpProgress = parts[1] || null; // "30000" - текущий прогресс пользователя
    
    let isCompleted = false;
    let xpStart = null;
    let xpCurrent = null;
    let xpMax = null;
    let xpPercent = 0;
    let stage = null;
    
    if (xpValue.includes('/')) {
        // В процессе: "0/40000"
        const progressParts = xpValue.split('/');
        xpStart = parseXPValue(progressParts[0]);
        xpMax = parseXPValue(progressParts[1]);
        
        // Если есть прогресс пользователя, используем его
        if (xpProgress) {
            const userProgress = parseXPValue(xpProgress);
            xpCurrent = userProgress;
            if (xpMax > 0) {
                xpPercent = (userProgress / xpMax) * 100;
                // Ограничиваем до 100%
                if (xpPercent > 100) xpPercent = 100;
            }
            stage = null;
        } else if (xpStart !== null && xpMax !== null && xpMax > 0) {
            xpCurrent = xpStart;
            xpPercent = (xpStart / xpMax) * 100;
        }
        
        isCompleted = false;
    } else {
        // Пройден полностью
        isCompleted = true;
        xpPercent = 100;
        stage = xpValue;
    }
    
    return {
        xpStart,
        xpCurrent,
        xpMax,
        xpPercent,
        isCompleted,
        stage,
        xpValue
    };
}

function isVideoMedia(path) {
    if (!path) return false;
    const ext = path.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov', 'avi'].includes(ext);
}

function createMediaElement(mediaPath, className = "", attributes = "") {
  const url = safeMediaURL(mediaPath);
  if (!url) return "";
  const safe = escapeHTML(url);
  if (isVideoMedia(url) && !url.toLowerCase().endsWith(".gif")) {
    return '<video class="' + className + '" autoplay muted loop playsinline preload="none" ' + attributes + '><source src="' + safe + '"></video>';
  }
  return '<img src="' + safe + '" alt="Изображение" loading="lazy" class="' + className + '" ' + attributes + '>';
}

function isNumeric(str) {
    return /^\d+$/.test(str.trim());
}

// Получение изображения уровня
function getRangerImage(classValue) {
    if (!isNumeric(classValue)) return null;
    
    const num = parseInt(classValue);
    if (num >= 1 && num <= 9) {
        return `./Rangers/${num} LVL.jpg.png`;
    } else if (num >= 10) {
        return './Rangers/10+ LVL.jpg.png';
    }
    return null;
}

// Получение изображения обводки (ранга)
function getOutlineImage(classValue, customOutline) {
  if (customOutline === "-") return null;
  if (customOutline && String(customOutline).trim()) return safeMediaURL(customOutline);
  if (!isNumeric(String(classValue))) return null;
  const num = Number(classValue);
  if (num < 1) return null;
  return "./Outline/" + (num >= 10 ? "10+" : num) + " LVL.jpg.png";
}

function isHexColor(str) {
    return /^#[0-9A-F]{6}$/i.test(str);
}

// Функция для создания RGB из HEX
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Создание CSS переменных для кастомного цвета
function createCustomColorStyle(hexColor) {
    if (!isHexColor(hexColor)) return null;
    
    const rgb = hexToRgb(hexColor);
    if (!rgb) return null;
    
    return {
        hex: hexColor,
        bg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
        bg2: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`
    };
}

// ✅ НОВОЕ: Создание партиклей для уровня 10+
function createParticles(cardElement, colorValue) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    
    // Определяем цвет для партиклей
    let particleColor = '#00ffff';
    if (isHexColor(colorValue)) {
        particleColor = colorValue;
    } else if (colorMap[colorValue]) {
        particleColor = colorMap[colorValue].hex;
    }
    
    // Создаём 10-15 партиклей
    const particleCount = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.backgroundColor = particleColor;
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        particlesContainer.appendChild(particle);
    }
    
    cardElement.appendChild(particlesContainer);
}

function createWorkerCard(worker) {
    // Любые поля, поступающие из Firestore, считаются непроверенным вводом.
    worker = Object.assign({}, worker);
    ["name","job","class","xp","teg"].forEach(key => worker[key] = escapeHTML(worker[key]));
    ["photo","badge","badge_2","badge_3","outline","range"].forEach(key => worker[key] = safeMediaURL(worker[key]) || (worker[key] === "-" ? "-" : ""));
    worker.color = safeColor(worker.color);
    worker.nameColor = /^#[0-9a-fA-F]{6}$/.test(String(worker.nameColor || "")) ? worker.nameColor : "";
    worker.user = String(worker.user || "").trim();

    const card = document.createElement('div');
    card.className = 'worker-card';
    card.dataset.workerId = worker.id;
    
    const xpData = parseXP(worker.xp);

    // Создаём HTML для бейджей (только если они указаны)
    let badgesHTML = '';
    if (worker.badge && worker.badge.trim() !== '-' && worker.badge.trim() !== '') {
        badgesHTML += createMediaElement(worker.badge, 'badge', 'title="Badge 1"');
    }
    if (worker.badge_2 && worker.badge_2.trim() !== '-' && worker.badge_2.trim() !== '') {
        badgesHTML += createMediaElement(worker.badge_2, 'badge', 'title="Badge 2"');
    }
    if (worker.badge_3 && worker.badge_3.trim() !== '-' && worker.badge_3.trim() !== '') {
        badgesHTML += createMediaElement(worker.badge_3, 'badge', 'title="Badge 3"');
    }

    // Только разрешённые ссылки — не допускаем javascript: или опасный HTML.
    let profileLink = "#";
    const userDisplay = worker.name;
    if (/^@[A-Za-z0-9_]{3,32}$/.test(worker.user)) {
      profileLink = "https://t.me/" + worker.user.slice(1);
    } else if (/^https?:\/\/\S+$/i.test(worker.user)) {
      try {
        const url = new URL(worker.user);
        if (["https:", "http:"].includes(url.protocol)) profileLink = url.href;
      } catch (_) {}
    } else if (/^[A-Za-z0-9_-]{1,39}$/.test(worker.user)) {
      profileLink = "https://github.com/" + worker.user;
    }

    // Применяем цвет из TXT файла (поддержка HEX и названий)
    applyColorToCard(card, worker.color);

    // Строим XP секцию с анимацией
    let xpHTML = '';
    if (xpData.isCompleted) {
        xpHTML = `
            <div class="xp-container">
                <div class="xp-label">ЭТАП ПРОЙДЕН</div>
                <div class="xp-bar">
                    <div class="xp-fill xp-animate" style="width: 100%"></div>
                    ${xpData.stage ? `<span class="xp-stage">${xpData.stage}</span>` : ''}
                </div>
            </div>
        `;
    } else {
        xpHTML = `
            <div class="xp-container">
                <div class="xp-label">XP ДО СЛЕДУЮЩЕГО УРОВНЯ</div>
                <div class="xp-bar-wrapper">
                    <span class="xp-start">${xpData.xpStart}</span>
                    <div class="xp-bar">
                        <div class="xp-fill xp-animate" style="width: 0%" data-target="${xpData.xpPercent}">
                            <span class="xp-progress-text">${xpData.xpCurrent}</span>
                        </div>
                    </div>
                    <span class="xp-end">${xpData.xpMax}</span>
                </div>
            </div>
        `;
    }

    // Класс с изображением или текстом
    let classHTML = '';
    const rangerImage = getRangerImage(worker.class);
    
    if (rangerImage) {
        classHTML = `
            <div class="worker-class-with-image">
                <div class="class-image-container">
                    <img src="${rangerImage}" alt="Level" class="class-image">
                    <div class="class-level-text">${worker.class}</div>
                </div>
                <div class="worker-job">${worker.job}</div>
            </div>
        `;
    } else {
        // Логика для текстовых классов
        const classDisplay = /^\d+$/.test(worker.class) ? `Уровень ${worker.class}` : `${worker.class}`;
        classHTML = `<div class="worker-class">${classDisplay} • ${worker.job}</div>`;
    }

    // Тег перед именем
    let tagHTML = '';
    if (worker.teg && worker.teg.trim() !== '-' && worker.teg.trim() !== '') {
        tagHTML = `<span class="worker-tag">${worker.teg}</span>`;
    }

    // Получаем обводку
    const outlineImage = getOutlineImage(worker.class, worker.outline);

    // Аватар с обводкой
    let avatarHTML = `
        <div class="avatar-container">
            ${createMediaElement(worker.photo, 'avatar')}
            ${outlineImage ? `<img src="${outlineImage}" alt="Outline" class="avatar-outline">` : ''}
        </div>
    `;

    // Применяем кастомный цвет имени если есть
    const nameStyle = worker.nameColor ? 'style="color: ' + worker.nameColor + '"' : '';

    card.innerHTML = `
        ${avatarHTML}
        
        <div class="worker-info">
            ${tagHTML}
            <a href="${escapeHTML(profileLink)}" target="_blank" rel="noopener noreferrer" class="worker-name" ${nameStyle}>
                ${userDisplay}
            </a>
            ${badgesHTML ? `<div class="badges-container">${badgesHTML}</div>` : ''}
        </div>

        ${classHTML}

        ${xpHTML}
    `;

    // ✅ НОВОЕ: Добавляем партикли если уровень >= 10
    const classNum = isNumeric(worker.class) ? parseInt(worker.class) : 0;
    if (classNum >= 10) {
        createParticles(card, worker.color);
    }

    // У отсутствующих файлов скрываем пустую картинку, аватар заменяем буквой.
    card.querySelectorAll("img").forEach(img => {
      img.addEventListener("error", () => {
        if (img.classList.contains("avatar")) {
          const placeholder = document.createElement("span");
          placeholder.className = "avatar-fallback";
          placeholder.textContent = (worker.name || "?").replace(/&[^;]+;/g, "").charAt(0).toUpperCase() || "?";
          img.replaceWith(placeholder);
        } else {
          img.remove();
        }
      }, { once: true });
    });

    // Запускаем Intersection Observer для видео
    const videos = card.querySelectorAll('video');
    videos.forEach(video => {
        observeMediaElement(video);
    });

    // Запускаем анимацию XP когда карточка появляется на экране
    const xpFill = card.querySelector('.xp-animate');
    if (xpFill && xpFill.dataset.target) {
        observeXPAnimation(xpFill);
    }

    return card;
}

// Intersection Observer для анимации XP
function observeXPAnimation(element) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !element.classList.contains('animated')) {
                const targetPercent = parseFloat(element.dataset.target);
                element.style.width = targetPercent + '%';
                element.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(element);
}

// Intersection Observer для остановки видео за пределами экрана
function observeMediaElement(mediaElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                mediaElement.play().catch(() => {});
            } else {
                mediaElement.pause();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(mediaElement);
}

let allWorkers = [];
function renderWorkers(workers) {
  allWorkers = Array.isArray(workers) ? workers : [];
  const list = document.getElementById("workersList");
  const query = (document.getElementById("workerSearch")?.value || "").toLocaleLowerCase().trim();
  const filtered = allWorkers.filter(worker =>
    [worker.name,worker.user,worker.job,worker.teg,worker.class].some(v => String(v ?? "").toLocaleLowerCase().includes(query))
  );
  list.replaceChildren();
  document.getElementById("workersCount").textContent = String(allWorkers.length);
  if (!filtered.length) {
    const p = document.createElement("p");
    p.textContent = allWorkers.length ? "Ничего не найдено" : "Участников пока нет";
    p.className = "empty-message";
    list.append(p);
    return;
  }
  filtered.forEach(worker => list.append(createWorkerCard(worker)));
}
let firestoreWorkersLoaded = false;
window.applyFirestoreWorkers = data => { firestoreWorkersLoaded = true; renderWorkers(data); };
window.applyFirestoreLevels = data => { levelsData = data; initLevelsModal(); };
window.loadWorkers = () => { firestoreWorkersLoaded = false; return loadWorkers(); };
window.loadLevels = loadLevels;
window.applySiteSettings = settings => {
  const title = document.querySelector(".project-title");
  const subtitle = document.querySelector(".project-subtitle");
  if (title) title.textContent = settings.title || "⚡ Мои Рабочие";
  if (subtitle) subtitle.textContent = settings.subtitle || "Список команды разработчиков и специалистов";
  let overlay = document.getElementById("siteMaintenance");
  if (settings.maintenance) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "siteMaintenance";
      overlay.setAttribute("role", "alert");
      overlay.className = "maintenance-overlay";
      const h = document.createElement("h1");
      h.textContent = "⚙️ Технический перерыв";
      const p = document.createElement("p");
      overlay.append(h,p);document.body.append(overlay);
    }
    overlay.querySelector("p").textContent = settings.maintenanceText || "Сайт временно недоступен, ведутся работы";
  } else if (overlay) {
    overlay.remove();
  }
};
document.getElementById("workerSearch")?.addEventListener("input", () => renderWorkers(allWorkers));


// Применяем цвет к карточке через CSS переменные (поддержка HEX и названий)
function applyColorToCard(card, colorValue) {
    let color;
    
    // Проверяем, это HEX цвет или название
    if (isHexColor(colorValue)) {
        color = createCustomColorStyle(colorValue);
    } else {
        color = colorMap[colorValue] || colorMap.cyan;
    }
    
    if (color) {
        card.style.setProperty('--card-color', color.hex);
        card.style.setProperty('--card-bg', color.bg);
        card.style.setProperty('--card-bg-2', color.bg2);
    }
}

// ===== СНЕЖНАЯ АНИМАЦИЯ =====
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const snowflakes = [];
const maxFlakes = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (window.innerWidth <= 600 ? 35 : 80);

for (let i = 0; i < maxFlakes; i++) {
    snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
    });
}

function drawSnow() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();

    for (let f of snowflakes) {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    }

    ctx.fill();
    updateSnow();
}

function updateSnow() {
    for (let f of snowflakes) {
        f.y += f.speed;
        f.x += Math.sin(f.y / height * Math.PI * 2) * 0.5;

        if (f.y > height) f.y = 0;
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;
    }

    requestAnimationFrame(drawSnow);
}

drawSnow();

// TXT используется как стартовый список и резерв при отключённом Firebase.
window.addEventListener('load', () => {
    loadWorkers();
    loadLevels();
});
