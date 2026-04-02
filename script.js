// Таблица цветов для быстрого доступа
const colorMap = {
    cyan: { hex: '#00ffff', rgb: 'rgb(0, 255, 255)', bg: 'rgba(0, 255, 255, 0.2)', bg2: 'rgba(168, 85, 247, 0.1)' },
    purple: { hex: '#a855f7', rgb: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.2)', bg2: 'rgba(0, 255, 200, 0.05)' },
    gold: { hex: '#ffd700', rgb: 'rgb(255, 215, 0)', bg: 'rgba(255, 215, 0, 0.2)', bg2: 'rgba(255, 165, 0, 0.1)' },
    green: { hex: '#00ff88', rgb: 'rgb(0, 255, 136)', bg: 'rgba(0, 255, 136, 0.2)', bg2: 'rgba(0, 200, 100, 0.1)' },
    pink: { hex: '#ff69b4', rgb: 'rgb(255, 105, 180)', bg: 'rgba(255, 105, 180, 0.2)', bg2: 'rgba(255, 20, 147, 0.1)' },
    orange: { hex: '#ff8c00', rgb: 'rgb(255, 140, 0)', bg: 'rgba(255, 140, 0, 0.2)', bg2: 'rgba(255, 100, 0, 0.1)' },
    red: { hex: '#ff4545', rgb: 'rgb(255, 69, 69)', bg: 'rgba(255, 69, 69, 0.2)', bg2: 'rgba(255, 0, 0, 0.1)' },
    blue: { hex: '#1e90ff', rgb: 'rgb(30, 144, 255)', bg: 'rgba(30, 144, 255, 0.2)', bg2: 'rgba(0, 102, 204, 0.1)' }
};

// Классы градиентов (RGB:Цвет-Цвет)
const gradientMap = {
    'RGB': { gradient: 'linear-gradient(135deg, #00ffff 0%, #1e90ff 100%)', name: 'RGB' },
    'Grad:Cyan-Purple': { gradient: 'linear-gradient(135deg, #00ffff 0%, #a855f7 100%)', name: 'Cyan-Purple' },
    'Grad:Gold-Green': { gradient: 'linear-gradient(135deg, #ffd700 0%, #00ff88 100%)', name: 'Gold-Green' },
    'Grad:Pink-Red': { gradient: 'linear-gradient(135deg, #ff69b4 0%, #ff4545 100%)', name: 'Pink-Red' },
    'Grad:Orange-Gold': { gradient: 'linear-gradient(135deg, #ff8c00 0%, #ffd700 100%)', name: 'Orange-Gold' },
    'Grad:Blue-Cyan': { gradient: 'linear-gradient(135deg, #1e90ff 0%, #00ffff 100%)', name: 'Blue-Cyan' },
    'Grad:Purple-Pink': { gradient: 'linear-gradient(135deg, #a855f7 0%, #ff69b4 100%)', name: 'Purple-Pink' },
    'Grad:Green-Cyan': { gradient: 'linear-gradient(135deg, #00ff88 0%, #00ffff 100%)', name: 'Green-Cyan' },
    'Grad:Red-Orange': { gradient: 'linear-gradient(135deg, #ff4545 0%, #ff8c00 100%)', name: 'Red-Orange' },
    'Grad:Gold-Red': { gradient: 'linear-gradient(135deg, #ffd700 0%, #ff4545 100%)', name: 'Gold-Red' },
    'Grad:Purple-Blue': { gradient: 'linear-gradient(135deg, #a855f7 0%, #1e90ff 100%)', name: 'Purple-Blue' },
    'Grad:Green-Gold': { gradient: 'linear-gradient(135deg, #00ff88 0%, #ffd700 100%)', name: 'Green-Gold' }
};

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
                gradient: parts[11] || 'RGB'
            });
        }
    });

    workers.sort((a, b) => a.id - b.id);
    return workers;
}

function parseXP(xpString) {
    const parts = xpString.trim().split(/\s+/);
    
    let xpValue = parts[0];
    let stage = parts[1] || null;
    
    let isCompleted = false;
    let xpCurrent = null;
    let xpMax = null;
    let xpPercent = 100;
    
    if (xpValue.includes('/')) {
        const progressParts = xpValue.split('/');
        xpCurrent = parseInt(progressParts[0]);
        xpMax = parseInt(progressParts[1]);
        
        if (!isNaN(xpCurrent) && !isNaN(xpMax)) {
            xpPercent = (xpCurrent / xpMax) * 100;
            isCompleted = false;
        } else {
            isCompleted = true;
            stage = xpValue;
        }
    } else {
        isCompleted = true;
        xpPercent = 100;
        stage = stage || xpValue;
    }
    
    return {
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

function createWorkerCard(worker) {
    const card = document.createElement('div');
    card.className = 'worker-card';
    card.dataset.workerId = worker.id;
    
    const xpData = parseXP(worker.xp);

    let badgesHTML = '';
    if (worker.badge) {
        badgesHTML += createMediaElement(worker.badge, 'badge', 'title="Badge 1"');
    }
    if (worker.badge_2) {
        badgesHTML += createMediaElement(worker.badge_2, 'badge', 'title="Badge 2"');
    }
    if (worker.badge_3) {
        badgesHTML += createMediaElement(worker.badge_3, 'badge', 'title="Badge 3"');
    }

    const photoUrl = `./${worker.photo}`;

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

    applyColorToCard(card, worker.color, worker.gradient);

    let xpHTML = '';
    if (xpData.isCompleted) {
        xpHTML = `
            <div class="xp-container">
                <div class="xp-label">ЭТАП ПРОЙДЕН</div>
                <div class="xp-bar">
                    <div class="xp-fill" style="width: 100%"></div>
                    ${xpData.stage ? `<span class="xp-stage">${xpData.stage}</span>` : ''}
                </div>
            </div>
        `;
    } else {
        xpHTML = `
            <div class="xp-container">
                <div class="xp-label">XP ДО СЛЕДУЮЩЕГО УРОВНЯ</div>
                <div class="xp-bar-wrapper">
                    <span class="xp-start">${xpData.xpCurrent}</span>
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: ${xpData.xpPercent}%"></div>
                        ${xpData.stage ? `<span class="xp-stage">${xpData.stage}</span>` : ''}
                    </div>
                    <span class="xp-end">${xpData.xpMax}</span>
                </div>
            </div>
        `;
    }

    let avatarHTML = `
        <div class="avatar-container">
            ${createMediaElement(worker.photo, 'avatar')}
        </div>
    `;

    card.innerHTML = `
        ${avatarHTML}
        
        <div class="worker-info">
            <a href="${profileLink}" target="_blank" class="worker-name">
                ${userDisplay}
            </a>
            ${badgesHTML ? `<div class="badges-container">${badgesHTML}</div>` : ''}
        </div>

        <div class="worker-class">Уровень ${worker.class} • ${worker.job}</div>

        ${xpHTML}
    `;

    const videos = card.querySelectorAll('video');
    videos.forEach(video => {
        observeMediaElement(video);
    });

    return card;
}

function observeMediaElement(mediaElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                mediaElement.play().catch(() => {});
            } else {
                mediaElement.pause();
            }
        });
    }, {
        threshold: 0.1
    });

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

function applyColorToCard(card, colorName, gradientName) {
    const color = colorMap[colorName] || colorMap.cyan;
    const gradient = gradientMap[gradientName] || gradientMap['RGB'];
    
    if (color) {
        card.style.setProperty('--card-color', color.hex);
        card.style.setProperty('--card-color-rgb', color.rgb);
        card.style.setProperty('--card-bg', color.bg);
        card.style.setProperty('--card-bg-2', color.bg2);
    }
    
    if (gradient) {
        card.style.setProperty('--card-gradient', gradient.gradient);
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

window.addEventListener('load', loadWorkers);
