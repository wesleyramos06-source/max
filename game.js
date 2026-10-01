
// ============================================================
// ===================== FUGA INSANA ==========================
// ============================================================

// ---------- FUNDO ANIMADO ----------
(function initBackground() {
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    let W, H;
    let particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
        W = bgCanvas.width = window.innerWidth;
        H = bgCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            color: ['#ffcc00', '#ff6600', '#ff0066', '#00ccff', '#aa66ff'][Math.floor(Math.random() * 5)],
            alpha: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        bgCtx.fillStyle = 'rgba(5, 5, 15, 0.15)';
        bgCtx.fillRect(0, 0, W, H);

        bgCtx.strokeStyle = 'rgba(50, 50, 100, 0.08)';
        bgCtx.lineWidth = 1;
        for (let x = 0; x < W; x += 50) { bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, H); bgCtx.stroke(); }
        for (let y = 0; y < H; y += 50) { bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(W, y); bgCtx.stroke(); }

        for (const p of particles) {
            p.x += p.vx; p.y += p.vy; p.pulse += 0.05;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

            const alpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
            bgCtx.globalAlpha = alpha;
            bgCtx.fillStyle = p.color;
            bgCtx.shadowColor = p.color;
            bgCtx.shadowBlur = 15;
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            bgCtx.fill();
        }
        bgCtx.globalAlpha = 1;
        bgCtx.shadowBlur = 0;
        requestAnimationFrame(draw);
    }
    draw();
})();

// ---------- SAVE ----------
const STORAGE_KEY = 'fuga_insana_save_v1';

const DEFAULT_SETTINGS = {
    quality: 'high', mapSize: 'medium', wallDensity: 'normal',
    ghostSpeed: 5, volume: 7, particles: true, shadows: true,
    fullscreen: false, theme: 'neon', pacmanColor: 'yellow', ghostStyle: 'ghost'
};

const DEFAULT_STATS = {
    highScore: 0, totalScore: 0, games: 0, maxLevel: 1,
    ghostsEaten: 0, npcsVisited: 0, timePlayed: 0, maxCombo: 0
};

function loadSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { settings: { ...DEFAULT_SETTINGS }, stats: { ...DEFAULT_STATS } };
        const data = JSON.parse(raw);
        return {
            settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
            stats: { ...DEFAULT_STATS, ...(data.stats || {}) }
        };
    } catch (e) { return { settings: { ...DEFAULT_SETTINGS }, stats: { ...DEFAULT_STATS } }; }
}

function saveGame(saveData) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData)); }
    catch (e) { console.warn('Save falhou:', e); }
}

let saveData = loadSave();
let settings = saveData.settings;
let stats = saveData.stats;

function persist() {
    saveData.settings = settings;
    saveData.stats = stats;
    saveGame(saveData);
}

// ---------- NAVEGAÇÃO ----------
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('game-container');
const btnBackToLobby = document.getElementById('btnBackToLobby');
const gameLoading = document.getElementById('gameLoading');

function closeAllModals() { document.querySelectorAll('.modal-bg').forEach(m => m.classList.remove('
