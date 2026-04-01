// Таблица цветов для быстрого доступа
const colorMap = {
    cyan: { hex: '#00ffff', bg: 'rgba(0, 255, 255, 0.2)', bg2: 'rgba(168, 85, 247, 0.1)' },
    purple: { hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', bg2: 'rgba(0, 255, 200, 0.05)' },
    gold: { hex: '#ffd700', bg: 'rgba(255, 215, 0, 0.2)', bg2: 'rgba(255, 165, 0, 0.1)' },
    green: { hex: '#00ff88', bg: 'rgba(0, 255, 136, 0.2)', bg2: 'rgba(0, 200, 100, 0.1)' },
    pink: { hex: '#ff69b4', bg: 'rgba(255, 105, 180, 0.2)', bg2: 'rgba(255, 20, 147, 0.1)' },
    orange: { hex: '#ff8c00', bg: 'rgba(255, 140, 0, 0.2)', bg2: 'rgba(255, 100, 0, 0.1)' },
    red: { hex: '#ff4545', bg: 'rgba(255, 69, 69, 0.2)', bg2: 'rgba(255, 0, 0, 0.1)' },
    blue: { hex: '#1e90ff', bg: 'rgba(30, 144, 255, 0.2)', bg2: 'rgba(0, 102, 204, 0.1)' }
};

// Путь к изображениям из TLwebsite
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/toolgool2021-coder/TLwebsite/main/images/';

// Загрузка рабочих из TXT
async function loadWorkers() {
    try {
        const response = await fetch('Workers/Crafters.txt');
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
                craft: parts[2],
                xp: parts[3],
                name: parts[4],
                user: parts[5],
                photo: parts[6],
                badge: parts[7] || '',
                color: parts[8] || 'cyan'
            });
        }
    });

    // Сортировка по ID
    workers.sort((a, b) => a.id - b.id);
    return workers;
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

function getImageUrl(photoPath) {
    // Если это просто имя файла (например "icon.jpg"), берём с TLwebsite
    if (!photoPath.includes('/')) {
        return IMAGE_BASE_URL + photoPath;
    }
    
    // Если это путь (например "Image/avatar.jpg"), берём имя файла
    const fileName = photoPath.split('/').pop();
    return IMAGE_BASE_URL + fileName;
}

function createWorkerCard(worker) {
    const card = document.createElement('div');
    card.className = 'worker-card';
    card.dataset.workerId = worker.id;
    
    const xpParts = worker.xp.split('/');
    let xpCurrent = parseInt(xpParts[0]);
    let xpMax = parseInt(xpParts[1]);
    let xpPercent = 100;
    
    // Если XP не число (например ⛩), то показываем полную полоску
    if (isNaN(xpCurrent)) {
        xpPercent = 100;
        xpCurrent = worker.xp;
    } else {
        xpPercent = (xpCurrent / xpMax) * 100;
    }

    let badgeHTML = '';
    if (worker.badge) {
        const badgeUrl = getImageUrl(worker.badge);
        badgeHTML = `<img src="${badgeUrl}" alt="badge" class="badge" title="Badge" onerror="this.style.display='none'">`;
    }

    // Получаем правильный URL для аватарки
    const photoUrl = getImageUrl(worker.photo);

    // Определяем ссылку - если это t.me ссылка, берём из user напрямую, иначе GitHub
    let profileLink = '';
    let isTelegram = false;
    
    if (worker.user.includes('t.me/') || worker.user.includes('telegram')) {
        profileLink = `https://${worker.user}`;
        isTelegram = true;
    } else if (worker.user.includes('http')) {
        profileLink = worker.user;
    } else {
        // Если это просто username, предполагаем GitHub
        profileLink = `https://github.com/${worker.user}`;
    }

    // Применяем цвет из TXT файла
    applyColorToCard(card, worker.color);

    card.innerHTML = `
        <img src="${photoUrl}" alt="${worker.name}" class="avatar" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
        
        <div class="worker-info">
            <a href="${profileLink}" target="_blank" class="worker-name" title="${isTelegram ? 'Telegram' : 'GitHub'}">
                ${worker.name}
                ${badgeHTML}
            </a>
        </div>

        <div class="worker-class">Уровень ${worker.class} • ${worker.craft}</div>

        <div class="xp-container">
            <div class="xp-label">XP ДО СЛЕДУЮЩЕГО УРОВНЯ</div>
            <div class="xp-bar">
                <div class="xp-fill" style="width: ${xpPercent}%"></div>
            </div>
            <div class="xp-text">${worker.xp} XP</div>
        </div>
    `;

    return card;
}

// Применяем цвет к карточке через CSS переменные
function applyColorToCard(card, colorName) {
    const color = colorMap[colorName] || colorMap.cyan;
    if (color) {
        card.style.setProperty('--card-color', color.hex);
        card.style.setProperty('--card-bg', color.bg);
        card.style.setProperty('--card-bg-2', color.bg2);
    }
}

// ===== СНЕЖНАЯ АНИМАЦИЯ (МЕДЛЕННЕЕ) =====
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snowflakes = [];

function createSnowflake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        radius: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        vx: Math.random() * 0.3 - 0.15,
        vy: Math.random() * 0.8 + 0.3
    };
}

for (let i = 0; i < 30; i++) {
    snowflakes.push(createSnowflake());
}

function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    snowflakes.forEach(flake => {
        flake.x += flake.vx;
        flake.y += flake.vy;

        if (flake.y > canvas.height) {
            flake.y = -10;
            flake.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animateSnow);
}

animateSnow();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Загружаем рабочих при загрузке страницы
window.addEventListener('load', loadWorkers);
