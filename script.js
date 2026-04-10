// ===== SMOOTH SCROLL BEHAVIOR =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ===== PROJECTS DATA =====
const projects = [
    {
        title: 'Workers Portal',
        description: 'Team management portal with role hierarchy, XP tracking, and real-time progress visualization. Features glassmorphism UI and smooth animations.',
        icon: '👥',
        link: '#'
    },
    {
        title: 'Portfolio v2',
        description: 'Modern developer portfolio with glassmorphism design, gradient animations, and responsive layout. Built with vanilla JavaScript.',
        icon: '🎨',
        link: '#'
    },
    {
        title: 'Web Tools',
        description: 'Collection of web utilities and developer tools. Focus on user experience, performance, and modern web standards.',
        icon: '🛠️',
        link: '#'
    },
    {
        title: 'Design System',
        description: 'Reusable component library with CSS variables, animations, and dark theme support for consistent UI across projects.',
        icon: '✨',
        link: '#'
    }
];

// ===== RENDER PROJECTS =====
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    
    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card fade-in-up';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="project-icon">${project.icon}</div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <a href="${project.link}" class="project-link">
                <span>Explore</span>
                <i class="fas fa-arrow-right"></i>
            </a>
        `;
        
        grid.appendChild(card);
    });
}

// ===== INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ===== NAVBAR SCROLL EFFECT =====
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.8)';
        navbar.style.boxShadow = '0 4px 20px rgba(168, 85, 247, 0.1)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.7)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// ===== PARALLAX EFFECT FOR ORBS =====
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    
    orbs.forEach((orb, index) => {
        const moveX = (e.clientX / window.innerWidth) * (index + 1) * 5;
        const moveY = (e.clientY / window.innerHeight) * (index + 1) * 5;
        
        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Render projects
    renderProjects();
    
    // Add fade-in animation to sections
    document.querySelectorAll('.about-card, .project-card').forEach((element, index) => {
        element.style.opacity = '0';
        element.classList.add('fade-in-up');
        element.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Observe elements for animation
    document.querySelectorAll('.section-title').forEach(el => {
        observer.observe(el);
    });
});

// ===== UTILITY: Copy to Clipboard =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard!');
    }).catch(() => {
        console.error('Failed to copy');
    });
}
