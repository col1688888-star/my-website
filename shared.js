// shared.js - 跨頁面共用狀態管理

// ========== 收藏機台管理 ==========
let favoriteMachines = JSON.parse(localStorage.getItem('favorites')) || [];

// 初始化收藏資料（如果完全沒有資料才用預設值）
if (favoriteMachines.length === 0) {
    favoriteMachines = [
        { id: 1, name: '甲賀忍法帖 弐', image: 'https://static.wixstatic.com/media/d5e540_e7da9c3f1fb24a2aa9ef8d180a2cf6fa~mv2.png', ratio: '1:2', vendor: 'Sammy' },
        { id: 2, name: '超級奇蹟小丑', image: 'https://static.wixstatic.com/media/d5e540_1c6cd7d36cc24e47a6b359a1abeb3923~mv2.png', ratio: '1:1', vendor: 'Olympia' },
        { id: 3, name: '吉宗', image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png', ratio: '1:2', vendor: 'Daito' }
    ];
    saveFavorites();
}

// 儲存收藏到 localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favoriteMachines));
}

// 切換收藏狀態
function toggleFavorite(machine) {
    const index = favoriteMachines.findIndex(m => m.id === machine.id);
    if (index === -1) {
        favoriteMachines.push(machine);
    } else {
        favoriteMachines.splice(index, 1);
    }
    saveFavorites();
    return index === -1; // true = 加入收藏, false = 移除收藏
}

// 檢查是否已收藏
function isFavorite(machineId) {
    return favoriteMachines.some(m => m.id === machineId);
}

// ========== 保留機台管理 ==========
let keepMachines = JSON.parse(localStorage.getItem('keepMachines')) || [];

// 初始化保留資料（如果完全沒有資料才用預設值）
if (keepMachines.length === 0) {
    keepMachines = [
        { 
            id: 4, 
            name: '花月', 
            image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png', 
            ratio: '1:4', 
            vendor: 'Olympia',
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2天後
        },
        { 
            id: 5, 
            name: '新甲賀', 
            image: 'https://static.wixstatic.com/media/d5e540_e7da9c3f1fb24a2aa9ef8d180a2cf6fa~mv2.png', 
            ratio: '1:4', 
            vendor: 'Sammy',
            endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5小時後
        }
    ];
    saveKeepMachines();
}

function saveKeepMachines() {
    localStorage.setItem('keepMachines', JSON.stringify(keepMachines));
}

function removeKeepMachine(id) {
    keepMachines = keepMachines.filter(m => m.id !== id);
    saveKeepMachines();
}

// ========== 統一機器資料庫 ==========
const machineDatabase = [
    { id: 1, name: '甲賀忍法帖 弐', image: 'https://static.wixstatic.com/media/d5e540_e7da9c3f1fb24a2aa9ef8d180a2cf6fa~mv2.png', ratio: '1:2', vendor: 'Sammy', category: '新機' },
    { id: 2, name: '超級奇蹟小丑', image: 'https://static.wixstatic.com/media/d5e540_1c6cd7d36cc24e47a6b359a1abeb3923~mv2.png', ratio: '1:1', vendor: 'Olympia', category: '新機' },
    { id: 3, name: '吉宗', image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png', ratio: '1:2', vendor: 'Daito', category: '人氣機台' },
    { id: 4, name: '花月', image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png', ratio: '1:4', vendor: 'Olympia', category: '4號機' },
    { id: 5, name: '新甲賀', image: 'https://static.wixstatic.com/media/d5e540_e7da9c3f1fb24a2aa9ef8d180a2cf6fa~mv2.png', ratio: '1:4', vendor: 'Sammy', category: '6號機' },
    { id: 6, name: '奇蹟小丑', image: 'https://static.wixstatic.com/media/d5e540_1c6cd7d36cc24e47a6b359a1abeb3923~mv2.png', ratio: '1:5', vendor: 'Rodeo', category: '5號機' },
    { id: 7, name: '超級奇蹟', image: 'https://static.wixstatic.com/media/d5e540_1c6cd7d36cc24e47a6b359a1abeb3923~mv2.png', ratio: '1:1', vendor: 'Olympia', category: '5號機' },
    { id: 8, name: '吉宗(4號)', image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png', ratio: '1:2', vendor: 'Daito', category: '4號機' }
];

// ========== 輔助函數 ==========
function formatEndTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 更新所有頁面的愛心狀態
function syncFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const machineId = parseInt(btn.dataset.id);
        if (isFavorite(machineId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ========== 倒數計時 ==========
function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown-timer[data-endtime]');
    countdownElements.forEach(el => {
        const endTime = new Date(el.dataset.endtime).getTime();
        const now = new Date().getTime();
        const diff = endTime - now;
        
        if (diff <= 0) {
            el.innerHTML = '<i class="fa fa-hourglass-end"></i> 已到期';
            el.classList.add('warning');
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeText = '';
        if (days > 0) {
            timeText = `${days}天 ${hours}小時`;
        } else if (hours > 0) {
            timeText = `${hours}小時 ${minutes}分`;
        } else {
            timeText = `${minutes}分`;
        }
        
        if (hours === 0 && days === 0) {
            el.classList.add('warning');
        } else {
            el.classList.remove('warning');
        }
        
        el.innerHTML = `<i class="fa fa-hourglass-half"></i> 剩餘 ${timeText}`;
    });
}

// 啟動定時器
setInterval(updateCountdowns, 1000);

// ========== 從這裡開始加入小紅點功能 ==========

// ========== 公告未讀狀態管理 ==========

// 檢查是否有未讀信件
function hasUnreadLetters() {
    // 從 localStorage 讀取未讀狀態，預設為 true（表示有未讀）
    return localStorage.getItem('hasUnreadLetters') !== 'false';
}

// 設定未讀狀態（給 news.html 呼叫）
function setUnreadStatus(hasUnread) {
    localStorage.setItem('hasUnreadLetters', hasUnread);
    
    // 更新當前頁面的小紅點
    updateNewsBadge();
}

// 更新所有頁面的小紅點顯示
function updateNewsBadge() {
    const newsBadge = document.getElementById('newsBadge');
    if (!newsBadge) return;
    
    const hasUnread = hasUnreadLetters();
    newsBadge.style.display = hasUnread ? 'block' : 'none';
    console.log('小紅點狀態:', hasUnread ? '顯示' : '隱藏');
}

// 監聽其他頁面的變更
window.addEventListener('storage', function(e) {
    if (e.key === 'hasUnreadLetters') {
        updateNewsBadge();
    }
});

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    updateNewsBadge();
    
    // 如果是在 news.html，設定初始未讀狀態
    if (window.location.pathname.includes('news.html')) {
        setTimeout(function() {
            const hasUnreadDots = document.querySelectorAll('.letter-row i.fa-circle.text-blue-400').length > 0;
            setUnreadStatus(hasUnreadDots);
        }, 500);
    }
});

// 初始化未讀狀態（如果完全沒有設定過）
if (localStorage.getItem('hasUnreadLetters') === null) {
    localStorage.setItem('hasUnreadLetters', 'true'); // 預設有未讀
}
