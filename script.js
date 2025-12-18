const state = {
    settings: {
        n: 2, gridRows: 1, gridCols: 1, gridRes: 3, 
        intensity: 90, intervalMs: 3000, flashMs: 600
    },
    history: [], currentIndex: -1, gameInterval: null
};

function toggleSettings() { document.getElementById('settings-panel').classList.toggle('closed'); }

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

function createGrid() {
    const mainContainer = document.getElementById('game-grid');
    mainContainer.innerHTML = '';
    const rows = state.settings.gridRows;
    const cols = state.settings.gridCols;
    const res = state.settings.gridRes;

    document.documentElement.style.setProperty('--grid-rows', rows);
    document.documentElement.style.setProperty('--grid-cols', cols);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const containerIndex = r * cols + c;
            const container = document.createElement('div');
            container.classList.add('stimulus-container');
            container.style.gridTemplateColumns = `repeat(${res}, 1fr)`;
            for (let i = 0; i < res * res; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.id = `cell-${containerIndex}-${i}`;
                container.appendChild(cell);
            }
            mainContainer.appendChild(container);
        }
    }
}

function nextTurn() {
    state.currentIndex++;
    document.getElementById('step-count').innerText = state.currentIndex + 1;
    const totalContainers = state.settings.gridRows * state.settings.gridCols;
    const res = state.settings.gridRes;
    
    const randomContainer = Math.floor(Math.random() * totalContainers);
    const randomCell = Math.floor(Math.random() * (res * res));
    
    state.history.push({ c: randomContainer, i: randomCell });
    const target = document.getElementById(`cell-${randomContainer}-${randomCell}`);
    if (target) {
        target.classList.add('active');
        setTimeout(() => target.classList.remove('active'), state.settings.flashMs);
    }
}

function exportSave() {
    // Sync settings from inputs
    state.settings.n = parseInt(document.getElementById('n-level').value);
    state.settings.gridRows = parseInt(document.getElementById('grid-rows').value);
    state.settings.gridCols = parseInt(document.getElementById('grid-cols').value);
    state.settings.gridRes = parseInt(document.getElementById('grid-res').value);
    state.settings.intervalMs = parseInt(document.getElementById('interval-ms').value);
    state.settings.flashMs = parseInt(document.getElementById('flash-ms').value);

    const string = btoa(JSON.stringify(state.settings));
    document.getElementById('save-string').value = string;
    document.getElementById('feedback').innerText = "Exported Successfully";
}

function loadSave() {
    try {
        const string = document.getElementById('save-string').value;
        const data = JSON.parse(atob(string));
        state.settings = data;
        
        document.getElementById('n-level').value = data.n;
        document.getElementById('grid-rows').value = data.gridRows;
        document.getElementById('grid-cols').value = data.gridCols;
        document.getElementById('grid-res').value = data.gridRes;
        document.getElementById('interval-ms').value = data.intervalMs;
        document.getElementById('flash-ms').value = data.flashMs;
        
        createGrid();
        document.getElementById('feedback').innerText = "Save Loaded";
    } catch(e) { alert("Invalid Save String"); }
}

document.getElementById('start-btn').onclick = () => {
    if(state.gameInterval) clearInterval(state.gameInterval);
    state.history = [];
    state.currentIndex = -1;
    state.settings.n = parseInt(document.getElementById('n-level').value);
    state.settings.intervalMs = parseInt(document.getElementById('interval-ms').value);
    state.settings.flashMs = parseInt(document.getElementById('flash-ms').value);
    document.getElementById('n-display').innerText = state.settings.n;
    state.gameInterval = setInterval(nextTurn, state.settings.intervalMs);
};

document.getElementById('pos-match').onclick = () => {
    if (state.currentIndex < state.settings.n) return;
    const current = state.history[state.currentIndex];
    const past = state.history[state.currentIndex - state.settings.n];
    const fb = document.getElementById('feedback');
    if (current.c === past.c && current.i === past.i) {
        fb.innerText = "MATCH!"; fb.style.color = "#2ecc71";
    } else {
        fb.innerText = "WRONG!"; fb.style.color = "#e74c3c";
    }
};

document.getElementById('save-btn').onclick = exportSave;
document.getElementById('load-btn').onclick = loadSave;

createGrid();