// 1. ARCHITECTURE: The Central State
const state = {
    settings: {
        n: 2,
        gridSize: 3,
        interval: 3000
    },
    history: [], // Stores the sequence of positions
    currentIndex: -1
};

// 2. LOGIC: Grid Generation
function createGrid() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; // Clear existing
    document.documentElement.style.setProperty('--grid-size', state.settings.gridSize);

    for (let i = 0; i < state.settings.gridSize * state.settings.gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `cell-${i}`;
        grid.appendChild(cell);
    }
}

// 3. LOGIC: The N-Back Memory Check
function nextTurn() {
    state.currentIndex++;
    const totalCells = state.settings.gridSize * state.settings.gridSize;
    const randomPos = Math.floor(Math.random() * totalCells);
    
    state.history.push(randomPos);
    flashCell(randomPos);

    // This is where you'd check if state.history[currentIndex] 
    // matches state.history[currentIndex - n]
}

function flashCell(id) {
    const cell = document.getElementById(`cell-${id}`);
    cell.classList.add('active');
    setTimeout(() => cell.classList.remove('active'), 500);
}

// 4. SAVE SYSTEM: Export settings to string
function exportSaveString() {
    const string = btoa(JSON.stringify(state.settings)); // btoa creates the Base64 "Jumble"
    document.getElementById('save-string').value = string;
    localStorage.setItem('dual-n-back-save', string);
}

// Initial Setup
document.getElementById('start-btn').addEventListener('click', () => {
    state.history = [];
    state.currentIndex = -1;
    setInterval(nextTurn, state.settings.interval);
});

document.getElementById('save-btn').addEventListener('click', exportSaveString);

createGrid();