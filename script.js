/**
 * DUAL N-BACK PRO v0.8.2 - REPAIR PATCH
 * Fixes:
 * 1. Start Session context error.
 * 2. Case-sensitive property mapping for Grid/Internal Res settings.
 * 3. NaN protection for interval settings.
 */

const AppState = {
    version: "0.8.2",
    settings: {
        n: 2,
        gridRows: 1,
        gridCols: 1,
        gridRes: 3,
        intensity: 95,
        intervalMs: 3000,
        flashMs: 600
    },
    history: [], 
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
        AppState.settings.intensity = parseInt(val);
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
        
        // Using the exact property names from AppState
        const { gridRows, gridCols, gridRes } = AppState.settings;
        document.documentElement.style.setProperty('--grid-rows', gridRows);
        document.documentElement.style.setProperty('--grid-cols', gridCols);

        for (let i = 0; i < (gridRows * gridCols); i++) {
            const container = document.createElement('div');
            container.classList.add('stimulus-container');
            container.setAttribute('data-key', i + 1);
            container.onclick = () => GameLogic.checkMatch(i);
            container.style.gridTemplateColumns = `repeat(${gridRes}, 1fr)`;
            
            for (let j = 0; j < (gridRes * gridRes); j++) {
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
        this.stop(); 
        AppState.history = [];
        AppState.currentIndex = -1;
        
        // Pull fresh values from inputs
        const nInput = parseInt(document.getElementById('n-level').value);
        const intervalInput = parseInt(document.getElementById('interval-ms').value);
        
        // Safety: Prevent NaN or 0 from breaking the interval
        AppState.settings.n = isNaN(nInput) ? 2 : nInput;
        AppState.settings.intervalMs = isNaN(intervalInput) || intervalInput < 100 ? 3000 : intervalInput;
        
        document.getElementById('n-display').innerText = AppState.settings.n;
        document.getElementById('feedback').innerText = "Session Started";
        document.getElementById('feedback').style.color = "var(--dynamic-text)";

        // Explicitly bind 'this' so nextTurn works inside the interval
        AppState.gameInterval = setInterval(() => this.nextTurn(), AppState.settings.intervalMs);
        this.nextTurn(); 
    },
    stop() {
        if (AppState.gameInterval) clearInterval(AppState.gameInterval);
    },
    nextTurn() {
        AppState.currentIndex++;
        document.getElementById('step-count').innerText = AppState.currentIndex + 1;
        
        const { gridRows, gridCols, gridRes, flashMs } = AppState.settings;
        const numBoxes = gridRows * gridCols;
        const res = gridRes;
        const turnPositions = [];

        for (let b = 0; b < numBoxes; b++) {
            const randomCell = Math.floor(Math.random() * (res * res));
            turnPositions.push(randomCell);
            
            const el = document.getElementById(`cell-${b}-${randomCell}`);
            if (el) {
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), flashMs);
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
        // Sync setting inputs to state before export
        AppState.settings.n = parseInt(document.getElementById('n-level').value);
        AppState.settings.gridRows = parseInt(document.getElementById('grid-rows').value);
        AppState.settings.gridCols = parseInt(document.getElementById('grid-cols').value);
        AppState.settings.gridRes = parseInt(document.getElementById('grid-res').value);
        AppState.settings.intervalMs = parseInt(document.getElementById('interval-ms').value);

        const string = btoa(JSON.stringify(AppState.settings));
        document.getElementById('save-string').value = string;
        document.getElementById('feedback').innerText = "Exported String Created";
    },
    import() {
        try {
            const string = document.getElementById('save-string').value;
            if (!string) return;
            const data = JSON.parse(atob(string));
            
            // Merge loaded data into AppState
            Object.assign(AppState.settings, data);
            
            // Refresh UI with loaded values
            document.getElementById('n-level').value = AppState.settings.n;
            document.getElementById('grid-rows').value = AppState.settings.gridRows;
            document.getElementById('grid-cols').value = AppState.settings.gridCols;
            document.getElementById('grid-res').value = AppState.settings.gridRes;
            document.getElementById('interval-ms').value = AppState.settings.intervalMs;
            
            GridEngine.render();
            ThemeManager.setIntensity(AppState.settings.intensity);
            document.getElementById('feedback').innerText = "Settings Loaded";
        } catch(e) {
            alert("Error: Invalid Save String");
        }
    }
};

/** BOOTSTRAP **/
window.toggleSettings = () => document.getElementById('settings-panel').classList.toggle('closed');
window.openTab = (name) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
};
window.setThemePreset = (p) => ThemeManager.setPreset(p);

document.getElementById('start-btn').onclick = () => GameLogic.start();
document.getElementById('save-btn').onclick = () => DataManager.export();
document.getElementById('load-btn').onclick = () => DataManager.import();

window.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (!isNaN(key) && key > 0) GameLogic.checkMatch(key - 1);
});

// FIXED: Explicit mapping for input changes to match AppState CamelCase
const settingMap = {
    'grid-rows': 'gridRows',
    'grid-cols': 'gridCols',
    'grid-res': 'gridRes'
};

['grid-rows', 'grid-cols', 'grid-res'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.onchange = (e) => {
            const property = settingMap[id];
            AppState.settings[property] = parseInt(e.target.value);
            GridEngine.render();
        };
    }
});

// Initial Render
GridEngine.render();
ThemeManager.init();