const state = {
    settings: {
        n: 2,
        layoutSize: 1,
        gridRes: 3,
        intensity: 90,
        interval: 3000
    },
    history: [],
    currentIndex: -1
};

// Toggle Settings Panel
function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('closed');
}

// Switch between Settings Tabs
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Generate the Nested Grid
function createGrid() {
    const mainContainer = document.getElementById('game-grid');
    mainContainer.innerHTML = '';
    
    const L = state.settings.layoutSize;
    const R = state.settings.gridRes;
    
    document.documentElement.style.setProperty('--layout-size', L);

    for (let i = 0; i < L * L; i++) {
        const stimulusContainer = document.createElement('div');
        stimulusContainer.classList.add('stimulus-container');
        stimulusContainer.style.gridTemplateColumns = `repeat(${R}, 1fr)`;
        
        for (let j = 0; j < R * R; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`; 
            stimulusContainer.appendChild(cell);
        }
        mainContainer.appendChild(stimulusContainer);
    }
}

// Theme Controls
document.getElementById('theme-intensity').addEventListener('input', (e) => {
    state.settings.intensity = e.target.value;
    document.documentElement.style.setProperty('--bg-intensity', e.target.value);
});

function setThemePreset(preset) {
    const val = preset === 'amoled' ? 100 : 80;
    state.settings.intensity = val;
    document.getElementById('theme-intensity').value = val;
    document.documentElement.style.setProperty('--bg-intensity', val);
}

// Update settings on change
document.getElementById('layout-size').addEventListener('change', (e) => {
    state.settings.layoutSize = parseInt(e.target.value);
    createGrid();
});

document.getElementById('grid-res').addEventListener('change', (e) => {
    state.settings.gridRes = parseInt(e.target.value);
    createGrid();
});

// Start the Grid
createGrid();