// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================

const TIER_POINTS = {
    "HT1": 60, "LT1": 45, "HT2": 30, "LT2": 20, 
    "HT3": 10, "LT3": 6, "HT4": 4, "LT4": 3, "HT5": 2, "LT5": 1
};

const categories = ["Vanilla", "UHC", "Pot", "NethOP", "SMP", "Sword", "Axe", "Mace"];

const tierIcons = [
    { type: 'icon', val: 'fa-gem' },              
    { type: 'icon', val: 'fa-heart' },            
    { type: 'icon', val: 'fa-flask' },            
    { type: 'icon', val: 'fa-fire' },             
    { type: 'icon', val: 'fa-shield-halved' },    
    { type: 'img',  val: 'https://mctiers.com/tier_icons/sword.svg' }, 
    { type: 'img',  val: 'https://mctiers.com/tier_icons/axe.svg' },   
    { type: 'img',  val: 'https://mctiers.com/tier_icons/mace.svg' }   
];

// Color Mapping by HOUSE (CSS Houses)
const houseColors = {
    "Jacaranda": "form-blue",
    "Cassia":    "form-yellow",
    "Bauhinia":  "form-purple",
    "Bombax":    "form-red",
    "Delonix":   "form-orange",
    "Juniper":   "form-green"
};

// Player Data
let players = [
    {
        name: "SirAlexius", 
        studentId: "s027108",
        form: "F5",          // Displays "F5"
        house: "Bauhinia",   // Uses "Bauhinia" color (Purple)
        title: "Combat Grandmaster",
        tiers: ["HT1", "HT1", "HT1", "HT1", "HT1", "HT1", "HT1", "HT1"]
    }
];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const listContainer = document.getElementById('leaderboard-list');
const gridContainer = document.getElementById('tier-grid');
const searchInput = document.getElementById('player-search');
const searchDropdown = document.getElementById('search-results');
const modal = document.getElementById('profile-modal');
const infoModal = document.getElementById('info-modal');
const viewOverall = document.getElementById('view-overall');
const viewTierlist = document.getElementById('view-tierlist');

// ==========================================
// 3. CORE FUNCTIONS
// ==========================================

function initPlayers() {
    players.forEach(p => {
        let total = 0;
        p.tiers.forEach(t => {
            const tierClean = t.trim();
            if (TIER_POINTS[tierClean]) {
                total += TIER_POINTS[tierClean];
            }
        });
        p.points = total;
    });
    players.sort((a, b) => b.points - a.points);
    players.forEach((p, index) => {
        p.rank = index + 1;
    });
}

function getTierIconHtml(idx) {
    const iconObj = tierIcons[idx];
    if (!iconObj) return '<i class="fa-solid fa-circle tier-icon"></i>';
    if (iconObj.type === 'img') {
        return `<img src="${iconObj.val}" class="tier-icon-img" alt="icon">`;
    } else {
        return `<i class="fa-solid ${iconObj.val} tier-icon"></i>`;
    }
}

function renderLeaderboard() {
    listContainer.innerHTML = ''; 
    players.forEach(player => {
        const row = document.createElement('div');
        const isRank1 = player.rank === 1;
        row.className = isRank1 ? 'player-row rank-1-row' : 'player-row';
        row.onclick = () => openModal(player);
        row.style.cursor = 'pointer';

        const tiersHtml = player.tiers.map((tier, idx) => {
            const cls = tier.toLowerCase();
            return `
                <div class="tier-badge tier-${cls}">
                    ${getTierIconHtml(idx)}
                    <span>${tier}</span>
                </div>
            `;
        }).join('');

        // Use House color, default to blue if missing
        const colorClass = houseColors[player.house] || 'form-blue';

        row.innerHTML = `
            <div class="col-rank">
                <span class="${isRank1 ? 'rank-1-text' : 'rank-text'}">${player.rank}.</span>
            </div>
            <div class="col-player">
                <div class="player-info">
                    <img src="https://minotar.net/helm/${player.name}/40.png" alt="${player.name}" class="player-head">
                    <div class="player-text">
                        <span class="player-name">${player.name}</span>
                        <span class="player-title">
                            <i class="fa-solid fa-gem title-icon"></i> ${player.title} (${player.points} points)
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-form">
                <span class="form-tag ${colorClass}">${player.form}</span>
            </div>
            <div class="col-tiers">
                <div class="tiers-container">${tiersHtml}</div>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

function renderTierList(category) {
    gridContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const col = document.createElement('div');
        col.className = 'tier-column';
        let headerClass = `header-${i}`;
        let tierLabel = `Tier ${i}`;
        const catIndex = categories.indexOf(category);
        
        const playersInTier = players.filter(p => {
             const t = p.tiers[catIndex];
             return t && t.includes(i.toString()); 
        });

        const playersHtml = playersInTier.map(p => `
            <div class="tier-card" onclick="openModalWrapper('${p.name}')">
                <img src="https://minotar.net/helm/${p.name}/24.png" class="tier-card-img">
                <span class="tier-card-name">${p.name}</span>
            </div>
        `).join('');

        col.innerHTML = `
            <div class="tier-col-header ${headerClass}">
                <i class="fa-solid fa-layer-group"></i> ${tierLabel}
            </div>
            <div class="tier-player-list">
                ${playersHtml}
            </div>
        `;
        gridContainer.appendChild(col);
    }
}

function openModalWrapper(name) {
    const p = players.find(pl => pl.name === name);
    if(p) openModal(p);
}

function switchTab(tabName, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    if (tabName === 'Overall') {
        viewOverall.classList.remove('hidden');
        viewTierlist.classList.add('hidden');
        renderLeaderboard();
    } else {
        viewOverall.classList.add('hidden');
        viewTierlist.classList.remove('hidden');
        renderTierList(tabName);
    }
}

// ==========================================
// 4. PLAYER PROFILE MODAL
// ==========================================
function openModal(player) {
    document.getElementById('modal-username').textContent = player.name;
    document.getElementById('modal-rank-title').textContent = player.title;
    document.getElementById('modal-position').textContent = player.rank + ".";
    document.getElementById('modal-points').textContent = player.points + " points";
    document.getElementById('modal-skin').src = `https://minotar.net/armor/body/${player.name}/100.png`;
    
    // Set Student ID
    document.getElementById('modal-student-id').textContent = player.studentId || "N/A";

    const formEl = document.getElementById('modal-form-text');
    formEl.textContent = player.form; // Text is Form
    
    // Color is House
    const colorClass = houseColors[player.house] || 'form-blue';
    formEl.className = `meta-value form-tag ${colorClass}`; 
    formEl.style.color = ''; 

    const tiersContainer = document.getElementById('modal-tiers-container');
    tiersContainer.innerHTML = player.tiers.map((tier, idx) => {
        const cls = tier.toLowerCase();
        return `
            <div class="tier-badge tier-${cls}">
                ${getTierIconHtml(idx)}
                <span>${tier}</span>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// ==========================================
// 5. INFORMATION MODAL
// ==========================================
function openInfoModal() {
    infoModal.classList.remove('hidden');
}
function closeInfoModal() {
    infoModal.classList.add('hidden');
}

window.onclick = function(event) {
    if (event.target === modal) closeModal();
    if (event.target === infoModal) closeInfoModal();
}

// ==========================================
// 6. SEARCH & UTILS
// ==========================================
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchDropdown.innerHTML = '';
    
    if (query.length === 0) { 
        searchDropdown.style.display = 'none'; return; 
    }

    const results = players.filter(p => p.name.toLowerCase().includes(query));
    
    if (results.length > 0) {
        searchDropdown.style.display = 'flex';
        results.forEach(p => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <img src="https://minotar.net/helm/${p.name}/30.png" class="search-avatar">
                <span class="search-name">${p.name}</span>
            `;
            item.onclick = () => { 
                openModal(p); 
                searchDropdown.style.display = 'none'; 
                searchInput.value = ''; 
            };
            searchDropdown.appendChild(item);
        });
    } else { searchDropdown.style.display = 'none'; }
});

function showToast(title, description, type = 'default') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconHtml = '';
    if (type === 'success') iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
    container.appendChild(toast);
    
    toast.innerHTML = `
        <div class="toast-icon">${iconHtml}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${description}</div>
        </div>
    `;
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 350);
    }, 4000);
}

const copyBtn = document.querySelector('.copy-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const ip = "css.edu.hk";
        navigator.clipboard.writeText(ip).then(() => {
            showToast('Copied to clipboard!', `School URL ${ip} copied.`, 'success');
        }).catch(() => {
            showToast('Failed to copy', 'Please try manually.', 'error');
        });
    });
}

// ==========================================
// 7. INITIALIZATION
// ==========================================
initPlayers();
renderLeaderboard();