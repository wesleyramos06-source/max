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

function closeAllModals() { document.querySelectorAll('.modal-bg').forEach(m => m.classList.remove('show')); }
function openModal(id) { closeAllModals(); const m = document.getElementById(id); if (m) m.classList.add('show'); }

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-close');
        document.getElementById(id).classList.remove('show');
        if (id === 'modalSettings' || id === 'modalStyle') persist();
    });
});

document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', (e) => {
        if (e.target === bg) { bg.classList.remove('show'); persist(); }
    });
});

// ---------- CONFIG UI ----------
function syncSettingsUI() {
    document.querySelectorAll('#optQuality .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.quality));
    document.querySelectorAll('#optMapSize .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.mapSize));
    document.querySelectorAll('#optWallDensity .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.wallDensity));
    document.getElementById('sliderGhostSpeed').value = settings.ghostSpeed;
    document.getElementById('sliderGhostSpeedVal').textContent = settings.ghostSpeed;
    document.getElementById('sliderVolume').value = settings.volume;
    document.getElementById('sliderVolumeVal').textContent = settings.volume * 10 + '%';
    document.getElementById('toggleParticles').classList.toggle('on', settings.particles);
    document.getElementById('toggleShadows').classList.toggle('on', settings.shadows);
    document.getElementById('toggleFullscreen').classList.toggle('on', settings.fullscreen);
}

function bindOptionGroup(groupId, settingKey) {
    document.querySelectorAll(`#${groupId} .option-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(`#${groupId} .option-btn`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            settings[settingKey] = btn.dataset.value;
            persist();
        });
    });
}

bindOptionGroup('optQuality', 'quality');
bindOptionGroup('optMapSize', 'mapSize');
bindOptionGroup('optWallDensity', 'wallDensity');
bindOptionGroup('optTheme', 'theme');
bindOptionGroup('optPacmanColor', 'pacmanColor');
bindOptionGroup('optGhostStyle', 'ghostStyle');

document.getElementById('sliderGhostSpeed').addEventListener('input', (e) => {
    settings.ghostSpeed = parseInt(e.target.value);
    document.getElementById('sliderGhostSpeedVal').textContent = settings.ghostSpeed;
    persist();
});

document.getElementById('sliderVolume').addEventListener('input', (e) => {
    settings.volume = parseInt(e.target.value);
    document.getElementById('sliderVolumeVal').textContent = settings.volume * 10 + '%';
    persist();
});

function bindToggle(id, settingKey) {
    const el = document.getElementById(id);
    el.addEventListener('click', () => {
        el.classList.toggle('on');
        settings[settingKey] = el.classList.contains('on');
        persist();
    });
}
bindToggle('toggleParticles', 'particles');
bindToggle('toggleShadows', 'shadows');
bindToggle('toggleFullscreen', 'fullscreen');

document.getElementById('btnResetSettings').addEventListener('click', () => {
    settings = { ...DEFAULT_SETTINGS };
    persist();
    syncSettingsUI();
});

function syncStyleUI() {
    document.querySelectorAll('#optTheme .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.theme));
    document.querySelectorAll('#optPacmanColor .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.pacmanColor));
    document.querySelectorAll('#optGhostStyle .option-btn').forEach(b => b.classList.toggle('selected', b.dataset.value === settings.ghostStyle));
}

function updateStatsUI() {
    document.getElementById('statHighScore').textContent = stats.highScore;
    document.getElementById('statTotalScore').textContent = stats.totalScore;
    document.getElementById('statGames').textContent = stats.games;
    document.getElementById('statLevel').textContent = stats.maxLevel;
    document.getElementById('statGhosts').textContent = stats.ghostsEaten;
    document.getElementById('statNpcs').textContent = stats.npcsVisited;
    const hours = Math.floor(stats.timePlayed / 3600);
    const mins = Math.floor((stats.timePlayed % 3600) / 60);
    document.getElementById('statTime').textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    document.getElementById('statCombo').textContent = stats.maxCombo + 'x';
}

document.getElementById('btnResetStats').addEventListener('click', () => {
    if (confirm('Tem certeza que quer limpar TODAS as estatísticas?')) {
        stats = { ...DEFAULT_STATS };
        persist();
        updateStatsUI();
    }
});

document.getElementById('btnPlay').addEventListener('click', () => startGame());
document.getElementById('btnSettings').addEventListener('click', () => { syncSettingsUI(); openModal('modalSettings'); });
document.getElementById('btnStats').addEventListener('click', () => { updateStatsUI(); openModal('modalStats'); });
document.getElementById('btnStyle').addEventListener('click', () => { syncStyleUI(); openModal('modalStyle'); });
document.getElementById('btnCredits').addEventListener('click', () => openModal('modalCredits'));

syncSettingsUI();
syncStyleUI();

// ============================================================
// ===================== O JOGO ===============================
// ============================================================

let gameRunning = false;
let gameCleanup = null;

function startGame() {
    if (gameRunning) return;
    gameLoading.classList.add('show');
    lobby.classList.add('hidden');

    if (settings.fullscreen) document.documentElement.requestFullscreen?.().catch(() => {});

    setTimeout(() => {
        gameContainer.classList.add('show');
        btnBackToLobby.classList.add('show');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            try {
                gameRunning = true;
                gameCleanup = runGame();
                gameLoading.classList.remove('show');
            } catch (err) {
                console.error('Erro ao iniciar jogo:', err);
                gameLoading.innerHTML = '<div style="color:#ff3333;font-size:16px;text-align:center;padding:20px;">❌ Erro ao iniciar<br><br>' + String(err.message || err) + '<br><br><button id="retryGame" class="menu-btn primary" style="margin-top:12px;">TENTAR NOVAMENTE</button></div>';
                gameRunning = false;
                lobby.classList.remove('hidden');
                gameContainer.classList.remove('show');
                btnBackToLobby.classList.remove('show');
                document.getElementById('retryGame')?.addEventListener('click', startGame);
            }
        }));
    }, 100);
}

function stopGame() {
    if (!gameRunning && !gameContainer.classList.contains('show')) return;
    gameRunning = false;
    if (gameCleanup) { try { gameCleanup(); } catch (e) { console.warn(e); } gameCleanup = null; }
    gameContainer.classList.remove('show');
    gameContainer.innerHTML = '';
    lobby.classList.remove('hidden');
    btnBackToLobby.classList.remove('show');
    gameLoading.classList.remove('show');
}

btnBackToLobby.addEventListener('click', () => stopGame());

// ============================================================
// ===================== FUNÇÃO PRINCIPAL DO JOGO =============
// ============================================================

function runGame() {

    // ---------- CONFIG ----------
    let COLS, ROWS;
    if (settings.mapSize === 'small') { COLS = 15; ROWS = 15; }
    else if (settings.mapSize === 'large') { COLS = 23; ROWS = 23; }
    else { COLS = 19; ROWS = 19; }

    const CELL_SIZE = 1;
    const WALL_HEIGHT = 0.7;
    const TOTAL_LEVELS = 100;
    const mapCanvasSize = 800;

    // ---------- TEMA ----------
    const THEMES = {
        classic: { bg: 0x05050f, wall: 0x1a4a7a, wallTop: 0x00aaff, floor: 0x0a0a18 },
        neon: { bg: 0x0a0514, wall: 0x2a1a5a, wallTop: 0xff66ff, floor: 0x12081e },
        retro: { bg: 0x0a0800, wall: 0x4a3a1a, wallTop: 0xffaa00, floor: 0x1a1200 },
        matrix: { bg: 0x000500, wall: 0x003300, wallTop: 0x00ff00, floor: 0x001100 }
    };
    const theme = THEMES[settings.theme] || THEMES.neon;

    // ---------- PACMAN COR ----------
    const PACMAN_COLORS = {
        yellow: { color: 0xffdd00, emissive: 0xcc8800 },
        cyan: { color: 0x00ddff, emissive: 0x0088cc },
        pink: { color: 0xff66aa, emissive: 0xcc2266 },
        lime: { color: 0x66ff66, emissive: 0x22aa22 }
    };
    const pacColor = PACMAN_COLORS[settings.pacmanColor] || PACMAN_COLORS.yellow;

    // ---------- DENSIDADE ----------
    const densityMap = { low: 0.28, normal: 0.38, high: 0.48 };
    const baseDensity = densityMap[settings.wallDensity] || 0.38;

    // ---------- VELOCIDADE FANTASMAS ----------
    const ghostSpeedMul = 0.6 + (settings.ghostSpeed - 1) * (0.8 / 9);

    // ---------- QUALIDADE ----------
    const qualitySettings = {
        low: { pixelRatio: 1, shadowMap: 512, antialias: false },
        medium: { pixelRatio: 1, shadowMap: 1024, antialias: true },
        high: { pixelRatio: 1.5, shadowMap: 2048, antialias: true }
    };
    const qs = qualitySettings[settings.quality] || qualitySettings.high;

    // ---------- CRIA CONTAINER ----------
    const container = document.createElement('div');
    container.id = 'game-canvas-container';
    container.style.cssText = 'position:relative;width:min(800px,calc(100vw - 20px),calc(100vh - 20px));height:min(800px,calc(100vw - 20px),calc(100vh - 20px));border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(255,200,0,0.3);border:2px solid rgba(255,200,0,0.4);';
    gameContainer.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = mapCanvasSize;
    canvas.height = mapCanvasSize;
    container.appendChild(canvas);

    // ---------- THREE.JS ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bg);
    scene.fog = new THREE.Fog(theme.bg, COLS * 1.6, COLS * 2.8);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    const mapDiagonal = Math.sqrt(COLS * COLS + ROWS * ROWS);
    const vFov = (45 * Math.PI) / 180;
    const camDist = (mapDiagonal / 2) / Math.tan(vFov / 2) * 1.15;
    camera.position.set(0, camDist * 0.95, camDist * 0.42);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: qs.antialias });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qs.pixelRatio));
    renderer.setSize(mapCanvasSize, mapCanvasSize, false);
    renderer.shadowMap.enabled = settings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ---------- LUZES ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(COLS * 0.4, COLS * 1.2, ROWS * 0.3);
    dirLight.castShadow = settings.shadows;
    dirLight.shadow.mapSize.set(qs.shadowMap, qs.shadowMap);
    dirLight.shadow.camera.left = -COLS * 0.8;
    dirLight.shadow.camera.right = COLS * 0.8;
    dirLight.shadow.camera.top = ROWS * 0.8;
    dirLight.shadow.camera.bottom = -ROWS * 0.8;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = COLS * 3;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa00, 0.5, COLS * 2);
    pointLight.position.set(0, COLS * 0.6, 0);
    scene.add(pointLight);

    // ---------- CHÃO ----------
    const floorMat = new THREE.MeshStandardMaterial({ color: theme.floor, roughness: 0.9, metalness: 0.1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const mazeGroup = new THREE.Group(); scene.add(mazeGroup);
    const portalGroup = new THREE.Group(); scene.add(portalGroup);
    const powerUpGroup = new THREE.Group(); scene.add(powerUpGroup);
    const npcGroup = new THREE.Group(); scene.add(npcGroup);

    function toWorldX(col) { return col - (COLS - 1) / 2; }
    function toWorldZ(row) { return row - (ROWS - 1) / 2; }

    // ---------- HUD ----------
    const hudHTML = `
        <div style="position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;padding:8px 16px;background:rgba(10,10,25,0.85);border-radius:12px;border:1px solid rgba(255,200,0,0.4);backdrop-filter:blur(8px);pointer-events:none;z-index:10;gap:8px;flex-wrap:wrap;font-family:'Courier New',monospace;">
            <div style="display:flex;gap:5px;font-size:13px;font-weight:bold;color:#ffcc00;letter-spacing:1px;"><span>🎯 FASE</span> <span id="hudLevel" style="color:#fff;">1</span>/100</div>
            <div style="display:flex;gap:5px;font-size:13px;font-weight:bold;color:#ffcc00;letter-spacing:1px;"><span>🔵</span> <span id="hudScore" style="color:#fff;">0</span></div>
            <div style="display:flex;gap:5px;font-size:13px;font-weight:bold;color:#ffcc00;letter-spacing:1px;"><span>❤️</span> <span id="hudLives" style="color:#fff;">3</span></div>
            <div style="display:flex;gap:5px;font-size:13px;font-weight:bold;color:#ffcc00;letter-spacing:1px;"><span>⚡</span> <span id="hudPowers" style="color:#fff;">0</span></div>
        </div>
        <div id="powersPanel" style="position:absolute;top:70px;left:12px;display:flex;flex-direction:column;gap:8px;z-index:10;pointer-events:none;font-family:'Courier New',monospace;"></div>
        <div style="position:absolute;bottom:44px;left:50%;transform:translateX(-50%);width:60%;height:6px;background:rgba(0,0,0,0.6);border-radius:3px;overflow:hidden;z-index:10;border:1px solid rgba(255,200,0,0.3);">
            <div id="hudLevelBar" style="height:100%;width:0%;background:linear-gradient(90deg,#ffcc00,#ff9900);transition:width 0.5s ease;box-shadow:0 0 10px #ffcc00;"></div>
        </div>
        <div id="npcDialog" style="position:absolute;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);max-width:90%;padding:16px 22px;background:linear-gradient(145deg,rgba(20,20,40,0.98),rgba(10,10,25,0.98));border:3px solid #66ffcc;border-radius:16px;color:#fff;font-size:15px;z-index:18;pointer-events:none;opacity:0;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);font-family:'Courier New',monospace;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed #66ffcc;" id="npcHeader">
                <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:24px;border:2px solid #66ffcc;flex-shrink:0;" id="npcPortrait">💬</div>
                <div>
                    <div style="font-weight:bold;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#66ffcc;" id="npcName">SÁBIO</div>
                    <div style="font-size:11px;letter-spacing:1px;opacity:0.7;margin-top:2px;color:#66ffcc;" id="npcTitle">Guardião do Conhecimento</div>
                </div>
            </div>
            <div style="color:#fff;line-height:1.5;font-style:italic;" id="npcText"></div>
        </div>
        <div id="notification" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);padding:16px 40px;background:rgba(10,10,25,0.95);border:2px solid #ffcc00;border-radius:16px;font-size:22px;font-weight:bold;color:#fff;text-align:center;z-index:15;pointer-events:none;opacity:0;text-shadow:0 0 20px currentColor;font-family:'Courier New',monospace;transition:opacity 0.3s;"></div>
    `;
    container.insertAdjacentHTML('beforeend', hudHTML + `
        <div id="touch-controls" aria-label="Controles de movimento">
            <span></span><button data-dir="up" aria-label="Cima">▲</button><span></span>
            <button data-dir="left" aria-label="Esquerda">◀</button>
            <button data-dir="down" aria-label="Baixo">▼</button>
            <button data-dir="right" aria-label="Direita">▶</button>
        </div>
`);

    const hudLevel = document.getElementById('hudLevel');
    const hudScore = document.getElementById('hudScore');
    const hudLives = document.getElementById('hudLives');
    const hudPowers = document.getElementById('hudPowers');
    const hudLevelBar = document.getElementById('hudLevelBar');
    const powersPanel = document.getElementById('powersPanel');
    const npcDialog = document.getElementById('npcDialog');
    const npcHeader = document.getElementById('npcHeader');
    const npcPortrait = document.getElementById('npcPortrait');
    const npcName = document.getElementById('npcName');
    const npcTitle = document.getElementById('npcTitle');
    const npcText = document.getElementById('npcText');
    const notification = document.getElementById('notification');

    // ===== MAPA =====
    class SeededRandom {
        constructor(seed) { this.seed = seed; }
        next() {
            this.seed ^= this.seed << 13;
            this.seed ^= this.seed >> 17;
            this.seed ^= this.seed << 5;
            return ((this.seed >>> 0) / 4294967296);
        }
        int(max) { return Math.floor(this.next() * max); }
    }

    function generateMaze(levelNum) {
        const rng = new SeededRandom(levelNum * 987654321 + 12345);
        const maze = [];
        for (let r = 0; r < ROWS; r++) maze.push(new Array(COLS).fill(1));
        for (let r = 1; r < ROWS - 1; r++)
            for (let c = 1; c < COLS - 1; c++) maze[r][c] = 0;

        const wallDensity = baseDensity + Math.min(levelNum / 200, 0.15);
        const midR = Math.floor(ROWS / 2);
        const midC = Math.floor(COLS / 2);

        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c <= Math.floor(COLS / 2); c++) {
                if (r === 1 || r === ROWS - 2 || c === 1) {
                    maze[r][c] = 0; maze[r][COLS - 1 - c] = 0;
                    continue;
                }
                if (r === midR && c === midC) {
                    maze[r][c] = 0; maze[r][COLS - 1 - c] = 0;
                    continue;
                }
                if (rng.next() < wallDensity) {
                    maze[r][c] = 1; maze[r][COLS - 1 - c] = 1;
                }
            }
        }

        const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
        const queue = [[midR, midC]];
        visited[midR][midC] = true;
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1) {
                    if (!visited[nr][nc] && maze[nr][nc] === 0) {
                        visited[nr][nc] = true;
                        queue.push([nr, nc]);
                    }
                }
            }
        }
        for (let r = 1; r < ROWS - 1; r++)
            for (let c = 1; c < COLS - 1; c++)
                if (maze[r][c] === 0 && !visited[r][c]) maze[r][c] = 1;

        let emptyCount = 0;
        for (let r = 1; r < ROWS - 1; r++)
            for (let c = 1; c < COLS - 1; c++)
                if (maze[r][c] === 0) emptyCount++;

        const minEmpty = Math.floor(COLS * ROWS * 0.25);
        let attempts = 0;
        while (emptyCount < minEmpty && attempts < 300) {
            const r = 2 + rng.int(ROWS - 4);
            const c = 2 + rng.int(Math.floor(COLS / 2) - 2) + 1;
            if (maze[r][c] === 1) {
                maze[r][c] = 0; maze[r][COLS - 1 - c] = 0;
                emptyCount += 2;
            }
            attempts++;
        }

        maze[midR][0] = 5;
        maze[midR][COLS - 1] = 6;
        maze[midR][midC] = 3;

        const corners = [[1, 1], [1, COLS - 2], [ROWS - 2, 1], [ROWS - 2, COLS - 2]];
        for (const [r, c] of corners) if (maze[r][c] === 0) maze[r][c] = 4;

        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (maze[r][c] === 5 || maze[r][c] === 6) maze[r][c] = 2;

        return maze;
    }

    // ===== MATERIAIS =====
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: theme.wall, roughness: 0.5, metalness: 0.3,
        emissive: theme.wall, emissiveIntensity: 0.2
    });
    const wallTopMaterial = new THREE.MeshStandardMaterial({
        color: theme.wallTop, emissive: theme.wallTop, emissiveIntensity: 1.0,
        roughness: 0.3, metalness: 0.5
    });
    const pelletMaterial = new THREE.MeshStandardMaterial({
        color: 0xffdd44, emissive: 0xffaa00, emissiveIntensity: 1.2, roughness: 0.2
    });
    const powerPelletMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1.8, roughness: 0.1
    });

    // ===== ESTADO =====
    let grid = [];
    let mapLayout = null;
    let player = { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) };
    let ghosts = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameOver = false;
    let levelComplete = false;
    let totalPellets = 0;
    let pelletsEaten = 0;
    let direction = 'none';
    let nextDirection = 'none';
    let powerMode = false;
    let powerTimer = 0;
    const POWER_DURATION = 45;
    let ghostCombo = 0;
    let levelMaxCombo = 0;
    let fruit = null;
    let fruitTimer = 0;
    let fruitSpawned = false;
    let fruitEaten = 0;
    let moveInterval = null;
    let portalActive = false;
    let portalMesh = null;
    let activePowers = {};
    let powerUpsOnMap = [];
    let powerSpawnTimer = 0;
    let powerSpawnInterval = 60;
    let npcsOnMap = [];
    let npcSpawnTimer = 0;
    let npcSpawnInterval = 120;

    let playerMesh = null;
    let playerBodyMesh = null;
    let ghostMeshes = [];
    let pelletMeshes = [];
    let fruitMesh = null;
    let portalLight = null;

    let animTime = 0;
    const clock = new THREE.Clock();
    let rafId = null;
    let running = true;

    // ===== POWER TYPES =====
    const POWER_TYPES = {
        INVISIBILITY: { id: 'invisibility', icon: '👻', name: 'INVISÍVEL', color: 0xaaaaaa, borderColor: '#cccccc', durationTicks: 75 },
        SPEED: { id: 'speed', icon: '⚡', name: 'VELOCIDADE', color: 0xffff00, borderColor: '#ffff00', durationTicks: 60 },
        EXTRA_LIFE: { id: 'extra_life', icon: '❤️', name: 'VIDA EXTRA', color: 0xff3366, borderColor: '#ff3366', durationTicks: 0 },
        FREEZE: { id: 'freeze', icon: '❄️', name: 'CONGELAR', color: 0x00ffff, borderColor: '#00ffff', durationTicks: 40 },
        MAGNET: { id: 'magnet', icon: '🧲', name: 'ÍMÃ', color: 0xff66cc, borderColor: '#ff66cc', durationTicks: 50 },
        INVINCIBLE: { id: 'invincible', icon: '🛡️', name: 'INVENCÍVEL', color: 0x66ff66, borderColor: '#66ff66', durationTicks: 50 }
    };
    const POWER_LIST = Object.values(POWER_TYPES);

    // ===== NPC TYPES =====
    const NPC_TYPES = {
        SAGE: { id: 'sage', name: 'SÁBIO', icon: '🧙', title: 'Guardião do Conhecimento', color: 0x66ffcc, glowColor: '#66ffcc',
            hints: ['Fantasmas vermelhos te perseguem diretamente. Fuja pelas curvas!', 'Use os power pellets nos cantos para virar o jogo!', 'Fantasmas rosas tentam te emboscar!', 'Quando a barra de poder estiver acabando, fuja!'] },
        TRICKSTER: { id: 'trickster', name: 'TRICKSTER', icon: '🦊', title: 'Espírito Trapalhão', color: 0xffaa33, glowColor: '#ffaa33',
            hints: ['A invisibilidade dura 12 segundos completos!', 'Com o ímã ativo, as pastilhas voam até você!', 'Congelar os fantasmas é ótimo para combos!', 'A velocidade te deixa 45% mais rápido!'] },
        WHISPERER: { id: 'whisperer', name: 'SUSSURRADOR', icon: '👻', title: 'Aquele que Ouve os Mortos', color: 0xaa88ff, glowColor: '#aa88ff',
            hints: ['Cada fantasma tem sua própria personalidade...', 'O vermelho persegue, o rosa embosca!', 'Fantasmas comidos voltam como olhos flutuantes.', 'Power pellets assustam todos os fantasmas!'] },
        MERCHANT: { id: 'merchant', name: 'MERCADOR', icon: '🧝', title: 'Comerciante do Vazio', color: 0xff66aa, glowColor: '#ff66aa',
            hints: ['Presente para você: +50 pontos!', 'Guarde poderes para as horas difíceis!', 'Bônus especial apenas para você!', 'As frutas valem mais que 10 pastilhas!'] }
    };

    // ===== GHOST TYPES =====
    const ghostColors = {
        ghost: [0xff2222, 0xff77cc, 0x33ddff, 0xffaa33],
        robot: [0xcc0000, 0xcc44aa, 0x0088cc, 0xcc8800],
        alien: [0x88ff22, 0xcc44ff, 0x22ffcc, 0xffaa22]
    };
    const gc = ghostColors[settings.ghostStyle] || ghostColors.ghost;
    const GHOST_TYPES = [
        { name: 'blinky', color: gc[0] },
        { name: 'pinky', color: gc[1] },
        { name: 'inky', color: gc[2] },
        { name: 'clyde', color: gc[3] }
    ];

    // ===== BUILDERS =====
    function buildMaze() {
        while (mazeGroup.children.length > 0) {
            const c = mazeGroup.children[0];
            mazeGroup.remove(c);
            if (c.geometry) c.geometry.dispose();
        }
        const wallGeo = new THREE.BoxGeometry(CELL_SIZE * 0.98, WALL_HEIGHT, CELL_SIZE * 0.98);
        const topGeo = new THREE.BoxGeometry(CELL_SIZE * 0.98, 0.08, CELL_SIZE * 0.98);
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (grid[row][col] === 1) {
                    const x = toWorldX(col), z = toWorldZ(row);
                    const wall = new THREE.Mesh(wallGeo, wallMaterial);
                    wall.position.set(x, WALL_HEIGHT / 2, z);
                    wall.castShadow = settings.shadows;
                    wall.receiveShadow = true;
                    mazeGroup.add(wall);
                    const top = new THREE.Mesh(topGeo, wallTopMaterial);
                    top.position.set(x, WALL_HEIGHT + 0.04, z);
                    mazeGroup.add(top);
                }
            }
        }
    }

    function buildPellets() {
        for (const p of pelletMeshes) { scene.remove(p.mesh); p.mesh.geometry.dispose(); }
        pelletMeshes = [];
        const pelletGeo = new THREE.SphereGeometry(0.14, 10, 8);
        const powerGeo = new THREE.SphereGeometry(0.26, 12, 10);
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const v = grid[row][col];
                if (v === 0 || v === 4) {
                    const isPower = v === 4;
                    const mesh = new THREE.Mesh(isPower ? powerGeo : pelletGeo, isPower ? powerPelletMaterial : pelletMaterial);
                    mesh.position.set(toWorldX(col), 0.35, toWorldZ(row));
                    mesh.castShadow = settings.shadows && !isPower;
                    scene.add(mesh);
                    pelletMeshes.push({ mesh, col, row, isPower });
                }
            }
        }
    }

    function createPowerUpMesh(type) {
        const group = new THREE.Group();
        const color = type.color;
        const base = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.8, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.95 }));
        base.position.y = 0.55; base.castShadow = settings.shadows;
        group.add(base);
        const ringGeo = new THREE.TorusGeometry(0.45, 0.05, 8, 20);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 2.5, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; ring.position.y = 0.55; group.add(ring);
        const ring2 = new THREE.Mesh(ringGeo, ringMat);
        ring2.rotation.z = Math.PI / 2; ring2.position.y = 0.55; group.add(ring2);
        const light = new THREE.PointLight(color, 1.5, 3);
        light.position.y = 0.8; group.add(light);
        return group;
    }

    function spawnPowerUp() {
        const candidates = [];
        for (let r = 1; r < ROWS - 1; r++) {
            for (let c = 1; c < COLS - 1; c++) {
                if (grid[r][c] === 2 && !(r === player.y && c === player.x)) {
                    let minDist = Math.abs(r - player.y) + Math.abs(c - player.x);
                    for (const g of ghosts) {
                        const d = Math.abs(r - g.y) + Math.abs(c - g.x);
                        if (d < minDist) minDist = d;
                    }
                    for (const npc of npcsOnMap) {
                        const d = Math.abs(r - npc.row) + Math.abs(c - npc.col);
                        if (d < 3) { minDist = -1; break; }
                    }
                    if (minDist >= 5) candidates.push({ x: c, y: r, dist: minDist });
                }
            }
        }
        if (candidates.length === 0) return;
        candidates.sort((a, b) => b.dist - a.dist);
        const pos = candidates[0];
        const roll = Math.random();
        let type;
        if (roll < 0.08) type = POWER_TYPES.EXTRA_LIFE;
        else if (roll < 0.18) type = POWER_TYPES.INVINCIBLE;
        else if (roll < 0.32) type = POWER_TYPES.INVISIBILITY;
        else if (roll < 0.48) type = POWER_TYPES.SPEED;
        else if (roll < 0.64) type = POWER_TYPES.FREEZE;
        else type = POWER_TYPES.MAGNET;
        const mesh = createPowerUpMesh(type);
        mesh.position.set(toWorldX(pos.x), 0, toWorldZ(pos.y));
        powerUpGroup.add(mesh);
        powerUpsOnMap.push({ type, col: pos.x, row: pos.y, mesh, spawnTime: animTime });
    }

    function buildPowerUps() {
        while (powerUpGroup.children.length > 0) {
            const c = powerUpGroup.children[0];
            powerUpGroup.remove(c);
            c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        }
        powerUpsOnMap = [];
    }

    // NPC BUILDERS
    function createSageMesh(color) {
        const group = new THREE.Group();
        const matDark = new THREE.MeshStandardMaterial({ color: 0x003344, emissive: 0x004455, emissiveIntensity: 0.5, roughness: 0.6 });
        const robe = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 8), matDark);
        robe.position.y = 0.55; robe.castShadow = settings.shadows; group.add(robe);
        const trim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 16), new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x66ffcc, emissiveIntensity: 3.0 }));
        trim.rotation.x = Math.PI / 2; trim.position.y = 0.15; group.add(trim);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshStandardMaterial({ color: 0xeeddcc, emissive: 0x886644, emissiveIntensity: 0.3 }));
        head.position.y = 1.15; head.castShadow = settings.shadows; group.add(head);
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 6);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x66ffcc, emissiveIntensity: 4.0 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.07, 1.18, 0.14); group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.07, 1.18, 0.14); group.add(eyeR);
        const beard = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xf0f0f0, emissive: 0xaaaaff, emissiveIntensity: 0.3 }));
        beard.position.y = 0.95; beard.rotation.x = Math.PI; group.add(beard);
        const hat = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x003344, emissive: 0x006677, emissiveIntensity: 0.6, roughness: 0.4 }));
        hat.position.y = 1.55; hat.castShadow = settings.shadows; group.add(hat);
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x66ffcc, emissiveIntensity: 4.0 }));
        star.position.set(0.15, 1.6, 0); star.name = 'star'; group.add(star);
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.7 }));
        staff.position.set(0.42, 0.7, 0); group.add(staff);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x66ffcc, emissiveIntensity: 5.0 }));
        orb.position.set(0.42, 1.45, 0); orb.name = 'orb'; group.add(orb);
        const aura = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.02, 6, 20), new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x66ffcc, emissiveIntensity: 3.0, transparent: true, opacity: 0.7 }));
        aura.rotation.x = Math.PI / 2; aura.position.y = 0.05; aura.name = 'aura'; group.add(aura);
        const light = new THREE.PointLight(color, 1.5, 4); light.position.y = 1.2; group.add(light);
        return group;
    }

    function createTricksterMesh(color) {
        const group = new THREE.Group();
        const matBody = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.2 });
        const matWhite = new THREE.MeshStandardMaterial({ color: 0xfff5e0, emissive: 0x886644, emissiveIntensity: 0.3, roughness: 0.5 });
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.35, 6, 10), matBody);
        body.rotation.z = Math.PI / 2; body.position.y = 0.35; body.castShadow = settings.shadows; group.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), matBody);
        head.scale.set(1.3, 1, 1); head.position.set(0.42, 0.75, 0); head.castShadow = settings.shadows; group.add(head);
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), matWhite);
        snout.rotation.z = -Math.PI / 2; snout.position.set(0.62, 0.72, 0); group.add(snout);
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 6);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffee00, emissive: 0xffee00, emissiveIntensity: 3.0 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(0.48, 0.82, 0.08); group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.48, 0.82, -0.08); group.add(eyeR);
        const earGeo = new THREE.ConeGeometry(0.09, 0.25, 4);
        const earL = new THREE.Mesh(earGeo, matBody); earL.position.set(0.4, 0.95, 0.12); earL.rotation.z = -0.2; group.add(earL);
        const earR = new THREE.Mesh(earGeo, matBody); earR.position.set(0.4, 0.95, -0.12); earR.rotation.z = -0.2; group.add(earR);
        const tail = new THREE.Mesh(new THREE.TorusKnotGeometry(0.18, 0.07, 24, 6, 2, 3), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.4 }));
        tail.position.set(-0.38, 0.4, 0); tail.rotation.y = Math.PI / 4; tail.name = 'tail'; group.add(tail);
        for (let i = 0; i < 5; i++) {
            const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ color: 0xffee00, emissive: 0xffee00, emissiveIntensity: 4.0 }));
            const angle = (i / 5) * Math.PI * 2;
            spark.position.set(Math.cos(angle) * 0.6, 0.6, Math.sin(angle) * 0.6);
            spark.name = `spark${i}`; group.add(spark);
        }
        const light = new THREE.PointLight(color, 1.2, 3.5); light.position.y = 0.6; group.add(light);
        return group;
    }

    function createWhispererMesh(color) {
        const group = new THREE.Group();
        const matGhost = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, roughness: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), matGhost);
        body.scale.set(1, 1.2, 1); body.position.y = 0.6; group.add(body);
        for (let i = 0; i < 4; i++) {
            const veil = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i * 0.12, 0.02, 6, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 3.0, transparent: true, opacity: 0.4 - i * 0.07 }));
            veil.rotation.x = Math.PI / 2; veil.position.y = 0.5 + i * 0.15; veil.name = `veil${i}`; group.add(veil);
        }
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 12, 1, true), matGhost);
        tail.position.y = 0.05; tail.rotation.x = Math.PI; group.add(tail);
        const socketGeo = new THREE.SphereGeometry(0.1, 10, 8);
        const socketMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x110022, emissiveIntensity: 0.5 });
        const socketL = new THREE.Mesh(socketGeo, socketMat); socketL.position.set(-0.13, 0.78, 0.32); group.add(socketL);
        const socketR = new THREE.Mesh(socketGeo, socketMat); socketR.position.set(0.13, 0.78, 0.32); group.add(socketR);
        const glowGeo = new THREE.SphereGeometry(0.035, 8, 6);
        const glowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddaaff, emissiveIntensity: 6.0 });
        const glowL = new THREE.Mesh(glowGeo, glowMat); glowL.position.set(-0.13, 0.78, 0.35); glowL.name = 'glowL'; group.add(glowL);
        const glowR = new THREE.Mesh(glowGeo, glowMat); glowR.position.set(0.13, 0.78, 0.35); glowR.name = 'glowR'; group.add(glowR);
        const mouth = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.1, 16), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
        mouth.position.set(0, 0.55, 0.38); mouth.name = 'mouth'; group.add(mouth);
        const light = new THREE.PointLight(color, 1.8, 4.5); light.position.y = 0.9; light.name = 'ghostLight'; group.add(light);
        return group;
    }

    function createMerchantMesh(color) {
        const group = new THREE.Group();
        const matBody = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.5, metalness: 0.4 });
        const matDark = new THREE.MeshStandardMaterial({ color: 0x553344, emissive: 0x442233, emissiveIntensity: 0.3, roughness: 0.7, metalness: 0.2 });
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffdd44, emissive: 0xffaa00, emissiveIntensity: 2.0, roughness: 0.2, metalness: 0.9 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.7, 10), matBody);
        body.position.y = 0.35; body.castShadow = settings.shadows; group.add(body);
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.15), matGold);
        chest.position.set(0, 0.5, 0.35); group.add(chest);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.5), matBody);
        head.position.y = 0.95; head.castShadow = settings.shadows; group.add(head);
        const beard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.08), matDark);
        beard.position.set(0, 0.75, 0.28); group.add(beard);
        const eyeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
        const eyeL = new THREE.Mesh(eyeGeo, matGold); eyeL.rotation.x = Math.PI / 2; eyeL.position.set(-0.12, 1.0, 0.26); group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, matGold); eyeR.rotation.x = Math.PI / 2; eyeR.position.set(0.12, 1.0, 0.26); group.add(eyeR);
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12), matDark);
        hat.position.y = 1.25; group.add(hat);
        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), matDark);
        pack.position.set(0, 0.6, -0.5); pack.castShadow = settings.shadows; group.add(pack);
        const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
        for (let i = 0; i < 5; i++) {
            const coin = new THREE.Mesh(coinGeo, matGold);
            coin.position.set((Math.random() - 0.5) * 0.4, 0.9 + Math.random() * 0.15, -0.45 + Math.random() * 0.1);
            coin.name = `coin${i}`; group.add(coin);
        }
        const aura = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.025, 6, 20), matGold);
        aura.rotation.x = Math.PI / 2; aura.position.y = 0.05; aura.name = 'aura'; group.add(aura);
        const light = new THREE.PointLight(color, 1.5, 4); light.position.y = 0.9; group.add(light);
        return group;
    }

    const NPC_MESH_CREATORS = {
        sage: createSageMesh, trickster: createTricksterMesh,
        whisperer: createWhispererMesh, merchant: createMerchantMesh
    };

    function spawnNpc() {
        const candidates = [];
        for (let r = 2; r < ROWS - 2; r++) {
            for (let c = 2; c < COLS - 2; c++) {
                if (grid[r][c] === 2 && !(r === player.y && c === player.x)) {
                    let minDist = Math.abs(r - player.y) + Math.abs(c - player.x);
                    if (minDist < 6) continue;
                    let tooClose = false;
                    for (const g of ghosts) if (Math.abs(r - g.y) + Math.abs(c - g.x) < 4) { tooClose = true; break; }
                    if (tooClose) continue;
                    for (const npc of npcsOnMap) if (Math.abs(r - npc.row) + Math.abs(c - npc.col) < 4) { tooClose = true; break; }
                    if (tooClose) continue;
                    candidates.push({ x: c, y: r });
                }
            }
        }
        if (candidates.length === 0) return;
        const pos = candidates[Math.floor(Math.random() * candidates.length)];
        const roll = Math.random();
        let npcType;
        if (roll < 0.35) npcType = NPC_TYPES.SAGE;
        else if (roll < 0.60) npcType = NPC_TYPES.TRICKSTER;
        else if (roll < 0.85) npcType = NPC_TYPES.WHISPERER;
        else npcType = NPC_TYPES.MERCHANT;
        const hint = npcType.hints[Math.floor(Math.random() * npcType.hints.length)];
        const mesh = NPC_MESH_CREATORS[npcType.id](npcType.color);
        mesh.position.set(toWorldX(pos.x), 0, toWorldZ(pos.y));
        npcGroup.add(mesh);
        npcsOnMap.push({ type: npcType, col: pos.x, row: pos.y, mesh, hint, spawnTime: animTime, bobOffset: Math.random() * Math.PI * 2 });
    }

    function buildNpcs() {
        while (npcGroup.children.length > 0) {
            const c = npcGroup.children[0];
            npcGroup.remove(c);
            c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        }
        npcsOnMap = [];
    }

    function buildPortal() {
        while (portalGroup.children.length > 0) {
            const c = portalGroup.children[0];
            portalGroup.remove(c);
            if (c.geometry) c.geometry.dispose();
        }
        portalMesh = null; portalLight = null;
        if (!portalActive) return;
        const group = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(0.55, 0.1, 12, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xff66ff, emissive: 0xff00ff, emissiveIntensity: 2.0, roughness: 0.2, metalness: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; ring.position.y = 0.6; group.add(ring);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 12, 24),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffff00, emissiveIntensity: 2.5, roughness: 0.1 }));
        ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.6; group.add(ring2);
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffaa88, emissiveIntensity: 3.0 }));
        core.position.y = 0.6; group.add(core);
        portalLight = new THREE.PointLight(0xff66ff, 2.0, 5);
        portalLight.position.y = 1; group.add(portalLight);
        group.position.set(toWorldX(Math.floor(COLS/2)), 0, toWorldZ(Math.floor(ROWS/2)));
        portalGroup.add(group);
        portalMesh = group;
    }

    const playerMaterial = new THREE.MeshStandardMaterial({
        color: pacColor.color, emissive: pacColor.emissive,
        emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.2
    });

    function buildPlayer() {
        if (playerMesh) {
            scene.remove(playerMesh);
            playerMesh.traverse(c => { if (c.geometry) c.geometry.dispose(); });
        }
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), playerMaterial.clone());
        body.castShadow = settings.shadows;
        group.add(body);
        playerBodyMesh = body;
        const eyeGeo = new THREE.SphereGeometry(0.09, 10, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.14, 0.15, 0.32); group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.14, 0.15, 0.32); group.add(eyeR);
        const pupilGeo = new THREE.SphereGeometry(0.045, 8, 6);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat); pupilL.position.set(0, 0, 0.06); eyeL.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat); pupilR.position.set(0, 0, 0.06); eyeR.add(pupilR);
        const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12, 0, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
        mouth.position.set(0, 0.02, 0.38); mouth.rotation.z = Math.PI; mouth.name = 'mouth'; group.add(mouth);
        group.position.set(toWorldX(player.x), 0.45, toWorldZ(player.y));
        scene.add(group);
        playerMesh = group;
    }

    function buildGhosts() {
        for (const g of ghostMeshes) {
            scene.remove(g.group);
            g.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
        }
        ghostMeshes = [];
        for (let i = 0; i < ghosts.length; i++) {
            const g = ghosts[i];
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: g.type.color, emissive: g.type.color, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.1 });
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), bodyMat);
            body.scale.set(1, 1.05, 1); body.position.y = 0.55; body.castShadow = settings.shadows; group.add(body);
            const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12, 1, true),
                new THREE.MeshStandardMaterial({ color: g.type.color, emissive: g.type.color, emissiveIntensity: 0.3, roughness: 0.5, side: THREE.DoubleSide }));
            skirt.position.y = 0.3; group.add(skirt);
            const eyeGeo = new THREE.SphereGeometry(0.12, 10, 8);
            const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 });
            const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat); eyeL.position.set(-0.14, 0.68, 0.32); group.add(eyeL);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat); eyeR.position.set(0.14, 0.68, 0.32); group.add(eyeR);
            const pupilGeo = new THREE.SphereGeometry(0.055, 8, 6);
            const pupilL = new THREE.Mesh(pupilGeo, pupilMat); pupilL.position.set(0, 0, 0.07); eyeL.add(pupilL);
            const pupilR = new THREE.Mesh(pupilGeo, pupilMat); pupilR.position.set(0, 0, 0.07); eyeR.add(pupilR);
            group.position.set(toWorldX(g.x), 0, toWorldZ(g.y));
            scene.add(group);
            ghostMeshes.push({ group, body, bodyMat, eyeL, eyeR, pupilL, pupilR, originalColor: g.type.color });
        }
    }

    function buildFruit() {
        if (fruitMesh) {
            scene.remove(fruitMesh);
            fruitMesh.traverse(c => { if (c.geometry) c.geometry.dispose(); });
            fruitMesh = null;
        }
        if (!fruit) return;
        const group = new THREE.Group();
        const color = fruit.type === 'cherry' ? 0xff1744 : 0xff3366;
        const sphereMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.3 });
        if (fruit.type === 'cherry') {
            const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), sphereMat);
            s1.position.set(-0.15, 0.4, 0); s1.castShadow = settings.shadows; group.add(s1);
            const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), sphereMat);
            s2.position.set(0.15, 0.4, 0); s2.castShadow = settings.shadows; group.add(s2);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
            stem.position.set(0, 0.65, 0); group.add(stem);
        } else {
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), sphereMat);
            s.scale.set(1, 1.2, 1); s.position.y = 0.4; s.castShadow = settings.shadows; group.add(s);
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x2e7d32, emissive: 0x112211, emissiveIntensity: 0.3 }));
            leaf.position.y = 0.7; group.add(leaf);
        }
        group.position.set(toWorldX(fruit.x), 0, toWorldZ(fruit.y));
        scene.add(group);
        fruitMesh = group;
    }

    // ===== LÓGICA =====
    function activatePower(type) {
        if (type.id === 'extra_life') {
            lives++; score += 200; updateHUD();
            showNotification('❤️ VIDA EXTRA! +200', '#ff3366');
            return;
        }
        activePowers[type.id] = { type, timer: type.durationTicks, totalTicks: type.durationTicks };
        updatePowersPanel();
        showNotification(`${type.icon} ${type.name}!`, type.borderColor);
    }

    function showNotification(text, color) {
        notification.textContent = text;
        notification.style.color = color;
        notification.style.borderColor = color;
        notification.style.boxShadow = `0 0 40px ${color}`;
        notification.style.opacity = '1';
        setTimeout(() => { notification.style.opacity = '0'; }, 1400);
    }

    function hasPower(id) { return activePowers[id] && activePowers[id].timer > 0; }

    function updatePowerTimers() {
        let changed = false;
        for (const id in activePowers) {
            activePowers[id].timer--;
            if (activePowers[id].timer <= 0) { delete activePowers[id]; changed = true; }
        }
        if (changed || Object.keys(activePowers).length > 0) updatePowersPanel();
    }

    function updatePowersPanel() {
        const ids = Object.keys(activePowers);
        if (ids.length === 0) { powersPanel.innerHTML = ''; return; }
        powersPanel.innerHTML = '';
        for (const id of ids) {
            const p = activePowers[id];
            const badge = document.createElement('div');
            badge.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(10,10,25,0.85);border-radius:20px;border:2px solid ${p.type.borderColor};font-size:13px;font-weight:bold;color:#fff;backdrop-filter:blur(6px);box-shadow:0 0 15px ${p.type.borderColor}66;`;
            const pct = (p.timer / p.totalTicks) * 100;
            badge.innerHTML = `
                <span style="font-size:18px;">${p.type.icon}</span>
                <span>${p.type.name}</span>
                <div style="width:40px;height:4px;background:rgba(0,0,0,0.6);border-radius:2px;overflow:hidden;margin-left:4px;">
                    <div style="height:100%;width:${pct}%;background:${p.type.borderColor};"></div>
                </div>
                <span style="min-width:30px;text-align:right;">${(p.timer / 60).toFixed(1)}s</span>
            `;
            powersPanel.appendChild(badge);
        }
    }

    let npcDialogHideTimeout = null;
    function showNpcDialog(npcType, text) {
        npcPortrait.textContent = npcType.icon;
        npcPortrait.style.borderColor = npcType.glowColor;
        npcPortrait.style.boxShadow = `0 0 20px ${npcType.glowColor}`;
        npcName.textContent = npcType.name;
        npcName.style.color = npcType.glowColor;
        npcTitle.textContent = npcType.title;
        npcHeader.style.borderBottomColor = npcType.glowColor;
        npcText.textContent = `"${text}"`;
        npcDialog.style.borderColor = npcType.glowColor;
        npcDialog.style.boxShadow = `0 0 30px ${npcType.glowColor}`;
        npcDialog.style.opacity = '1';
        npcDialog.style.transform = 'translateX(-50%) translateY(0)';
        if (npcDialogHideTimeout) clearTimeout(npcDialogHideTimeout);
        npcDialogHideTimeout = setTimeout(() => {
            npcDialog.style.opacity = '0';
            npcDialog.style.transform = 'translateX(-50%) translateY(20px)';
        }, 4000);
    }

    function startLevel() {
        if (moveInterval) clearInterval(moveInterval);
        gameOver = false; levelComplete = false; pelletsEaten = 0;
        direction = 'none'; nextDirection = 'none';
        powerMode = false; powerTimer = 0; ghostCombo = 0; levelMaxCombo = 0;
        fruit = null; fruitTimer = 0; fruitSpawned = false; fruitEaten = 0;
        portalActive = false; portalMesh = null;
        powerUpsOnMap = []; powerSpawnTimer = 30;
        powerSpawnInterval = Math.max(30, 70 - level);
        npcsOnMap = []; npcSpawnTimer = 20;
        npcSpawnInterval = Math.max(60, 120 - level);

        mapLayout = generateMaze(level);
        loadLevel();
        buildMaze();
        buildPellets();
        buildPlayer();
        buildGhosts();
        buildFruit();
        buildPortal();
        buildPowerUps();
        buildNpcs();
        updateHUD();
        updatePowersPanel();
        npcDialog.style.opacity = '0';

        const delay = getPlayerDelay();
        moveInterval = setInterval(moveEntities, delay);
    }

    function getPlayerDelay() {
        let base = Math.max(90, 170 - (level - 1) * 0.8);
        if (hasPower('speed')) base *= 0.55;
        return base;
    }

    function loadLevel() {
        grid = []; totalPellets = 0;
        const midR = Math.floor(ROWS / 2);
        const midC = Math.floor(COLS / 2);
        for (let row = 0; row < ROWS; row++) {
            const newRow = [];
            for (let col = 0; col < COLS; col++) {
                const val = mapLayout[row][col];
                if (val === 1) newRow.push(1);
                else if (val === 0) { newRow.push(0); totalPellets++; }
                else if (val === 4) { newRow.push(4); totalPellets++; }
                else if (val === 3) { newRow.push(2); player.x = col; player.y = row; }
                else newRow.push(2);
            }
            grid.push(newRow);
        }
        const spawns = []; const candidates = [];
        for (let r = 1; r < ROWS - 1; r++)
            for (let c = 1; c < COLS - 1; c++)
                if (grid[r][c] === 2 && !(r === player.y && c === player.x)) {
                    const dist = Math.abs(r - player.y) + Math.abs(c - player.x);
                    if (dist >= 8) candidates.push({ x: c, y: r, dist });
                }
        candidates.sort((a, b) => b.dist - a.dist);
        const used = [];
        for (const cand of candidates) {
            if (spawns.length >= 4) break;
            let ok = true;
            for (const s of used) if (Math.abs(s.x - cand.x) + Math.abs(s.y - cand.y) < 6) { ok = false; break; }
            if (ok) { spawns.push(cand); used.push(cand); }
        }
        while (spawns.length < 4 && candidates.length > 0) {
            const cand = candidates.shift();
            if (!spawns.find(s => s.x === cand.x && s.y === cand.y)) spawns.push(cand);
        }
        ghosts = [];
        for (let i = 0; i < 4; i++) {
            const spawn = spawns[i] || { x: 1, y: 1 };
            ghosts.push({
                x: spawn.x, y: spawn.y, type: GHOST_TYPES[i], index: i,
                wobble: Math.random() * Math.PI * 2,
                scared: false, eaten: false, respawnTimer: 0
            });
        }
    }

    function updateHUD() {
        hudScore.textContent = score;
        hudLives.textContent = lives;
        hudLevel.textContent = level;
        hudPowers.textContent = Object.keys(activePowers).length;
        const pct = totalPellets > 0 ? (pelletsEaten / totalPellets) * 100 : 0;
        hudLevelBar.style.width = pct + '%';
    }

    function isWall(col, row) {
        if (row < 0 || row >= ROWS) return true;
        if (col < 0 || col >= COLS) return false;
        return grid[row][col] === 1;
    }

    function wrapX(x) {
        if (x < 0) return COLS - 1;
        if (x >= COLS) return 0;
        return x;
    }

    function hasPellet(col, row) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
        const v = grid[row][col];
        return v === 0 || v === 4;
    }

    function eatPellet(col, row) {
        if (!hasPellet(col, row)) return;
        const wasPower = grid[row][col] === 4;
        grid[row][col] = 2;
        pelletsEaten++;
        for (let i = pelletMeshes.length - 1; i >= 0; i--) {
            const p = pelletMeshes[i];
            if (p.col === col && p.row === row) {
                scene.remove(p.mesh); p.mesh.geometry.dispose();
                pelletMeshes.splice(i, 1); break;
            }
        }
        if (wasPower) { score += 50; activatePowerMode(); }
        else score += 10;
        updateHUD();
        if (pelletsEaten >= totalPellets) {
            levelComplete = true; portalActive = true;
            buildPortal(); updateHUD();
        }
    }

    function activatePowerMode() {
        powerMode = true; powerTimer = POWER_DURATION; ghostCombo = 0;
        for (const g of ghosts) if (!g.eaten) g.scared = true;
        updateHUD();
    }

    function checkNpcInteraction() {
        for (let i = npcsOnMap.length - 1; i >= 0; i--) {
            const npc = npcsOnMap[i];
            if (npc.col === player.x && npc.row === player.y) {
                showNpcDialog(npc.type, npc.hint);
                stats.npcsVisited++;
                if (npc.type.id === 'merchant') {
                    score += 50; updateHUD();
                    if (Math.random() < 0.4) {
                        const randomPower = POWER_LIST[Math.floor(Math.random() * (POWER_LIST.length - 1))];
                        setTimeout(() => activatePower(randomPower), 800);
                    }
                } else if (npc.type.id === 'sage' && Math.random() < 0.15) {
                    score += 100; updateHUD();
                }
                npcGroup.remove(npc.mesh);
                npc.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); });
                npcsOnMap.splice(i, 1);
                updateHUD();
                break;
            }
        }
    }

    function movePlayer() {
        if (gameOver) return;
        let dx = 0, dy = 0;
        if (direction === 'up') dy = -1;
        else if (direction === 'down') dy = 1;
        else if (direction === 'left') dx = -1;
        else if (direction === 'right') dx = 1;
        else return;
        const newX = wrapX(player.x + dx);
        const newY = player.y + dy;
        if (!isWall(newX, newY)) {
            player.x = newX; player.y = newY;
            eatPellet(player.x, player.y);
            checkNpcInteraction();
            const midR = Math.floor(ROWS / 2), midC = Math.floor(COLS / 2);
            if (portalActive && player.x === midC && player.y === midR) advanceLevel();
        }
    }

    function advanceLevel() {
        if (levelComplete && portalActive) {
            portalActive = false;
            if (moveInterval) clearInterval(moveInterval);
            level++;
            if (level > stats.maxLevel) stats.maxLevel = level;
            if (level > TOTAL_LEVELS) { winGame(); return; }
            score += 500; updateHUD(); showLevelComplete();
        }
    }

    function winGame() {
        gameOver = true;
        stats.totalScore += score;
        stats.games++;
        if (score > stats.highScore) stats.highScore = score;
        if (levelMaxCombo > stats.maxCombo) stats.maxCombo = levelMaxCombo;
        persist();
        showNotification('🏆 VITÓRIA TOTAL!', '#aaffaa');
        setTimeout(() => {
            showNotification(`Pontuação: ${score}`, '#ffcc00');
            setTimeout(() => stopGame(), 2500);
        }, 2500);
    }

    function showLevelComplete() {
        showNotification(`🌀 FASE ${level - 1} COMPLETA!`, '#ff66ff');
        setTimeout(() => { if (running) startLevel(); }, 2200);
    }

    function getGhostTarget(ghost) {
        if (ghost.scared) return { x: player.x, y: player.y, flee: true };
        switch (ghost.type.name) {
            case 'blinky': return { x: player.x, y: player.y };
            case 'pinky': {
                let dx = 0, dy = 0;
                if (direction === 'up') dy = -1;
                else if (direction === 'down') dy = 1;
                else if (direction === 'left') dx = -1;
                else if (direction === 'right') dx = 1;
                return { x: wrapX(player.x + dx * 3), y: Math.max(0, Math.min(ROWS - 1, player.y + dy * 3)) };
            }
            case 'inky': {
                const blinky = ghosts[0];
                const midX = wrapX(player.x + (player.x - blinky.x));
                const midY = Math.max(0, Math.min(ROWS - 1, player.y + (player.y - blinky.y)));
                return { x: midX, y: midY };
            }
            case 'clyde': {
                const dist = Math.abs(ghost.x - player.x) + Math.abs(ghost.y - player.y);
                if (dist < 6) return { x: 1, y: ROWS - 2, scatter: true };
                return { x: player.x, y: player.y };
            }
        }
        return { x: player.x, y: player.y };
    }

    function moveGhost(ghost) {
        if (gameOver) return;
        if (ghost.eaten) {
            ghost.respawnTimer--;
            if (ghost.respawnTimer <= 0) {
                ghost.eaten = false; ghost.scared = false;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const r = 1 + Math.floor(Math.random() * (ROWS - 2));
                    const c = 1 + Math.floor(Math.random() * (COLS - 2));
                    if (grid[r][c] === 2 && !(r === player.y && c === player.x)) {
                        ghost.x = c; ghost.y = r; break;
                    }
                }
            }
            return;
        }
        const target = getGhostTarget(ghost);
        const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
        const valid = dirs.filter(d => !isWall(wrapX(ghost.x + d.dx), ghost.y + d.dy));
        if (valid.length === 0) return;
        let bestDir = valid[0];
        let bestDist = target.flee ? -Infinity : Infinity;
        for (const d of valid) {
            const nx = wrapX(ghost.x + d.dx), ny = ghost.y + d.dy;
            const dist = Math.abs(nx - target.x) + Math.abs(ny - target.y);
            if (target.flee) { if (dist > bestDist) { bestDist = dist; bestDir = d; } }
            else { if (dist < bestDist) { bestDist = dist; bestDir = d; } }
        }
        let chosenDir = bestDir;
        if (Math.random() < 0.1) chosenDir = valid[Math.floor(Math.random() * valid.length)];
        const newX = wrapX(ghost.x + chosenDir.dx);
        const newY = ghost.y + chosenDir.dy;
        if (!isWall(newX, newY)) { ghost.x = newX; ghost.y = newY; }
        ghost.wobble += 0.3;
    }

    function checkGhostCollision() {
        if (gameOver) return;
        if (hasPower('invincible') || hasPower('invisibility')) return;
        for (const ghost of ghosts) {
            if (ghost.eaten) continue;
            if (ghost.x === player.x && ghost.y === player.y) {
                if (powerMode && ghost.scared) {
                    ghost.eaten = true; ghost.respawnTimer = 20; ghostCombo++;
                    if (ghostCombo > levelMaxCombo) levelMaxCombo = ghostCombo;
                    stats.ghostsEaten++;
                    const points = 200 * Math.pow(2, ghostCombo - 1);
                    score += points; updateHUD();
                } else {
                    lives--; updateHUD();
                    if (lives <= 0) {
                        gameOver = true;
                        if (moveInterval) clearInterval(moveInterval);
                        stats.totalScore += score;
                        stats.games++;
                        if (score > stats.highScore) stats.highScore = score;
                        if (levelMaxCombo > stats.maxCombo) stats.maxCombo = levelMaxCombo;
                        persist();
                        showNotification('💀 GAME OVER', '#ff3333');
                        setTimeout(() => {
                            showNotification(`Fase ${level} • ${score} pts`, '#ffcc00');
                            setTimeout(() => stopGame(), 2500);
                        }, 2200);
                    } else {
                        player.x = Math.floor(COLS/2); player.y = Math.floor(ROWS/2);
                        direction = 'none'; nextDirection = 'none';
                        powerMode = false; powerTimer = 0; ghostCombo = 0;
                        activePowers = {}; updatePowersPanel();
                        for (const g of ghosts) {
                            g.scared = false; g.eaten = false;
                            for (let attempt = 0; attempt < 50; attempt++) {
                                const r = 1 + Math.floor(Math.random() * (ROWS - 2));
                                const c = 1 + Math.floor(Math.random() * (COLS - 2));
                                const midR = Math.floor(ROWS/2), midC = Math.floor(COLS/2);
                                if (grid[r][c] === 2 && Math.abs(r - midR) + Math.abs(c - midC) > 8) {
                                    g.x = c; g.y = r; break;
                                }
                            }
                        }
                        updateHUD();
                    }
                    break;
                }
            }
        }
    }

    function checkPowerUpPickup() {
        for (let i = powerUpsOnMap.length - 1; i >= 0; i--) {
            const p = powerUpsOnMap[i];
            if (p.col === player.x && p.row === player.y) {
                activatePower(p.type);
                powerUpGroup.remove(p.mesh);
                p.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); });
                powerUpsOnMap.splice(i, 1);
            }
        }
    }

    function applyMagnetPower() {
        if (!hasPower('magnet')) return;
        for (let i = pelletMeshes.length - 1; i >= 0; i--) {
            const p = pelletMeshes[i];
            const dist = Math.abs(p.col - player.x) + Math.abs(p.row - player.y);
            if (dist <= 3 && dist > 0) {
                const dx = Math.sign(player.x - p.col);
                const dy = Math.sign(player.y - p.row);
                const newCol = p.col + dx;
                const newRow = p.row + dy;
                if (!isWall(newCol, newRow) && grid[newRow] && grid[newRow][newCol] === 2) {
                    grid[p.row][p.col] = 2;
                    grid[newRow][newCol] = 0;
                    p.col = newCol; p.row = newRow;
                    p.mesh.position.set(toWorldX(newCol), 0.35, toWorldZ(newRow));
                }
            }
        }
    }

    function trySpawnFruit() {
        const pct = pelletsEaten / totalPellets;
        const midR = Math.floor(ROWS/2), midC = Math.floor(COLS/2);
        if (!fruitSpawned && pct >= 0.3 && fruitEaten === 0) {
            if (grid[midR][midC] === 2 || (player.x !== midC || player.y !== midR)) {
                fruit = { x: midC, y: midR, type: 'cherry', value: 100 };
                fruitTimer = 60; fruitSpawned = true; buildFruit();
            }
        } else if (!fruitSpawned && pct >= 0.7 && fruitEaten === 1) {
            if (grid[midR][midC] === 2 || (player.x !== midC || player.y !== midR)) {
                fruit = { x: midC, y: midR, type: 'strawberry', value: 300 };
                fruitTimer = 60; fruitSpawned = true; buildFruit();
            }
        }
    }

    function checkFruitEat() {
        if (!fruit) return;
        if (player.x === fruit.x && player.y === fruit.y) {
            score += fruit.value;
            fruit = null; fruitEaten++; fruitSpawned = false;
            updateHUD(); buildFruit();
        }
    }

    function updateFruit() {
        if (fruit) {
            fruitTimer--;
            if (fruitTimer <= 0) { fruit = null; fruitSpawned = false; buildFruit(); }
        }
    }

    function moveEntities() {
        if (gameOver || !running) return;
        if (nextDirection !== 'none') {
            const testDx = nextDirection === 'left' ? -1 : (nextDirection === 'right' ? 1 : 0);
            const testDy = nextDirection === 'up' ? -1 : (nextDirection === 'down' ? 1 : 0);
            if (!isWall(wrapX(player.x + testDx), player.y + testDy)) direction = nextDirection;
            nextDirection = 'none';
        }
        movePlayer();
        if (powerMode) {
            powerTimer--;
            if (powerTimer <= 0) {
                powerMode = false;
                for (const g of ghosts) g.scared = false;
                ghostCombo = 0; updateHUD();
            }
        }
        const frozen = hasPower('freeze');
        if (!frozen) for (const ghost of ghosts) moveGhost(ghost);
        checkGhostCollision();
        applyMagnetPower();
        checkPowerUpPickup();
        updatePowerTimers();

        powerSpawnTimer--;
        if (powerSpawnTimer <= 0) {
            spawnPowerUp();
            powerSpawnTimer = powerSpawnInterval + Math.floor(Math.random() * 20);
        }

        npcSpawnTimer--;
        if (npcSpawnTimer <= 0) {
            if (npcsOnMap.length < 3) spawnNpc();
            npcSpawnTimer = npcSpawnInterval + Math.floor(Math.random() * 40);
        }

        for (let i = npcsOnMap.length - 1; i >= 0; i--) {
            const npc = npcsOnMap[i];
            if (animTime - npc.spawnTime > 45) {
                npcGroup.remove(npc.mesh);
                npc.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); });
                npcsOnMap.splice(i, 1);
                updateHUD();
            }
        }

        trySpawnFruit();
        checkFruitEat();
        updateFruit();
    }

    function animate() {
        if (!running) return;
        rafId = requestAnimationFrame(animate);
        const dt = clock.getDelta();
        animTime += dt;

        if (playerMesh) {
            const targetX = toWorldX(player.x);
            const targetZ = toWorldZ(player.y);
            playerMesh.position.x += (targetX - playerMesh.position.x) * 0.35;
            playerMesh.position.z += (targetZ - playerMesh.position.z) * 0.35;
            playerMesh.position.y = 0.45 + Math.sin(animTime * 3) * 0.03;
            let targetRotY = playerMesh.rotation.y;
            if (direction === 'right') targetRotY = 0;
            else if (direction === 'left') targetRotY = Math.PI;
            else if (direction === 'up') targetRotY = Math.PI / 2;
            else if (direction === 'down') targetRotY = -Math.PI / 2;
            let diff = targetRotY - playerMesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            playerMesh.rotation.y += diff * 0.25;

            const mat = playerBodyMesh.material;
            if (hasPower('invisibility')) {
                mat.transparent = true;
                mat.opacity = 0.15 + Math.sin(animTime * 10) * 0.1;
                mat.emissive.setHex(0xaaaaaa);
                mat.color.setHex(0xcccccc);
            } else if (hasPower('invincible')) {
                mat.transparent = false; mat.opacity = 1;
                const blink = Math.floor(animTime * 8) % 2 === 0;
                mat.color.setHex(blink ? 0x66ff66 : 0xffffff);
                mat.emissive.setHex(blink ? 0x66ff66 : 0x88ff88);
            } else if (powerMode) {
                mat.transparent = false; mat.opacity = 1;
                const blink = Math.floor(animTime * 6) % 2 === 0;
                mat.color.setHex(blink ? 0xffffff : 0x00ffff);
                mat.emissive.setHex(blink ? 0x8888ff : 0x00ffff);
            } else {
                mat.transparent = false; mat.opacity = 1;
                mat.color.setHex(pacColor.color);
                mat.emissive.setHex(pacColor.emissive);
            }

            const mouth = playerMesh.getObjectByName('mouth');
            if (mouth) {
                const open = Math.abs(Math.sin(animTime * 8)) * 0.5 + 0.5;
                mouth.scale.set(open, open, 1);
            }
        }

        const frozen = hasPower('freeze');
        for (let i = 0; i < ghosts.length; i++) {
            const g = ghosts[i];
            const gm = ghostMeshes[i];
            if (!gm) continue;
            const targetX = toWorldX(g.x);
            const targetZ = toWorldZ(g.y);
            if (g.eaten) {
                gm.group.position.x += (targetX - gm.group.position.x) * 0.4;
                gm.group.position.z += (targetZ - gm.group.position.z) * 0.4;
                gm.body.visible = false;
                continue;
            }
            gm.body.visible = true;
            const speed = frozen ? 0.05 : 0.4;
            gm.group.position.x += (targetX - gm.group.position.x) * speed;
            gm.group.position.z += (targetZ - gm.group.position.z) * speed;
            gm.group.position.y = Math.sin(animTime * 2 + g.wobble) * 0.05;
            gm.group.rotation.y = Math.sin(animTime * 1.5 + g.wobble) * 0.15;
            if (g.scared) {
                const blink = powerTimer < 15 && Math.floor(animTime * 6) % 2 === 0;
                const c = blink ? 0xffffff : 0x2244cc;
                gm.bodyMat.color.setHex(c); gm.bodyMat.emissive.setHex(c);
            } else if (frozen) {
                gm.bodyMat.color.setHex(0x88ddff); gm.bodyMat.emissive.setHex(0x0066ff);
            } else {
                gm.bodyMat.color.setHex(gm.originalColor);
                gm.bodyMat.emissive.setHex(gm.originalColor);
            }
            const dx = player.x - g.x, dy = player.y - g.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const lx = (dx / dist) * 0.03, lz = (dy / dist) * 0.03;
            gm.pupilL.position.x = lx; gm.pupilL.position.z = lz;
            gm.pupilR.position.x = lx; gm.pupilR.position.z = lz;
        }

        const pulse = 0.9 + Math.sin(animTime * 4) * 0.1;
        for (const p of pelletMeshes) {
            p.mesh.scale.setScalar(pulse);
            p.mesh.position.y = 0.35 + Math.sin(animTime * 3 + p.col + p.row) * 0.05;
        }

        for (const p of powerUpsOnMap) {
            p.mesh.rotation.y += 0.04;
            p.mesh.position.y = Math.sin(animTime * 3 + p.col + p.row) * 0.12;
            if (p.mesh.children[1]) p.mesh.children[1].rotation.z += 0.03;
            if (p.mesh.children[2]) p.mesh.children[2].rotation.x += 0.03;
        }

        for (const npc of npcsOnMap) {
            const t = npc.type.id;
            const bobOffset = npc.bobOffset;
            if (t === 'sage') {
                npc.mesh.position.y = Math.sin(animTime * 1.2 + bobOffset) * 0.15;
                npc.mesh.rotation.y = Math.sin(animTime * 0.6 + bobOffset) * 0.2;
                const orb = npc.mesh.getObjectByName('orb');
                if (orb) { orb.position.y = 1.45 + Math.sin(animTime * 3) * 0.08; orb.scale.setScalar(1 + Math.sin(animTime * 5) * 0.15); }
                const star = npc.mesh.getObjectByName('star');
                if (star) star.rotation.y += 0.05;
                const aura = npc.mesh.getObjectByName('aura');
                if (aura) { aura.rotation.z += 0.01; aura.scale.setScalar(1 + Math.sin(animTime * 2) * 0.1); }
            } else if (t === 'trickster') {
                npc.mesh.position.y = Math.sin(animTime * 4 + bobOffset) * 0.12;
                npc.mesh.rotation.y = Math.sin(animTime * 3 + bobOffset) * 0.6;
                const tail = npc.mesh.getObjectByName('tail');
                if (tail) { tail.rotation.z = Math.sin(animTime * 5 + bobOffset) * 0.5; tail.rotation.x = Math.cos(animTime * 4 + bobOffset) * 0.3; }
                for (let i = 0; i < 5; i++) {
                    const spark = npc.mesh.getObjectByName(`spark${i}`);
                    if (spark) {
                        const a = (i / 5) * Math.PI * 2 + animTime * 2;
                        spark.position.set(Math.cos(a) * 0.6, 0.6 + Math.sin(a * 2) * 0.15, Math.sin(a) * 0.6);
                        spark.rotation.y += 0.1;
                    }
                }
            } else if (t === 'whisperer') {
                npc.mesh.position.y = Math.sin(animTime * 1.8 + bobOffset) * 0.2;
                npc.mesh.rotation.y = animTime * 0.4;
                for (let i = 0; i < 4; i++) {
                    const veil = npc.mesh.getObjectByName(`veil${i}`);
                    if (veil) { veil.rotation.z += 0.02 + i * 0.01; veil.rotation.x = Math.PI / 2 + Math.sin(animTime * 2 + i) * 0.3; }
                }
                const gl = npc.mesh.getObjectByName('glowL');
                const gr = npc.mesh.getObjectByName('glowR');
                if (gl && gr) {
                    const floatY = Math.sin(animTime * 4) * 0.03;
                    gl.position.y = 0.78 + floatY;
                    gr.position.y = 0.78 + floatY;
                }
                const mouth = npc.mesh.getObjectByName('mouth');
                if (mouth) { const s = 1 + Math.sin(animTime * 8) * 0.3; mouth.scale.set(s, s, 1); }
                const ghostLight = npc.mesh.getObjectByName('ghostLight');
                if (ghostLight) ghostLight.intensity = 1.5 + Math.sin(animTime * 12) * 0.5;
            } else if (t === 'merchant') {
                npc.mesh.position.y = Math.abs(Math.sin(animTime * 2 + bobOffset)) * 0.08;
                npc.mesh.rotation.y = Math.sin(animTime * 1.5 + bobOffset) * 0.15;
                for (let i = 0; i < 5; i++) {
                    const coin = npc.mesh.getObjectByName(`coin${i}`);
                    if (coin) { coin.rotation.y += 0.08; coin.position.y += Math.sin(animTime * 3 + i) * 0.002; }
                }
                const aura = npc.mesh.getObjectByName('aura');
                if (aura) { aura.rotation.z += 0.015; aura.scale.setScalar(1 + Math.sin(animTime * 2.5) * 0.08); }
            }
        }

        if (fruitMesh) {
            fruitMesh.rotation.y += 0.03;
            fruitMesh.position.y = Math.sin(animTime * 3) * 0.08;
        }

        if (portalMesh) {
            portalMesh.rotation.y += 0.04;
            const s = 1 + Math.sin(animTime * 5) * 0.08;
            portalMesh.scale.setScalar(s);
            if (portalLight) portalLight.intensity = 2 + Math.sin(animTime * 6) * 0.8;
        }

        if (hasPower('invisibility')) pointLight.color.setHex(0xaaaaaa);
        else if (hasPower('speed')) pointLight.color.setHex(0xffff00);
        else if (hasPower('invincible')) pointLight.color.setHex(0x66ff66);
        else if (hasPower('freeze')) pointLight.color.setHex(0x00ffff);
        else if (hasPower('magnet')) pointLight.color.setHex(0xff66cc);
        else pointLight.color.setHex(0xffaa00);
        pointLight.intensity = 0.5 + Math.sin(animTime * 2) * 0.15;

        renderer.render(scene, camera);
    }

    function handleKeydown(e) {
        const key = e.key;
        let desiredDir = 'none';
        if (key === 'ArrowUp' || key === 'w' || key === 'W') desiredDir = 'up';
        else if (key === 'ArrowDown' || key === 's' || key === 'S') desiredDir = 'down';
        else if (key === 'ArrowLeft' || key === 'a' || key === 'A') desiredDir = 'left';
        else if (key === 'ArrowRight' || key === 'd' || key === 'D') desiredDir = 'right';
        else if (key === 'Escape') { stopGame(); return; }
        else return;
        e.preventDefault();
        if (gameOver) return;
        const dx = desiredDir === 'left' ? -1 : (desiredDir === 'right' ? 1 : 0);
        const dy = desiredDir === 'up' ? -1 : (desiredDir === 'down' ? 1 : 0);
        if (!isWall(wrapX(player.x + dx), player.y + dy)) {
            direction = desiredDir; nextDirection = 'none';
        } else {
            nextDirection = desiredDir;
        }
    }

    function onResize() {
        const size = Math.min(window.innerWidth - 40, window.innerHeight - 40, 800);
        container.style.width = size + 'px';
        container.style.height = size + 'px';
        renderer.setSize(size, size, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, qs.pixelRatio));
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', handleKeydown, { passive: false });
    container.querySelectorAll('#touch-controls button[data-dir]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (gameOver) return;
            const desiredDir = btn.dataset.dir;
            const dx = desiredDir === 'left' ? -1 : (desiredDir === 'right' ? 1 : 0);
            const dy = desiredDir === 'up' ? -1 : (desiredDir === 'down' ? 1 : 0);
            if (!isWall(wrapX(player.x + dx), player.y + dy)) {
                direction = desiredDir; nextDirection = 'none';
            } else {
                nextDirection = desiredDir;
            }
        });
    });

    startLevel();
    animate();
    onResize();

    stats.games++;
    persist();

    return function cleanup() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (moveInterval) clearInterval(moveInterval);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', handleKeydown);
        renderer.dispose();
        scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });
        persist();
    };
}
