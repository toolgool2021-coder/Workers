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
    legend: { hex: '#ff8c42', bg: 'rgba(255, 140, 66, 0.2)', bg2: 'rgba(184, 134, 11, 0.1)' }
};

// Таблица уровней с преимуществами
let levelsData = [];

// Загрузка уровней из Class/List.txt
async function loadLevels() {
    try {
        const response = await fetch('./Class/List.txt');
        const text = await response.text();
        levelsData = parseLevels(text);
        initLevelsModal();
    } catch (error) {
        console.error('Ошибка загрузки уровней:', error);
    }
}

function parseLevels(text) {
    const levels = [];
    const blocks = text.split('{').filter(block => block.trim());
    
    blocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim());
        const level = {};
        
        lines.forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
                if (key.toLowerCase() === 'name') {
                    level.name = value;
                } else if (key.toLowerCase() === 'oil') {
                    level.oil = value;
                } else if (key.toLowerCase() === 'color') {
                    level.color = value;
                } else if (key.toLowerCase() === 'teg') {
                    level.teg = value;
                } else if (key.toLowerCase() === 'advantages') {
                    level.advantages = value.split(',').map(a => a.trim());
                }
            }
        });
        
        if (level.name) {
            levels.push(level);
        }
    });
    
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
        levelItem.innerHTML = `<span>${level.name}</span>`;
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
    
    window.onclick = (event) => {
        if (event.target === levelsModal) {
            levelsModal.style.display = 'none';
        }
    };
}

function showLevelDetails(index) {
    const level = levelsData[index];
    const prevLevel = index > 0 ? levelsData[index - 1] : null;
    const levelDetails = document.getElementById('levelDetails');
    const levelsList = document.getElementById('levelsList');
    
    // Убираем активный класс со всех
    document.querySelectorAll('.level-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Добавляем активный класс текущему
    levelsList.children[index].classList.add('active');
    
    // Анализируем преимущества
    let advantagesHTML = '';
    
    if (level.advantages && level.advantages.length > 0) {
        const prevAdvantages = prevLevel ? prevLevel.advantages : [];
        
        advantagesHTML = '<ul>';
        
        level.advantages.forEach(adv => {
            const isNew = !prevAdvantages.includes(adv);
            
            let advClass = '';
            let newBadge = '';
            
            if (isNew) {
                advClass = 'new-advantage';
                newBadge = '<span class="new-badge">[NEW]</span>';
            }
            
            advantagesHTML += `
                <li class="${advClass}">
                    <span>${adv}</span>
                    ${newBadge}
                </li>
            `;
        });
        
        // Добавляем убранные преимущества
        if (prevAdvantages.length > level.advantages.length) {
            prevAdvantages.forEach(prevAdv => {
                if (!level.advantages.includes(prevAdv)) {
                    advantagesHTML += `<li class="removed-advantage"><span>${prevAdv}</span></li>`;
                }
            });
        }
        
        advantagesHTML += '</ul>';
    }
    
    // ✅ НОВОЕ: Мини бейджи как badges (50x50) с превью
    let outlineRangeBadgesHTML = '';
    const levelNum = index + 1;
    
    // Определяем обводку по уровню
    let outlineImage = null;
    if (levelNum >= 1 && levelNum <= 9) {
        outlineImage = `./Outline/${levelNum} LVL.jpg.png`;
    } else if (levelNum >= 10) {
        outlineImage = './Outline/10 LVL.jpg.png';
    }
    
    // Определяем ранг (если есть) - по папке Rangers
    let rangeImage = null;
    if (levelNum >= 1 && levelNum <= 9) {
        rangeImage = `./Rangers/${levelNum} LVL.jpg.png`;
    } else if (levelNum >= 10) {
        rangeImage = './Rangers/10+ LVL.jpg.png';
    }
    
    // ✅ НОВОЕ: Если в Crafters.txt стоит "-" или пусто, не показываем
    const hasOutline = outlineImage && !outlineImage.includes('-');
    const hasRange = rangeImage && !rangeImage.includes('-');
    
    if (hasOutline || hasRange) {
        outlineRangeBadgesHTML = '<div class="level-badges-container">';
        
        if (hasOutline) {
            outlineRangeBadgesHTML += `
                <div class="level-badge-wrapper">
                    <img src="${outlineImage}" alt="Outline" class="level-badge">
                    <div class="level-badge-preview">
                        <img src="${outlineImage}" alt="Outline Preview" class="level-badge-preview-img">
                    </div>
                </div>
            `;
        }
        if (hasRange) {
            outlineRangeBadgesHTML += `
                <div class="level-badge-wrapper">
                    <img src="${rangeImage}" alt="Range" class="level-badge">
                    <div class="level-badge-preview">
                        <img src="${rangeImage}" alt="Range Preview" class="level-badge-preview-img">
                    </div>
                </div>
            `;
        }
        
        outlineRangeBadgesHTML += '</div>';
    }
    
    // Показываем детали
    levelDetails.innerHTML = `
        <div class="level-details-content">
            <h3>${level.name}</h3>
            ${outlineRangeBadgesHTML}
            <p class="level-oil"><strong>Диапазон:</strong> ${level.oil}</p>
            <p class="level-color"><strong>Цвет:</strong> ${level.color}</p>
            <p class="level-teg"><strong>Тег:</strong> ${level.teg}</p>
            <div class="level-advantages">
                <h4>Преимущества:</h4>
                ${advantagesHTML}
            </div>
        </div>
    `;
}

// Загрузка рабочих из TXT
async function loadWorkers() {
    try {
        const response = await fetch('./Workers/Crafters.txt');
        const text = await response.text();
        const workers = parseWorkers(text);
        renderWorkers(workers);
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        document.getElementById('workersList').innerHTML = '<p style="text-align: center; color: #ff6b6b;">Ошибка загрузки данных</p>';
    }
}

function parseWorkers(text) {
    const lines = text.trim().split('\n').filter(line => line && !line.startsWith('#'));
    const workers = [];

    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 7) {
            workers.push({
                id: parseInt(parts[0]),
                class: parts[1],
                job: parts[2],
                xp: parts[3],
                name: parts[4],
                user: parts[5],
                photo: parts[6],
                badge: parts[7] || '',
                badge_2: parts[8] || '',
                badge_3: parts[9] || '',
                color: parts[10] || 'cyan',
                teg: parts[11] || '',
                nameColor: parts[12] || '',
                outline: parts[13] || '',
                range: parts[14] || ''
            });
        }
    });

    // Сортировка по ID
    workers.sort((a, b) => a.id - b.id);
    return workers;
}

// Парсинг XP значений с поддержкой k, m и обычных чисел
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
    return ['mp4', 'webm', 'mov', 'avi', 'gif'].includes(ext);
}

function createMediaElement(mediaPath, className = '', attributes = '') {
    if (!mediaPath) return '';
    
    if (isVideoMedia(mediaPath)) {
        return `<video class="${className}" autoplay muted loop playsinline ${attributes}>
            <source src="./${mediaPath}">
            Ваш браузер не поддерживает видео
        </video>`;
    } else {
        return `<img src="./${mediaPath}" alt="media" class="${className}" ${attributes}>`;
    }
}

// Проверка, содержит ли строка только цифры
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
    // ✅ НОВОЕ: Если стоит "-" или пусто, не показываем
    if (customOutline && (customOutline.trim() === '-' || customOutline.trim() === '')) {
        return null;
    }
    
    // Если задана кастомная обводка, используем её
    if (customOutline && customOutline.trim()) {
        return `./${customOutline}`;
    }
    
    // Иначе используем обводку по уровню
    if (!isNumeric(classValue)) return null;
    
    const num = parseInt(classValue);
    if (num >= 1 && num <= 9) {
        return `./Outline/${num} LVL.jpg.png`;
    } else if (num >= 10) {
        return './Outline/10 LVL.jpg.png';
    }
    return null;
}

// Проверка является ли строка HEX цветом
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

    // Определяем ссылку в зависимости от формата user
    let profileLink = '';
    let userDisplay = worker.name;
    
    if (worker.user.includes('@')) {
        const telegramHandle = worker.user.startsWith('@') ? worker.user.substring(1) : worker.user;
        profileLink = `https://t.me/${telegramHandle}`;
    } 
    else if (worker.user.includes('http')) {
        profileLink = worker.user;
    } 
    else {
        profileLink = `https://github.com/${worker.user}`;
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
    const nameStyle = worker.nameColor ? `style="color: ${worker.nameColor}"` : '';

    card.innerHTML = `
        ${avatarHTML}
        
        <div class="worker-info">
            ${tagHTML}
            <a href="${profileLink}" target="_blank" class="worker-name" ${nameStyle}>
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

function renderWorkers(workers) {
    const workersList = document.getElementById('workersList');
    workersList.innerHTML = '';

    if (workers.length === 0) {
        workersList.innerHTML = '<p style="text-align: center; color: #a855f7; grid-column: 1/-1;">Нет данных о рабочих</p>';
        return;
    }

    workers.forEach(worker => {
        const card = createWorkerCard(worker);
        workersList.appendChild(card);
    });
}

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
const maxFlakes = 150;

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

// Загружаем при загрузке страницы
window.addEventListener('load', () => {
    loadWorkers();
    loadLevels();
});
