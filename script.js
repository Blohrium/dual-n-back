/**
 * DUAL N-BACK PRO v0.8.1
 * MODULE MAP:
 * 1. AppState     - Data & Settings
 * 2. ThemeManager - Visuals & Presets
 * 3. GridEngine   - Building & Flashing Boxes
 * 4. GameLogic    - N-Back Math & Timing
 * 5. DataManager  - Save/Load String Logic
 */

const AppState = {
    version: "0.8.1",
    settings: {
        n: 2,
        gridRows: 1,
        gridCols: 1,
        gridRes: 3,
        intensity: 95,
        intervalMs: 3000,
        flashMs: 600
    },
    history: [], // Stores [turnIndex][boxIndex]
    currentIndex: -1,
    gameInterval: null
};

const ThemeManager = {
    init() {
        const slider = document.getElementById('theme-intensity');
        if (slider) {
            slider.oninput = (e) => this.setIntensity(e.target.value);
        }
    },
    setIntensity(val) {
        AppState.settings.intensity = val;
        document.documentElement.style.setProperty('--bg-intensity', val);
    },
    setPreset(preset) {
        const levels = { 'amoled': 100, 'dark': 90, 'light': 10 };
        this.setIntensity(levels[preset]);
        const slider = document.getElementById('theme-intensity');
        if (slider) slider.value = levels[preset];
    }
};

const GridEngine = {
    render() {
        const mainContainer = document.getElementById('game-grid');
        if (!mainContainer) return;
        mainContainer.innerHTML = '';
        
        const { gridRows, gridCols, gridRes } = AppState.settings;
        document.documentElement.style.setProperty('--grid-rows', gridRows);
        document.documentElement.style.setProperty('--grid-cols', gridCols);

        for (let i = 0; i < gridRows * gridCols; i++) {
            const container = document.createElement('div');
            container.classList.add('stimulus-container');
            container.setAttribute('data-key', i + 1);
            container.onclick = () => GameLogic.checkMatch(i);
            container.style.gridTemplateColumns = `repeat(${gridRes}, 1fr)`;
            
            for (let j = 0; j < gridRes * gridRes; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.id = `cell-${i}-${j}`;
                container.appendChild(cell);
            }
            mainContainer.appendChild(container);
        }
    }
};

const GameLogic = {
    start() {
        this.stop(); // Clear any existing game
        AppState.history = [];
        AppState.currentIndex = -1;
        
        // Sync settings from inputs
        AppState.settings.n = parseInt(document.getElementById('n-level').value);
        AppState.settings.intervalMs = parseInt(document.getElementById('interval-ms').value);
        document.getElementById('n-display').innerText = AppState.settings.n;
        
        AppState.gameInterval = setInterval(() => this.nextTurn(), AppState.settings.intervalMs);
        this.nextTurn(); // Start first turn immediately
    },
    stop() {
        if (AppState.gameInterval) clearInterval(AppState.gameInterval);
    },
    nextTurn() {
        AppState.currentIndex++;
        document.getElementById('step-count').innerText = AppState.currentIndex + 1;
        
        const numBoxes = AppState.settings.gridRows * AppState.settings.gridCols;
        const res = AppState.settings.gridRes;
        const turnPositions = [];

        for (let b = 0; b < numBoxes; b++) {
            const randomCell = Math.floor(Math.random() * (res * res));
            turnPositions.push(randomCell);
            
            const el = document.getElementById(`cell-${b}-${randomCell}`);
            if (el) {
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), AppState.settings.flashMs);
            }
        }
        AppState.history.push(turnPositions);
    },
    checkMatch(boxIdx) {
        if (AppState.currentIndex < AppState.settings.n) return;
        
        const current = AppState.history[AppState.currentIndex][boxIdx];
        const past = AppState.history[AppState.currentIndex - AppState.settings.n][boxIdx];
        const fb = document.getElementById('feedback');

        if (current === past) {
            fb.innerText = `Box ${boxIdx+1}: MATCH!`;
            fb.style.color = "#2ecc71";
        } else {
            fb.innerText = `Box ${boxIdx+1}: MISS!`;
            fb.style.color = "#e74c3c";
        }
    }
};

const DataManager = {
    export() {
        // Update state from UI before exporting
        AppState.settings.n = parseInt(document.getElementById('n-level').value);
        AppState.settings.gridRows = parseInt(document.getElementById('grid-rows').value);
        AppState.settings.gridCols = parseInt(document.getElementById('grid-cols').value);
        AppState.settings.gridRes = parseInt(document.getElementById('grid-res').value);
        
        const string = btoa(JSON.stringify(AppState.settings));
        document.getElementById('save-string').value = string;
    },
    import() {
        try {
            const string = document.getElementById('save-string').value;
            const data = JSON.parse(atob(string));
            AppState.settings = data;
            GridEngine.render();
            ThemeManager.setIntensity(data.intensity);
            alert("Settings Imported Successfully");
        } catch(e) {
            alert("Error: Invalid Save String");
        }
    }
};

// --- BOOTSTRAP / INITIALIZATION ---

window.toggleSettings = () => document.getElementById('settings-panel').classList.toggle('closed');

window.openTab = (name) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    event.currentTarget.classList.add('active');
};

window.setThemePreset = (p) => ThemeManager.setPreset(p);

// Setup Listeners
document.getElementById('start-btn').onclick = () => GameLogic.start();
document.getElementById('save-btn').onclick = () => DataManager.export();
document.getElementById('load-btn').onclick = () => DataManager.import();

// Keybindings
window.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (!isNaN(key) && key > 0) GameLogic.checkMatch(key - 1);
});

// Auto-Refresh Grid on Setting Change
['grid-rows', 'grid-cols', 'grid-res'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
        AppState.settings[id.replace('grid-','grid')] = parseInt(e.target.value);
        GridEngine.render();
    };
});

// Initial Launch
GridEngine.render();
ThemeManager.init();