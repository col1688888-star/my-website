// ========== T-PACHIN 全域共用資料管理 ==========
(function() {
    // 避免重複初始化
    if (window.TPachinShared) return;
    window.TPachinShared = true;

    // ===== 預設資料 =====
    const DEFAULT_USER = {
        nickname: '夫人會生氣',
        credits: 5280,
        avatar: 'https://i.pravatar.cc/150?img=7',
        vipLevel: 3,
        exp: { current: 2480, max: 3600 }
    };

    // ===== 初始化儲存資料 =====
    function initStorage() {
        if (!localStorage.getItem('userData')) {
            localStorage.setItem('userData', JSON.stringify(DEFAULT_USER));
        }
        if (!localStorage.getItem('favorites')) {
            localStorage.setItem('favorites', JSON.stringify([]));
        }
        if (!localStorage.getItem('favoriteMachinesData')) {
            localStorage.setItem('favoriteMachinesData', JSON.stringify({}));
        }
        if (!localStorage.getItem('keepMachines')) {
            // 預設保留機台
            const defaultKeeps = [
                {
                    id: 1,
                    name: '吉宗(預約保留)',
                    image: 'https://static.wixstatic.com/media/d5e540_0926089e3da443eebe6bc2ede58f5788~mv2.png',
                    ratio: '1:2',
                    vendor: 'Daito',
                    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    name: '奇蹟小丑',
                    image: 'https://static.wixstatic.com/media/d5e540_1c6cd7d36cc24e47a6b359a1abeb3923~mv2.png',
                    ratio: '1:5',
                    vendor: 'Rodeo',
                    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
                }
            ];
            localStorage.setItem('keepMachines', JSON.stringify(defaultKeeps));
        }
    }

    // ===== 用戶資料管理 =====
    const UserManager = {
        get() {
            return JSON.parse(localStorage.getItem('userData')) || DEFAULT_USER;
        },
        
        update(newData) {
            const current = this.get();
            const updated = { ...current, ...newData };
            localStorage.setItem('userData', JSON.stringify(updated));
            this.notifyUpdate('userData', updated);
            return updated;
        },
        
        updateCredits(amount) {
            const user = this.get();
            user.credits = amount;
            localStorage.setItem('userData', JSON.stringify(user));
            this.notifyUpdate('userData', user);
        },
        
        updateNickname(nickname) {
            const user = this.get();
            user.nickname = nickname;
            localStorage.setItem('userData', JSON.stringify(user));
            this.notifyUpdate('userData', user);
        },
        
        updateAvatar(avatarUrl) {
            const user = this.get();
            user.avatar = avatarUrl;
            localStorage.setItem('userData', JSON.stringify(user));
            this.notifyUpdate('userData', user);
        },
        
        notifyUpdate(key, data) {
            window.dispatchEvent(new StorageEvent('storage', {
                key: key,
                newValue: JSON.stringify(data)
            }));
        }
    };

    // ===== 收藏管理 =====
    const FavoriteManager = {
        getAll() {
            return JSON.parse(localStorage.getItem('favorites')) || [];
        },
        
        getAllData() {
            return JSON.parse(localStorage.getItem('favoriteMachinesData')) || {};
        },
        
        add(machineName, machineData = {}) {
            const favorites = this.getAll();
            if (!favorites.includes(machineName)) {
                favorites.push(machineName);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                const allData = this.getAllData();
                allData[machineName] = machineData;
                localStorage.setItem('favoriteMachinesData', JSON.stringify(allData));
                
                this.notifyUpdate();
                this.showToast(`💖 已加入最愛：${machineName}`);
                return true;
            }
            return false;
        },
        
        remove(machineName) {
            let favorites = this.getAll();
            favorites = favorites.filter(name => name !== machineName);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            const allData = this.getAllData();
            delete allData[machineName];
            localStorage.setItem('favoriteMachinesData', JSON.stringify(allData));
            
            this.notifyUpdate();
            this.showToast(`❤️ 已從最愛移除：${machineName}`);
        },
        
        toggle(machineName, machineData = {}) {
            const favorites = this.getAll();
            if (favorites.includes(machineName)) {
                this.remove(machineName);
                return false;
            } else {
                this.add(machineName, machineData);
                return true;
            }
        },
        
        isFavorite(machineName) {
            return this.getAll().includes(machineName);
        },
        
        notifyUpdate() {
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'favorites',
                newValue: JSON.stringify(this.getAll())
            }));
        },
        
        showToast(message) {
            let toast = document.querySelector('.global-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'global-toast fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm py-2 px-4 rounded-full border border-blue-400 shadow-lg z-50 transition-opacity duration-300';
                document.body.appendChild(toast);
            }
            toast.textContent = message;
            toast.style.opacity = '1';
            setTimeout(() => toast.style.opacity = '0', 2000);
        }
    };

    // ===== 保留機台管理 =====
    const KeepManager = {
        getAll() {
            return JSON.parse(localStorage.getItem('keepMachines')) || [];
        },
        
        add(machineData) {
            const keeps = this.getAll();
            const newKeep = {
                ...machineData,
                id: Date.now(),
                endTime: machineData.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            keeps.push(newKeep);
            localStorage.setItem('keepMachines', JSON.stringify(keeps));
            this.notifyUpdate();
            return newKeep;
        },
        
        remove(id) {
            let keeps = this.getAll();
            keeps = keeps.filter(k => k.id !== id);
            localStorage.setItem('keepMachines', JSON.stringify(keeps));
            this.notifyUpdate();
        },
        
        removeByName(name) {
            let keeps = this.getAll();
            keeps = keeps.filter(k => k.name !== name);
            localStorage.setItem('keepMachines', JSON.stringify(keeps));
            this.notifyUpdate();
        },
        
        updateCountdowns() {
            const keeps = this.getAll();
            const now = Date.now();
            const activeKeeps = keeps.filter(k => new Date(k.endTime).getTime() > now);
            
            if (activeKeeps.length !== keeps.length) {
                localStorage.setItem('keepMachines', JSON.stringify(activeKeeps));
            }
            
            return activeKeeps;
        },
        
        notifyUpdate() {
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'keepMachines',
                newValue: JSON.stringify(this.getAll())
            }));
        }
    };

    // ===== 頁面顯示更新 =====
    const UIManager = {
        updateAll() {
            this.updateUserDisplay();
            this.updateFavoriteBadges();
            this.updateKeepBadges();
            this.updateFavoriteButtons();
        },
        
        updateUserDisplay() {
            const user = UserManager.get();
            
            document.querySelectorAll('.player-nickname, [data-user-nickname]').forEach(el => {
                el.textContent = user.nickname;
            });
            
            document.querySelectorAll('.text-white.text-xs, .text-white').forEach(el => {
                if (el.textContent.includes('夫人') || el.closest('.text-right') || el.closest('.flex-col')) {
                    el.textContent = user.nickname;
                }
            });
            
            document.querySelectorAll('.player-credits, .text-amber-400, .text-yellow-400').forEach(el => {
                if (el.classList.contains('text-lg') || el.closest('.text-right')) {
                    el.textContent = user.credits.toLocaleString();
                }
            });
            
            const avatarImg = document.getElementById('avatarImage');
            if (avatarImg) avatarImg.src = user.avatar;
            
            const vipBadge = document.getElementById('vipBadge');
            if (vipBadge) vipBadge.textContent = `VIP ${user.vipLevel}`;
            
            const expText = document.getElementById('expText');
            if (expText) expText.textContent = `經驗值 ${user.exp.current}/${user.exp.max}`;
            
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                const percent = (user.exp.current / user.exp.max) * 100;
                progressFill.style.width = `${percent}%`;
            }
        },
        
        updateFavoriteBadges() {
            const favorites = FavoriteManager.getAll();
            document.querySelectorAll('#favCount, #favCountDisplay, .favorite-count').forEach(el => {
                el.textContent = favorites.length;
            });
        },
        
        updateKeepBadges() {
            const keeps = KeepManager.getAll();
            document.querySelectorAll('#keepCount, #keepCountDisplay, .keep-count').forEach(el => {
                el.textContent = keeps.length;
            });
        },
        
        updateFavoriteButtons() {
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                const machineName = btn.getAttribute('data-machine');
                if (machineName) {
                    if (FavoriteManager.isFavorite(machineName)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
        }
    };

    // ===== 倒數計時更新 =====
    function startCountdownUpdater() {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                KeepManager.updateCountdowns();
                
                document.querySelectorAll('[data-reserve-end]').forEach(el => {
                    const endTimeStr = el.getAttribute('data-reserve-end');
                    if (!endTimeStr) return;
                    
                    const endTime = new Date(endTimeStr).getTime();
                    const now = Date.now();
                    const diff = endTime - now;
                    
                    const countdownEl = el.classList.contains('reserve-countdown') ? 
                        el : el.querySelector('.reserve-countdown');
                    
                    if (!countdownEl) return;
                    
                    if (diff <= 0) {
                        countdownEl.innerHTML = '<i class="fa fa-clock-o"></i> 保留已結束';
                        countdownEl.style.color = '#ef4444';
                        return;
                    }
                    
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    
                    let timeText = '';
                    if (days > 0) {
                        timeText = `${days}天 ${hours}小時`;
                    } else if (hours > 0) {
                        timeText = `${hours}小時 ${minutes}分`;
                    } else if (minutes > 0) {
                        timeText = `${minutes}分 ${seconds}秒`;
                    } else {
                        timeText = `${seconds}秒`;
                    }
                    
                    countdownEl.innerHTML = `<i class="fa fa-hourglass-half"></i> 剩餘 ${timeText}`;
                    
                    if (diff < 30 * 60 * 1000) {
                        countdownEl.style.color = '#ff6b6b';
                    } else if (diff < 2 * 60 * 60 * 1000) {
                        countdownEl.style.color = '#ffd93d';
                    } else {
                        countdownEl.style.color = '#fbbf24';
                    }
                });
            }
        }, 1000);
    }

    // ===== 監聽跨頁面事件 =====
    function setupStorageListener() {
        window.addEventListener('storage', (e) => {
            switch(e.key) {
                case 'userData':
                    UIManager.updateUserDisplay();
                    break;
                case 'favorites':
                    UIManager.updateFavoriteBadges();
                    UIManager.updateFavoriteButtons();
                    break;
                case 'keepMachines':
                    UIManager.updateKeepBadges();
                    break;
            }
        });
    }

    // ===== 初始化 =====
    function init() {
        initStorage();
        setupStorageListener();
        UIManager.updateAll();
        startCountdownUpdater();
        
        document.addEventListener('click', (e) => {
            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const machineName = favBtn.getAttribute('data-machine');
                if (!machineName) return;
                
                const card = favBtn.closest('.game-card-bg, .machine-card');
                let machineData = {};
                
                if (card) {
                    const img = card.querySelector('img');
                    const ratioSpan = card.querySelector('.bg-blue-900\\/50, .machine-meta span:first-child');
                    const vendorSpan = card.querySelectorAll('.bg-blue-900\\/50, .machine-meta span')[1];
                    
                    machineData = {
                        name: machineName,
                        image: img ? img.src : '',
                        ratio: ratioSpan ? ratioSpan.textContent : '',
                        vendor: vendorSpan ? vendorSpan.textContent : ''
                    };
                }
                
                const isNowFavorite = FavoriteManager.toggle(machineName, machineData);
                
                favBtn.classList.toggle('active', isNowFavorite);
                favBtn.classList.add('pulse');
                setTimeout(() => favBtn.classList.remove('pulse'), 300);
            }
        });
        
        console.log('T-PACHIN 共用模組初始化完成');
    }

    init();

    window.TPachin = {
        user: UserManager,
        favorites: FavoriteManager,
        keeps: KeepManager,
        ui: UIManager
    };
})();