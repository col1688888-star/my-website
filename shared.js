// ==================== 全域共用資料 ====================
const T_PACHIN_STORAGE = {
    // 我的最愛
    FAVORITE_KEY: 't_pachin_favorites',
    
    // 保留機台
    RESERVE_KEY: 't_pachin_reserves',
    
    // 使用者資料 (點數、代幣)
    USER_KEY: 't_pachin_user',
    
    // 初始化點數
    initPoints() {
        const userData = this.getUserData();
        return userData.points;
    },
    
    // 取得使用者資料
    getUserData() {
        const defaultData = {
            points: 5280,
            totalTokens: 6000,
            nickname: '夫人會生氣',
            vipLevel: 3,
            lastUpdated: Date.now()
        };
        
        const stored = localStorage.getItem(this.USER_KEY);
        if (stored) {
            try {
                return { ...defaultData, ...JSON.parse(stored) };
            } catch (e) {
                return defaultData;
            }
        }
        return defaultData;
    },
    
    // 儲存使用者資料
    saveUserData(userData) {
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            ...userData,
            lastUpdated: Date.now()
        }));
        
        window.dispatchEvent(new CustomEvent('t-pachin:user-updated', {
            detail: userData
        }));
    },
    
    // 更新點數
    updatePoints(changeAmount) {
        const userData = this.getUserData();
        userData.points = Math.max(0, userData.points + changeAmount);
        this.saveUserData(userData);
        return userData.points;
    },
    
    // 取得我的最愛
    getFavorites() {
        const stored = localStorage.getItem(this.FAVORITE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    },
    
    // 儲存我的最愛
    saveFavorites(favorites) {
        localStorage.setItem(this.FAVORITE_KEY, JSON.stringify(favorites));
        
        window.dispatchEvent(new CustomEvent('t-pachin:favorites-updated', {
            detail: favorites
        }));
    },
    
    // 切換我的最愛
    toggleFavorite(machine) {
        const favorites = this.getFavorites();
        const index = favorites.findIndex(m => m.id === machine.id);
        
        if (index !== -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(machine);
        }
        
        this.saveFavorites(favorites);
        return favorites;
    },
    
    // 取得保留機台
    getReserves() {
        const stored = localStorage.getItem(this.RESERVE_KEY);
        if (stored) {
            try {
                const reserves = JSON.parse(stored);
                const now = Date.now();
                return reserves.filter(r => r.expiresAt > now);
            } catch (e) {
                return [];
            }
        }
        return [];
    },
    
    // 儲存保留機台
    saveReserves(reserves) {
        localStorage.setItem(this.RESERVE_KEY, JSON.stringify(reserves));
        
        window.dispatchEvent(new CustomEvent('t-pachin:reserves-updated', {
            detail: reserves
        }));
    },
    
    // 加入保留
    addReserve(machine, minutes = 30) {
        const reserves = this.getReserves();
        const now = Date.now();
        
        const existing = reserves.find(r => r.id === machine.id);
        if (existing) {
            existing.expiresAt = now + minutes * 60 * 1000;
            existing.reserveTime = new Date(now + minutes * 60 * 1000).toLocaleTimeString('zh-TW', {
                hour: '2-digit', minute: '2-digit'
            });
        } else {
            reserves.push({
                ...machine,
                reserveTime: new Date(now + minutes * 60 * 1000).toLocaleTimeString('zh-TW', {
                    hour: '2-digit', minute: '2-digit'
                }),
                expiresAt: now + minutes * 60 * 1000,
                lastAlertTime: 0
            });
        }
        
        this.saveReserves(reserves);
        return reserves;
    },
    
    // 移除保留
    removeReserve(machineId) {
        const reserves = this.getReserves();
        const newReserves = reserves.filter(r => r.id !== machineId);
        this.saveReserves(newReserves);
        return newReserves;
    }
};

// ==================== 初始化點數顯示（所有頁面共用） ====================
function initializePointsDisplay() {
    const userData = T_PACHIN_STORAGE.getUserData();
    
    document.querySelectorAll('.points-display').forEach(el => {
        el.textContent = userData.points.toLocaleString();
    });
    
    document.querySelectorAll('.tokens-display').forEach(el => {
        el.textContent = userData.totalTokens.toLocaleString();
    });
    
    document.querySelectorAll('.nickname-display').forEach(el => {
        el.textContent = userData.nickname;
    });
    
    return {
        getPoints: () => T_PACHIN_STORAGE.getUserData().points,
        updatePoints: (change) => {
            const newPoints = T_PACHIN_STORAGE.updatePoints(change);
            initializePointsDisplay();
            return newPoints;
        }
    };
}

// ==================== 倒數計時器管理 ====================
const CountdownManager = {
    intervals: {},
    
    startCountdown(elementId, expiresAt, onExpire) {
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
                el.classList.add('urgent');
                if (onExpire) onExpire();
                clearInterval(this.intervals[elementId]);
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            el.textContent = timeStr;
            
            if (remaining <= 600000) {
                el.classList.add('urgent');
            } else {
                el.classList.remove('urgent');
            }
        };
        
        update();
        this.intervals[elementId] = setInterval(update, 1000);
    },
    
    stopCountdown(elementId) {
        if (this.intervals[elementId]) {
            clearInterval(this.intervals[elementId]);
            delete this.intervals[elementId];
        }
    }
};

window.T_PACHIN_STORAGE = T_PACHIN_STORAGE;
window.CountdownManager = CountdownManager;
window.initializePointsDisplay = initializePointsDisplay;