const state = {
    settings: {
        n: 2,
        layoutSize: 1, // e.g., 2 means a 2x2 group of grids
        gridRes: 3,    // e.g., 10 means 10x10 squares per grid
        interval: 3000
    },
    history: [],
    currentIndex: -1
};

function createGrid() {
    const mainContainer = document.getElementById('game-grid');
    mainContainer.innerHTML = '';
    
    // 1. Set the top-level layout (e.g., 2x2 grids)
    const L = state.settings.layoutSize;
    const R = state.settings.gridRes;
    
    mainContainer.style.gridTemplateColumns = `repeat(${L}, 1fr)`;
    
    // Create the "Stimulus Containers"
    for (let i = 0; i < L * L; i++) {
        const stimulusContainer = document.createElement('div');
        stimulusContainer.classList.add('stimulus-container');
        stimulusContainer.id = `container-${i}`;
        
        // 2. Set the internal resolution (e.g., 10x10 squares)
        stimulusContainer.style.display = 'grid';
        stimulusContainer.style.gridTemplateColumns = `repeat(${R}, 1fr)`;
        
        for (let j = 0; j < R * R; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`; // containerIndex-cellIndex
            stimulusContainer.appendChild(cell);
        }
        mainContainer.appendChild(stimulusContainer);
    }
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('closed');
}

// Ensure settings update the grid
document.getElementById('layout-size').addEventListener('change', (e) => {
    state.settings.layoutSize = parseInt(e.target.value);
    createGrid();
});

document.getElementById('grid-res').addEventListener('change', (e) => {
    state.settings.gridRes = parseInt(e.target.value);
    createGrid();
});

createGrid();