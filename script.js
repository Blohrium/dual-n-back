const state = {
    settings: {
        n: 2,
        layoutSize: 1,
        gridRes: 3,
        intensity: 90,
        interval: 3000
    },
    history: [],
    currentIndex: -1,
    gameActive: false
};

// 1. UI HELPERS
function toggleSettings() { document.getElementById('settings-panel').classList.toggle('closed'); }

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 2. GRID & THEME LOGIC
function createGrid() {
    const mainContainer = document.getElementById('game-grid');
    mainContainer.innerHTML = '';
    const L = state.settings.layoutSize;
    const R = state.settings.gridRes;
    document.documentElement.style.setProperty('--layout-size', L);

    for (let i = 0; i < L * L; i++) {
        const container = document.createElement('div');
        container.classList.add('stimulus-container');
        container.style.gridTemplateColumns = `repeat(${R}, 1fr)`;
        for (let j = 0; j < R * R; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`;
            container.appendChild(cell);
        }
        mainContainer.appendChild(container);
    }
}

function updateTheme(val) {
    state.settings.intensity = val;
    document.documentElement.style.setProperty('--bg-intensity', val);
    document.getElementById('theme-intensity').value = val;
}

// 3. GAME ENGINE
function nextTurn() {
    state.currentIndex++;
    const L = state.settings.layoutSize;
    const R = state.settings.gridRes;
    
    // Pick random container and random cell inside it
    const randomContainer = Math.floor(Math.random() * (L * L));
    const randomCell = Math.floor(Math.random() * (R * R));
    
    const pos = { c: randomContainer, i: randomCell };
    state.history.push(pos);

    const target = document.getElementById(`cell-${pos.c}-${pos.i}`);
    if (target) {
        target.classList.add('active');
        setTimeout(() => target.classList.remove('active'), 600);
    }
}

// 4. DATA LOGIC (SAVE/LOAD)
function exportSave() {
    const string = btoa(JSON.stringify(state.settings));
    document.getElementById('save-string').value = string;
    localStorage.setItem('nback-save', string);
}

function loadSave() {
    try {
        const string = document.getElementById('save-string').value;
        const data = JSON.parse(atob(string));
        state.settings = data;
        
        // Refresh UI
        document.getElementById('n-level').value = data.n;
        document.getElementById('layout-size').value = data.layoutSize;
        document.getElementById('grid-res').value = data.gridRes;
        updateTheme(data.intensity);
        createGrid();
        alert("Settings Loaded!");
    } catch(e) { alert("Invalid Save String"); }
}

// 5. EVENT LISTENERS
document.getElementById('start-btn').onclick = () => {
    state.history = [];
    state.currentIndex = -1;
    state.settings.n = parseInt(document.getElementById('n-level').value);
    setInterval(nextTurn, state.settings.interval);
};

document.getElementById('pos-match').onclick = () => {
    if (state.currentIndex < state.settings.n) return;
    const current = state.history[state.currentIndex];
    const past = state.history[state.currentIndex - state.settings.n];
    
    if (current.c === past.c && current.i === past.i) {
        alert("Correct Match!");
    } else {
        alert("Wrong!");
    }
};

document.getElementById('theme-intensity').oninput = (e) => updateTheme(e.target.value);
document.getElementById('save-btn').onclick = exportSave;
document.getElementById('load-btn').onclick = loadSave;
document.getElementById('layout-size').onchange = (e) => { state.settings.layoutSize = e.target.value; createGrid(); };
document.getElementById('grid-res').onchange = (e) => { state.settings.gridRes = e.target.value; createGrid(); };

// Initialization
createGrid();
updateTheme(state.settings.intensity);