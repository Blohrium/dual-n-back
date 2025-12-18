const state = {
    version: "0.8.0",
    settings: {
        n: 2, gridRows: 1, gridCols: 1, gridRes: 3, 
        intensity: 95, intervalMs: 3000
    },
    // History is now an array of arrays [turnIndex][containerIndex]
    history: [], 
    currentIndex: -1, 
    gameInterval: null
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
    if (!mainContainer) return;
    mainContainer.innerHTML = '';
    
    const rows = state.settings.gridRows;
    const cols = state.settings.gridCols;
    const res = state.settings.gridRes;

    document.documentElement.style.setProperty('--grid-rows', rows);
    document.documentElement.style.setProperty('--grid-cols', cols);

    for (let i = 0; i < rows * cols; i++) {
        const container = document.createElement('div');
        container.classList.add('stimulus-container');
        container.setAttribute('data-key', i + 1);
        container.onclick = () => checkMatch(i);
        container.style.gridTemplateColumns = `repeat(${res}, 1fr)`;
        
        for (let j = 0; j < res * res; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`;
            container.appendChild(cell);
        }
        mainContainer.appendChild(container);
    }
}

function nextTurn() {
    state.currentIndex++;
    document.getElementById('step-count').innerText = state.currentIndex + 1;
    
    const numContainers = state.settings.gridRows * state.settings.gridCols;
    const res = state.settings.gridRes;
    const currentTurnPositions = [];

    // Every container flashes simultaneously
    for (let c = 0; c < numContainers; c++) {
        const randomCell = Math.floor(Math.random() * (res * res));
        currentTurnPositions.push(randomCell);
        
        const target = document.getElementById(`cell-${c}-${randomCell}`);
        if (target) {
            target.classList.add('active');
            setTimeout(() => target.classList.remove('active'), 600);
        }
    }
    state.history.push(currentTurnPositions);
}

function checkMatch(containerIndex) {
    if (state.currentIndex < state.settings.n) return;
    
    const fb = document.getElementById('feedback');
    const currentPos = state.history[state.currentIndex][containerIndex];
    const pastPos = state.history[state.currentIndex - state.settings.n][containerIndex];

    if (currentPos === pastPos) {
        fb.innerText = `Box ${containerIndex+1}: MATCH!`;
        fb.style.color = "#2ecc71";
    } else {
        fb.innerText = `Box ${containerIndex+1}: WRONG!`;
        fb.style.color = "#e74c3c";
    }
}

// Keybindings (1, 2, 3...)
window.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (!isNaN(key) && key > 0) {
        checkMatch(key - 1);
    }
});

document.getElementById('start-btn').onclick = () => {
    if(state.gameInterval) clearInterval(state.gameInterval);
    state.history = [];
    state.currentIndex = -1;
    state.settings.n = parseInt(document.getElementById('n-level').value);
    state.settings.intervalMs = parseInt(document.getElementById('interval-ms').value);
    document.getElementById('n-display').innerText = state.settings.n;
    state.gameInterval = setInterval(nextTurn, state.settings.intervalMs);
    nextTurn();
};

document.getElementById('save-btn').onclick = () => {
    state.settings.n = parseInt(document.getElementById('n-level').value);
    state.settings.gridRows = parseInt(document.getElementById('grid-rows').value);
    state.settings.gridCols = parseInt(document.getElementById('grid-cols').value);
    state.settings.gridRes = parseInt(document.getElementById('grid-res').value);
    document.getElementById('save-string').value = btoa(JSON.stringify(state.settings));
};

document.getElementById('load-btn').onclick = () => {
    try {
        const data = JSON.parse(atob(document.getElementById('save-string').value));
        state.settings = data;
        createGrid();
        alert("Loaded v" + state.version);
    } catch(e) { alert("Invalid data"); }
};

document.getElementById('theme-intensity').oninput = (e) => {
    document.documentElement.style.setProperty('--bg-intensity', e.target.value);
};

// Auto-refresh layout when numbers change in settings
['grid-rows', 'grid-cols', 'grid-res'].forEach(id => {
    document.getElementById(id).onchange = () => {
        state.settings.gridRows = parseInt(document.getElementById('grid-rows').value);
        state.settings.gridCols = parseInt(document.getElementById('grid-cols').value);
        state.settings.gridRes = parseInt(document.getElementById('grid-res').value);
        createGrid();
    };
});

createGrid();