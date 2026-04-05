// ==================== 全域共用資料 ====================
const T_PACHIN_STORAGE = {
    // 儲存 KEY
    FAVORITE_KEY: 't_pachin_favorites',
    RESERVE_KEY: 't_pachin_reserved',  // 修改：與其他頁面統一
    USER_KEY: 't_pachin_user',
    PLAYED_KEY: 't_pachin_played',
    POINTS_KEY: 't_pachin_user_points',  // 新增：獨立的點數 Key
    
    // ==================== 使用者資料 ====================
    getUserData() {
        const defaultData = {
            points: 6600,
            totalTokens: 6000,
            nickname: '夫人會生氣',
            vipLevel: 1,
            lastUpdated: Date.now()
        };
        
        // 優先從獨立的點數 Key 讀取
        const pointsStored = localStorage.getItem(this.POINTS_KEY);
        if (pointsStored !== null) {
            defaultData.points = parseInt(pointsStored, 10) || 6600;
        }
        
        const stored = localStorage.getItem(this.USER_KEY);
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                // 合併，優先使用獨立點數
                userData.points = defaultData.points;
                return { ...defaultData, ...userData };
            } catch (e) {
                return defaultData;
            }
        }
        return defaultData;
    },
    
    saveUserData(userData) {
        // 同時儲存到獨立點數 Key
        localStorage.setItem(this.POINTS_KEY, userData.points);
        
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            ...userData,
            lastUpdated: Date.now()
        }));
        
        window.dispatchEvent(new CustomEvent('t-pachin:user-updated', {
            detail: userData
        }));
        
        // 同時觸發 points-updated 事件（相容性）
        window.dispatchEvent(new CustomEvent('points-updated', {
            detail: { points: userData.points }
        }));
    },
    
    updatePoints(changeAmount) {
        const userData = this.getUserData();
        userData.points = Math.max(0, userData.points + changeAmount);
        this.saveUserData(userData);
        this.updateAllPointsDisplay();
        return userData.points;
    },
    
    getPoints() {
        // 優先從獨立 Key 讀取
        const pointsStored = localStorage.getItem(this.POINTS_KEY);
        if (pointsStored !== null) {
            return parseInt(pointsStored, 10) || 6600;
        }
        return this.getUserData().points;
    },
    
    setPoints(points) {
        const userData = this.getUserData();
        userData.points = Math.max(0, points);
        this.saveUserData(userData);
        this.updateAllPointsDisplay();
        return userData.points;
    },
    
    updateAllPointsDisplay() {
        const points = this.getPoints();
        document.querySelectorAll('.points-display, .points-value, [data-points-display]').forEach(el => {
            if (el.tagName === 'INPUT') {
                el.value = points.toLocaleString();
            } else {
                el.textContent = points.toLocaleString();
            }
        });
        document.querySelectorAll('#userPoints, #headerPoints .points-value, #tokenBtn').forEach(el => {
            if (el.id === 'userPoints') {
                el.textContent = points;
            } else if (el.id === 'tokenBtn') {
                el.textContent = points.toLocaleString();
            } else {
                el.textContent = points.toLocaleString();
            }
        });
    },
    
    // ==================== 我的最愛 ====================
    getFavorites() {
        const stored = localStorage.getItem(this.FAVORITE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        // 預設收藏（與 about.html 一致）
        return [
            { id: 1, name: 'GOGO 小丑', number: 'J001', image: 'https://i.pinimg.com/736x/c3/72/db/c372db1b020ebf778ef707f63c122bf7.jpg', ratio: '2.5' },
            { id: 2, name: '我是小丑-EX', number: 'J002', image: 'https://i.pinimg.com/736x/c3/72/db/c372db1b020ebf778ef707f63c122bf7.jpg', ratio: '2.8' }
        ];
    },
    
    saveFavorites(favorites) {
        localStorage.setItem(this.FAVORITE_KEY, JSON.stringify(favorites));
        window.dispatchEvent(new CustomEvent('t-pachin:favorites-updated', {
            detail: favorites
        }));
        // 同時觸發 favorites-updated 事件
        window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { favorites } }));
        return favorites;
    },
    
    toggleFavorite(machine) {
        const favorites = this.getFavorites();
        const index = favorites.findIndex(m => m.id === machine.id);
        
        if (index !== -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push({ ...machine, favoritedAt: Date.now() });
        }
        
        this.saveFavorites(favorites);
        return favorites;
    },
    
    isFavorite(machineId) {
        return this.getFavorites().some(m => m.id === machineId);
    },
    
    // ==================== 保留機台 ====================
    getReserves() {
        const stored = localStorage.getItem(this.RESERVE_KEY);
        if (stored) {
            try {
                const reserves = JSON.parse(stored);
                const now = Date.now();
                // 過濾過期的保留
                return reserves.filter(r => !r.expiresAt || r.expiresAt > now);
            } catch (e) {
                return [];
            }
        }
        // 預設保留（與 about.html 一致）
        return [
            { id: 4, name: '新我是小丑-EX水晶版', number: 'J004', image: 'https://i.pinimg.com/736x/c3/72/db/c372db1b020ebf778ef707f63c122bf7.jpg', ratio: '3.0', reservedAt: Date.now() }
        ];
    },
    
    saveReserves(reserves) {
        localStorage.setItem(this.RESERVE_KEY, JSON.stringify(reserves));
        window.dispatchEvent(new CustomEvent('t-pachin:reserves-updated', {
            detail: reserves
        }));
        // 同時觸發 reserved-updated 事件
        window.dispatchEvent(new CustomEvent('reserved-updated', { detail: { reserved: reserves } }));
        return reserves;
    },
    
    addReserve(machine, minutes = 30) {
        let reserves = this.getReserves();
        const now = Date.now();
        const expiresAt = now + minutes * 60 * 1000;
        
        const existingIndex = reserves.findIndex(r => r.id === machine.id);
        const reserveData = {
            ...machine,
            reserveTime: new Date(expiresAt).toLocaleTimeString('zh-TW', {
                hour: '2-digit', minute: '2-digit'
            }),
            expiresAt: expiresAt,
            addedAt: now,
            reservedAt: now
        };
        
        if (existingIndex !== -1) {
            reserves[existingIndex] = reserveData;
        } else {
            reserves.push(reserveData);
        }
        
        this.saveReserves(reserves);
        return reserves;
    },
    
    removeReserve(machineId) {
        let reserves = this.getReserves();
        reserves = reserves.filter(r => r.id !== machineId);
        this.saveReserves(reserves);
        return reserves;
    },
    
    isReserved(machineId) {
        return this.getReserves().some(r => r.id === machineId);
    },
    
    // ==================== 玩過記錄 ====================
    getPlayed() {
        const stored = localStorage.getItem(this.PLAYED_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    },
    
    savePlayed(played) {
        localStorage.setItem(this.PLAYED_KEY, JSON.stringify(played));
        window.dispatchEvent(new CustomEvent('t-pachin:played-updated', {
            detail: played
        }));
        return played;
    },
    
    addPlayed(machine, coinsUsed = 0) {
        let played = this.getPlayed();
        const existingIndex = played.findIndex(p => p.id === machine.id);
        
        const playedData = {
            ...machine,
            playedDate: new Date().toLocaleDateString('zh-TW'),
            playedTime: new Date().toLocaleTimeString('zh-TW'),
            coinsUsed: coinsUsed,
            lastPlayed: Date.now()
        };
        
        if (existingIndex !== -1) {
            played[existingIndex] = { ...played[existingIndex], ...playedData };
        } else {
            played.unshift(playedData);
        }
        
        if (played.length > 50) played = played.slice(0, 50);
        
        this.savePlayed(played);
        return played;
    },
    
    // ==================== 機台佔用記錄 ====================
    getOccupiedTokens() {
        const stored = localStorage.getItem('t_pachin_occupied_tokens');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return {};
            }
        }
        return {};
    },
    
    saveOccupiedTokens(tokens) {
        localStorage.setItem('t_pachin_occupied_tokens', JSON.stringify(tokens));
    },
    
    setOccupiedToken(machineKey, tokens) {
        const occupied = this.getOccupiedTokens();
        occupied[machineKey] = tokens;
        this.saveOccupiedTokens(occupied);
    },
    
    removeOccupiedToken(machineKey) {
        const occupied = this.getOccupiedTokens();
        delete occupied[machineKey];
        this.saveOccupiedTokens(occupied);
    },
    
    // ==================== 導航高亮 ====================
    highlightCurrentNav() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath) {
                item.classList.add('current-page');
            } else {
                item.classList.remove('current-page');
            }
        });
    },
    
    // ==================== 暱稱管理 ====================
    getNickname() {
        return this.getUserData().nickname;
    },
    
    setNickname(nickname) {
        if (nickname && nickname.trim()) {
            const userData = this.getUserData();
            userData.nickname = nickname.trim();
            this.saveUserData(userData);
            document.querySelectorAll('.nickname-display, .nickname-edit, #displayNickname').forEach(el => {
                el.textContent = nickname.trim();
            });
        }
        return nickname;
    }
};

// ==================== 倒數計時器管理 ====================
const CountdownManager = {
    intervals: {},
    
    startCountdown(elementId, expiresAt, onExpire, onUpdate) {
        if (this.intervals[elementId]) {
            clearInterval(this.intervals[elementId]);
        }
        
        const update = () => {
            const now = Date.now();
            const remaining = expiresAt - now;
            
            const el = document.getElementById(elementId);
            if (!el) return;
            
            if (remaining <= 0) {
                el.textContent = '已到期';
                el.classList.add('warning');
                if (onExpire) onExpire();
                clearInterval(this.intervals[elementId]);
                delete this.intervals[elementId];
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            el.textContent = timeStr;
            
            if (remaining <= 600000) {
                el.classList.add('warning');
            } else {
                el.classList.remove('warning');
            }
            
            if (onUpdate) onUpdate(remaining, timeStr);
        };
        
        update();
        this.intervals[elementId] = setInterval(update, 1000);
        return this.intervals[elementId];
    },
    
    stopCountdown(elementId) {
        if (this.intervals[elementId]) {
            clearInterval(this.intervals[elementId]);
            delete this.intervals[elementId];
        }
    },
    
    stopAll() {
        Object.keys(this.intervals).forEach(id => this.stopCountdown(id));
    }
};

// ==================== 初始化所有頁面共用功能 ====================
function initializeSharedFeatures() {
    T_PACHIN_STORAGE.updateAllPointsDisplay();
    T_PACHIN_STORAGE.highlightCurrentNav();
    
    // 監聽點數更新事件
    window.addEventListener('t-pachin:user-updated', () => {
        T_PACHIN_STORAGE.updateAllPointsDisplay();
    });
    
    window.addEventListener('points-updated', (e) => {
        if (e.detail && e.detail.points !== undefined) {
            T_PACHIN_STORAGE.updateAllPointsDisplay();
        }
    });
    
    // 點數顯示點擊事件
    document.querySelectorAll('.points-display, #tokenBtn').forEach(el => {
        el.addEventListener('click', () => {
            alert(`💰 目前點數：${T_PACHIN_STORAGE.getPoints().toLocaleString()}\n\n遊玩機台即可累積點數！`);
        });
    });
    
    // 暱稱編輯
    document.querySelectorAll('.nickname-display, .nickname-edit, #displayNickname').forEach(el => {
        el.addEventListener('click', () => {
            const currentName = T_PACHIN_STORAGE.getNickname();
            const newName = prompt('修改暱稱', currentName);
            if (newName && newName.trim()) {
                T_PACHIN_STORAGE.setNickname(newName.trim());
            }
        });
    });
    
    // VIP 點擊
    document.querySelectorAll('.vip-badge, #vipBadge').forEach(el => {
        el.addEventListener('click', () => {
            const userData = T_PACHIN_STORAGE.getUserData();
            alert(`VIP ${userData.vipLevel} 特權: 返水0.2%\n累積遊玩可提升 VIP 等級！`);
        });
    });
}

// 頁面載入完成後自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSharedFeatures);
} else {
    initializeSharedFeatures();
}

// 匯出到全域
window.T_PACHIN_STORAGE = T_PACHIN_STORAGE;
window.CountdownManager = CountdownManager;
window.initializeSharedFeatures = initializeSharedFeatures;

// 相容性別名（給其他頁面使用）
window.TPachin = {
    points: {
        get: () => T_PACHIN_STORAGE.getPoints(),
        set: (points) => T_PACHIN_STORAGE.setPoints(points),
        update: (delta) => T_PACHIN_STORAGE.updatePoints(delta),
        on: (callback) => {
            window.addEventListener('t-pachin:user-updated', (e) => callback(e.detail.points));
            callback(T_PACHIN_STORAGE.getPoints());
        }
    },
    favorites: {
        getAll: () => T_PACHIN_STORAGE.getFavorites(),
        add: (machine) => T_PACHIN_STORAGE.toggleFavorite(machine),
        remove: (id) => {
            const favorites = T_PACHIN_STORAGE.getFavorites();
            const newFavorites = favorites.filter(f => f.id !== id);
            T_PACHIN_STORAGE.saveFavorites(newFavorites);
        },
        is: (id) => T_PACHIN_STORAGE.isFavorite(id),
        on: (callback) => {
            window.addEventListener('t-pachin:favorites-updated', (e) => callback(e.detail));
            callback(T_PACHIN_STORAGE.getFavorites());
        }
    },
    reserved: {
        getAll: () => T_PACHIN_STORAGE.getReserves(),
        add: (machine) => T_PACHIN_STORAGE.addReserve(machine),
        remove: (id) => T_PACHIN_STORAGE.removeReserve(id),
        is: (id) => T_PACHIN_STORAGE.isReserved(id),
        on: (callback) => {
            window.addEventListener('t-pachin:reserves-updated', (e) => callback(e.detail));
            callback(T_PACHIN_STORAGE.getReserves());
        }
    },
    user: {
        getNickname: () => T_PACHIN_STORAGE.getNickname(),
        setNickname: (name) => T_PACHIN_STORAGE.setNickname(name)
    }
};
