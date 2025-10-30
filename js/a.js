const isMobile = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobileDevice || isSmallScreen;
};

const isTablet = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isTabletDevice = (/ipad|tablet/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua)));
    const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
    return isTabletDevice || isMediumScreen;
};

const mobile = isMobile();
const tablet = isTablet();

if (mobile) {
    document.body.classList.add('mobile-device');
} else if (tablet) {
    document.body.classList.add('tablet-device');
} else {
    document.body.classList.add('desktop-device');
}

if (mobile && !localStorage.getItem('mobilePopupShown')) {
    localStorage.setItem('compactMode', 'true');
    document.body.classList.add('compact-mode');

    const popup = document.createElement('div');
    popup.className = 'mobile-popup';
    popup.innerHTML = `
        <div class="mobile-popup-content">
            <h3>mobile device detected</h3>
            <p>compact mode enabled for better experience. you can disable it in settings.</p>
            <button class="mobile-popup-btn">got it</button>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.mobile-popup-btn').addEventListener('click', () => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 200);
        localStorage.setItem('mobilePopupShown', 'true');
    });
}

function applySetting(setting, isOn) {
    switch (setting) {
        case 'fullscreen':
            if (isOn && !mobile) {
                document.documentElement.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
            break;
        case 'reduceMotion':
            document.body.classList.toggle('reduce-motion', isOn);
            break;
        case 'compactMode':
            document.body.classList.toggle('compact-mode', isOn);
            break;
    }
}

function loadAllSettings() {
    const settings = ['fullscreen', 'reduceMotion', 'compactMode'];
    settings.forEach(setting => {
        const saved = localStorage.getItem(setting);
        if (saved === 'true') applySetting(setting, true);
    });
}
loadAllSettings();

const deviceTypeEl = document.getElementById('deviceType');
if (deviceTypeEl) deviceTypeEl.textContent = mobile ? 'mobile' : tablet ? 'tablet' : 'desktop';

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header') && nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

fetch('js/json/g.json')
    .then(res => res.json())
    .then(games => {
        const gameCountEl = document.getElementById('gameCount');
        if (gameCountEl) gameCountEl.textContent = games.length;

        const featuredGrid = document.getElementById('featuredGames');
        if (featuredGrid) {
            const featured = games.slice(0, mobile ? 4 : 6);
            featured.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <img src="img/games/${game.id}.webp" alt="${game.name}" onerror="this.src='img/games/default.webp'">
                    <span>${game.name}</span>
                `;
                card.addEventListener('click', () => openGame(game.name, game.url));
                featuredGrid.appendChild(card);
            });
        }
    })
    .catch(err => console.error('Error loading games:', err));

document.querySelectorAll('.toggle-switch').forEach(toggle => {
    const setting = toggle.dataset.setting;
    const saved = localStorage.getItem(setting);
    if (saved === 'true') toggle.classList.add('on');

    toggle.addEventListener('click', () => {
        const isOn = toggle.classList.toggle('on');
        localStorage.setItem(setting, isOn);
        applySetting(setting, isOn);
    });
});

const downloadBtn = document.getElementById('downloadData');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const data = {
            settings: {},
            localStorage: { ...localStorage },
            timestamp: new Date().toISOString(),
            device: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop'
        };
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            const s = toggle.dataset.setting;
            if (s) data.settings[s] = localStorage.getItem(s);
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: `fyinx-data-${Date.now()}.json` });
        a.click();
        URL.revokeObjectURL(url);
    });
}

const loadBtn = document.getElementById('loadData');
const loadInput = document.getElementById('loadDataInput');
if (loadBtn && loadInput) {
    loadBtn.addEventListener('click', () => loadInput.click());
    loadInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.localStorage) {
                    Object.entries(data.localStorage).forEach(([k, v]) => localStorage.setItem(k, v));
                }
                alert('data loaded successfully');
                location.reload();
            } catch (err) {
                alert('error loading data file');
                console.error(err);
            }
        };
        reader.readAsText(file);
    });
}

const clearBtn = document.getElementById('clearData');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (confirm('are you sure you want to clear all data?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

function openGame(name, url) {
    const frame = document.createElement('div');
    frame.className = 'game-frame active';
    frame.innerHTML = `
        <div class="frame-header">
            <span class="frame-title">${name}</span>
            <button class="close-btn">close</button>
        </div>
        <div class="game-iframe-container">
            <div class="loading-screen">
                <div class="loader"></div>
                <div class="loading-text">loading game...</div>
            </div>
            <iframe src="${url}" allowfullscreen></iframe>
        </div>
    `;
    frame.querySelector('.close-btn').addEventListener('click', () => frame.remove());
    const iframe = frame.querySelector('iframe');
    const loading = frame.querySelector('.loading-screen');
    iframe.onload = () => {
        loading.classList.add('hidden');
        iframe.classList.add('loaded');
    };
    setTimeout(() => {
        if (!iframe.classList.contains('loaded')) {
            loading.classList.add('hidden');
            iframe.classList.add('loaded');
        }
    }, 5000);
    document.body.appendChild(frame);
}

if (mobile) {
    window.addEventListener('orientationchange', () => setTimeout(() => window.scrollTo(0, 0), 100));
    let lastTouchEnd = 0;
    document.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, false);
}
