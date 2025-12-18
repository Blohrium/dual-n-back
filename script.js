// 1. ARCHITECTURE: The Central State
const state = {
    settings: {
        n: 2,
        gridSize: 3,      // Width/Height of grid
        stimulusSize: 1,  // How many units wide/high a stimulus is
        interval: 3000
    },
    history: [], 
    currentIndex: -1,
    gameActive: false
};

// 2. LOGIC: Grid Generation
function createGrid() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = ''; 
    // Set CSS variable for grid columns
    document.documentElement.style.setProperty('--grid-size', state.settings.gridSize);

    for (let y = 0; y < state.settings.gridSize; y++) {
        for (let x = 0; x < state.settings.gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            // Give each cell a coordinate ID
            cell.id = `cell-${x}-${y}`;
            grid.appendChild(cell);
        }
    }
}

// 3. LOGIC: Scaled Stimulus Flash
function flashStimulus(originX, originY) {
    const size = state.settings.stimulusSize;
    
    // Loop through the area the stimulus covers
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.getElementById(`cell-${originX + i}-${originY + j}`);
            if (cell) {
                cell.classList.add('active');
                setTimeout(() => cell.classList.remove('active'), 500);
            }
        }
    }
}

// 4. LOGIC: The Game Loop & Match Check
function nextTurn() {
    state.currentIndex++;
    
    // Calculate bounds so stimulus doesn't bleed off the edge
    const maxCoord = state.settings.gridSize - state.settings.stimulusSize;
    const posX = Math.floor(Math.random() * (maxCoord + 1));
    const posY = Math.floor(Math.random() * (maxCoord + 1));
    
    const currentPos = { x: posX, y: posY };
    state.history.push(currentPos);
    flashStimulus(posX, posY);

    // Check for match (Internal Logic)
    if (state.currentIndex >= state.settings.n) {
        const pastPos = state.history[state.currentIndex - state.settings.n];
        if (currentPos.x === pastPos.x && currentPos.y === pastPos.y) {
            console.log("MATCH DETECTED!"); // We can add UI feedback here later
        }
    }
}

// 5. SAVE SYSTEM: Import/Export
function exportSaveString() {
    const string = btoa(JSON.stringify(state.settings));
    document.getElementById('save-string').value = string;
    localStorage.setItem('dual-n-back-save', string);
}

function loadSaveString(encodedString) {
    try {
        const decoded = JSON.parse(atob(encodedString));
        state.settings = { ...state.settings, ...decoded };
        // Update UI inputs to match loaded settings
        document.getElementById('n-level').value = state.settings.n;
        createGrid();
    } catch (e) {
        alert("Invalid Save String");
    }
}

// Initial Setup
document.getElementById('start-btn').addEventListener('click', () => {
    if (state.gameActive) return;
    state.gameActive = true;
    state.history = [];
    state.currentIndex = -1;
    
    // Update settings from UI before starting
    state.settings.n = parseInt(document.getElementById('n-level').value);
    
    setInterval(nextTurn, state.settings.interval);
});

document.getElementById('save-btn').addEventListener('click', exportSaveString);

// Allow loading a save if the user pastes one in
document.getElementById('save-string').addEventListener('change', (e) => {
    loadSaveString(e.target.value);
});

createGrid();
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('closed');
}

// Update the grid size when the setting changes
document.getElementById('grid-size-input').addEventListener('change', (e) => {
    state.settings.gridSize = parseInt(e.target.value);
    createGrid(); // Redraw the grid immediately
});