const colors = ['cyan', 'purple', 'gold', 'green', 'pink', 'orange', 'red', 'blue'];

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

function createWorkerCard(worker) {
    const card = document.createElement('div');
    card.className = `worker-card color-${worker.color}`;
    
    const xpParts = worker.xp.split('/');
    const xpCurrent = parseInt(xpParts[0]);
    const xpMax = parseInt(xpParts[1]);
    const xpPercent = (xpCurrent / xpMax) * 100;

    let badgeHTML = '';
    if (worker.badge) {
        badgeHTML = `<img src="${worker.badge}" alt="badge" class="badge" title="Badge">`;
    }

    card.innerHTML = `
        <button class="color-picker-btn" onclick="toggleColorMenu(event)">
            <i class="fas fa-palette"></i>
        </button>
        <div class="color-menu" data-worker-id="${worker.id}">
            ${colors.map(color => `
                <div class="color-option ${color}" onclick="setWorkerColor(${worker.id}, '${color}', event)"></div>
            `).join('')}
        </div>

        <img src="${worker.photo}" alt="${worker.name}" class="avatar" onerror="this.src='https://via.placeholder.com/150'">
        
        <div class="worker-info">
            <a href="https://github.com/${worker.user}" target="_blank" class="worker-name">
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

function toggleColorMenu(event) {
    event.stopPropagation();
    const card = event.target.closest('.worker-card');
    const menu = card.querySelector('.color-menu');
    
    // Закрываем все остальные меню
    document.querySelectorAll('.color-menu.active').forEach(m => {
        if (m !== menu) m.classList.remove('active');
    });
    
    menu.classList.toggle('active');
}

function setWorkerColor(workerId, color, event) {
    event.stopPropagation();
    
    const card = event.target.closest('.worker-card');
    const oldColor = [...card.classList].find(c => c.startsWith('color-'));
    
    if (oldColor) {
        card.classList.remove(oldColor);
    }
    
    card.classList.add(`color-${color}`);
    card.querySelector('.color-menu').classList.remove('active');

    // Сохраняем в localStorage
    const workerId_stored = card.querySelector('.color-menu').dataset.workerId;
    localStorage.setItem(`worker-color-${workerId_stored}`, color);
}

// Загружаем сохранённые цвета при загрузке страницы
window.addEventListener('load', () => {
    loadWorkers();
    
    setTimeout(() => {
        document.querySelectorAll('.worker-card').forEach(card => {
            const workerId = card.querySelector('.color-menu').dataset.workerId;
            const savedColor = localStorage.getItem(`worker-color-${workerId}`);
            
            if (savedColor) {
                const oldColor = [...card.classList].find(c => c.startsWith('color-'));
                if (oldColor) card.classList.remove(oldColor);
                card.classList.add(`color-${savedColor}`);
            }
        });
    }, 100);
});

// Закрываем меню при клике вне
document.addEventListener('click', () => {
    document.querySelectorAll('.color-menu.active').forEach(m => m.classList.remove('active'));
});

// СНЕЖНАЯ АНИМАЦИЯ
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
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 2 + 1
    };
}

for (let i = 0; i < 50; i++) {
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
