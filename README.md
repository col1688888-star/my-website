<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>機台 · 全手機子母畫面</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg7.min.css">
    <style>
        /* ----- 重置 & 基礎 ----- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background: #0b0e14;
            font-family: 'Arial', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            touch-action: manipulation;
            position: relative;
            overflow-x: hidden;
        }

        /* 主機台：完全自適應，任何手機都適用 */
        #playMainArea {
            width: 100%;
            max-width: 400px;
            height: 98dvh;
            background: #10131c;
            border: 2px solid #2a4a5a;
            border-radius: 28px;
            box-shadow: 0 8px 0 #0a121c;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 5;
            margin: 0 auto;
            transition: border-radius 0.1s;
        }

        /* 彈性區域配置 (保證各比例區塊可壓縮) */
        #dataArea, #content, #panelTop, #panelBottom, #commandArea {
            min-height: 0;
        }
        #dataArea { flex: 1.2 1 0; min-height: 120px; max-height: 220px; padding: 8px 8px 4px 8px; z-index: 10; }
        #content { flex: 2 1 0; min-height: 150px; max-height: 280px; padding: 6px 8px; }
        #panelTop { flex: 0.5 1 0; min-height: 44px; max-height: 70px; }
        #panelBottom { flex: 0.7 1 0; min-height: 52px; max-height: 80px; }
        #commandArea { flex: 0.4 1 0; min-height: 40px; max-height: 60px; }

        /* ----- 大賞燈容器 (全部保留原有精美樣式，只強化觸控) ----- */
        .prize-light-container-special {
            width: 100%;
            height: 100%;
            background: #141a24;
            border: 1px solid #2c4050;
            border-radius: 20px;
            box-shadow: inset 0 2px 4px #00000060;
            overflow: hidden;
            position: relative;
        }
        .prizeLightPages {
            display: flex;
            width: 300%;
            height: 100%;
            transition: transform 0.3s ease-out;
        }
        .prizeLightPage {
            width: 33.333%;
            height: 100%;
            padding: 6px 6px 4px 6px;
            display: flex;
            flex-direction: column;
        }
        .pageHeader { flex: 0 0 16%; display: flex; justify-content: flex-end; align-items: center; border-bottom: 1px solid #2e4a5a; margin-bottom: 4px; padding-bottom: 2px; }
        .dataTabs { display: flex; gap: 8px; }
        .dataTab {
            height: 24px; padding: 0 12px; background: #1f2a34; border: 1px solid #3e5f70; border-radius: 30px;
            color: #b0d4e0; font-size: 10px; font-weight: 600; display: flex; align-items: center;
            letter-spacing: 0.3px; cursor: pointer; transition: all 0.1s;
        }
        .dataTab.active { background: #00b8c4; color: #111; border-color: #6ec0d0; font-weight: bold; }
        .pageContent { flex: 1; display: grid; grid-template-columns: 70% 28%; gap: 6px; overflow: hidden; margin-top: 2px; }
        .blockChartWrapper { background: #0e151f; border: 1px solid #2c4053; border-radius: 14px; padding: 6px 4px; }
        .blockChartLabels { display: flex; justify-content: space-around; color: #88b8c8; font-size: 7px; font-weight: bold; opacity: 0.8; margin-bottom: 4px; }
        .blockChartBars { display: flex; justify-content: space-around; align-items: flex-end; height: calc(100% - 18px); gap: 2px; }
        .blockChartBar { width: 8%; display: flex; flex-direction: column-reverse; align-items: center; gap: 2px; }
        .blockChartBlock { width: 100%; height: 10px; border-radius: 2px; border: 1px solid #2d4b5a; }
        .block-red { background: #cc3b5e; }
        .block-green { background: #2bb87c; }
        .block-black { background: #445a6b; }
        .blockChartValue { color: #9fc8d9; font-size: 7px; font-family: 'DSEG7 Classic', monospace; }
        .dataPanel { display: flex; flex-direction: column; gap: 6px; }
        .dataCard { background: #121b26; border: 1px solid #2e4a5e; border-radius: 12px; padding: 6px 5px; box-shadow: 0 2px 0 #0b121c; }
        .dataCardHeader { font-size: 8px; color: #90b8cc; font-weight: bold; margin-bottom: 2px; }
        .dataCardValue { font-size: 13px; font-family: 'DSEG7 Classic', monospace; text-align: right; color: #e0eef5; }
        .dataCard-total .dataCardValue { color: #f5e37a; }
        .dataCard-bb .dataCardValue { color: #ff8a9f; }
        .dataCard-rb .dataCardValue { color: #8ff0b5; }

        /* 滾輪區 (保證每個手機高度適當) */
        .reel-container {
            width: 100%;
            height: 100%;
            display: flex;
            gap: 6px;
            background: #0d121b;
            border-radius: 28px;
            border: 1px solid #2f4457;
            padding: 6px;
            box-shadow: inset 0 3px 6px #00000080, 0 4px 0 #0f1a22;
        }
        .reel {
            flex: 1;
            background: #1b2633;
            border-radius: 16px;
            border: 1px solid #3d5c70;
            overflow: hidden;
            position: relative;
        }
        .reel-content {
            position: absolute;
            width: 100%;
            height: 700%;
            transition: top 0.12s linear;
        }
        .reel-item {
            height: 14.2857%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(22px, 6vw, 28px);
            font-weight: bold;
            color: #c0e2f0;
            border-bottom: 1px solid #2e4e62;
            background: #1b2735;
        }
        .reel-rolling {
            animation: roll 0.07s linear infinite;
        }
        @keyframes roll {
            0% { top: 0; }
            100% { top: -14.2857%; }
        }

        /* 按鈕／搖桿 */
        .control-panel { background: #141c28; border-top: 1px solid #2e4b60; border-bottom: 1px solid #2e4b60; box-shadow: inset 0 2px 3px #00000050; }
        .game-btn {
            transition: all 0.1s ease; border-radius: 40px; font-weight: 800; letter-spacing: 0.5px;
            border: 1px solid #4e7a94; color: white; background: #2c4053;
            box-shadow: 0 4px 0 #0a1a22, 0 2px 4px #000000b0;
        }
        .game-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #0a1a22, 0 2px 4px #000; }
        .btn-red { background: #be3e62; border-color: #d4668a; }
        .btn-green { background: #1f8f6b; border-color: #52c2a0; }
        .btn-purple { background: #8a5fb0; border-color: #b792e6; }
        .btn-gray { background: #3a4b5e; border-color: #6f859b; }
        .btn-reserve { background: #c47c34; border: 1px solid #efb36e; color: #000; font-size: 11px; border-radius: 40px; font-weight: bold; box-shadow: 0 4px 0 #7e4f1f, 0 2px 4px #000; }
        .stop-btn {
            width: 44px; height: 44px; border-radius: 50%; background: #1f6f8f; border: 2px solid #6fb4cf;
            box-shadow: 0 4px 0 #0f3545, 0 2px 6px #000; transition: all 0.1s;
        }
        .stop-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #0f3545, 0 2px 4px #000; }
        .stop-btn:disabled { opacity: 0.3; transform: none; box-shadow: 0 4px 0 #0f3545; pointer-events: none; }
        .joystick {
            width: 58px; height: 58px; background: radial-gradient(circle at 35% 35%, #f0f5fa, #7f8b9c 60%, #3f4d5c 90%);
            border: 2px solid #b0c8dd; border-radius: 50%; box-shadow: 0 7px 0 #1f3340, 0 10px 12px #000000b0;
            position: relative; cursor: pointer; transition: all 0.08s linear;
            display: flex; align-items: center; justify-content: center;
        }
        .joystick:active { transform: translateY(6px); box-shadow: 0 2px 0 #1a2f3a, 0 6px 10px #000; }
        .joystick .lever-base-ring {
            position: absolute; width: 70px; height: 20px; background: linear-gradient(to bottom, #4e657b, #192d3a);
            bottom: -12px; border-radius: 40%; border: 1px solid #7f9eb5; z-index: -1;
            box-shadow: 0 3px 0 #0f202b, inset 0 1px 3px #afcadd;
        }

        /* 頂部面板文字 */
        #panelTop dl { text-align: center; }
        #panelTop dt { font-size: 9px; color: #a0c8dd; font-weight: bold; }
        #panelTop dd { font-size: clamp(11px, 3.5vw, 13px); font-family: 'DSEG7 Classic', monospace; color: #f3de8a; }

        /* 導航點 & 抽屜 */
        .prize-light-navigation {
            position: absolute; bottom: 4px; left: 0; right: 0; display: flex; justify-content: center;
            align-items: center; gap: 15px; z-index: 100; pointer-events: none; opacity: 0;
            transform: translateY(8px); transition: 0.2s;
        }
        .prize-light-navigation.active { opacity: 1; transform: translateY(0); pointer-events: all; }
        .prize-light-touch-zone {
            position: absolute; bottom: 0; left: 0; right: 0; height: 40px; background: transparent;
            z-index: 90; pointer-events: all; display: flex; justify-content: center; align-items: flex-end;
        }
        .touch-indicator { width: 50px; height: 5px; background: #3b7890; border-radius: 20px; margin-bottom: 6px; }
        .cyber-arrow { width: 38px; height: 38px; background: #1f2f3c; border: 2px solid #3d7895; border-radius: 50%; color: #b3e2f5; font-size: 16px; font-weight: bold; }
        .cyber-arrow:active { background: #2f5770; color: #fff; transform: scale(0.95); }
        .cyber-dots { display: flex; gap: 10px; background: #1f2a34; border: 1px solid #3a6075; padding: 5px 12px; border-radius: 40px; }
        .cyber-dot { width: 10px; height: 10px; border-radius: 50%; background: #405f72; border: 1px solid #6b95af; cursor: pointer; }
        .cyber-dot.active { width: 26px; border-radius: 20px; background: #2eb5cf; border-color: #a2e0f0; }

        /* 抽屜 */
        .drawer-trigger-area {
            position: absolute; right: 0; top: 0; width: 28px; height: 100%;
            background: transparent; z-index: 200; display: flex; align-items: center;
            justify-content: center; pointer-events: all; cursor: pointer;
        }
        .drawer-arrow {
            width: 20px; height: 50px; background: rgba(27, 59, 75, 0.25);
            backdrop-filter: blur(1px); border: 2px solid rgba(59, 122, 153, 0.3);
            border-right: none; border-radius: 30px 0 0 30px; display: flex;
            align-items: center; justify-content: center; color: rgba(200, 235, 255, 0.3);
            font-size: 16px; font-weight: bold; pointer-events: none;
        }
        .drawer-trigger-area:hover .drawer-arrow { background: rgba(27, 59, 75, 0.85); border-color: rgba(59, 122, 153, 0.9); color: rgba(200, 235, 255, 0.95); }
        .slide-drawer {
            position: absolute; right: -180px; top: 12px; width: 160px;
            background: #1b2633; border: 2px solid #2e6a88; border-radius: 20px 0 0 20px;
            box-shadow: -4px 6px 0 #0e202b, 0 6px 12px #000; z-index: 250;
            transition: right 0.25s ease-out; pointer-events: all; overflow: hidden;
        }
        .slide-drawer.open { right: 0; }
        .drawer-header { background: #1f3e50; padding: 8px 10px; border-bottom: 2px solid #2e7a9a; display: flex; align-items: center; justify-content: space-between; color: #d0f0ff; font-weight: bold; font-size: 12px; }
        .drawer-content { padding: 10px; background: #14222e; }
        .drawer-item { background: #1d3342; border: 1px solid #2e6078; border-radius: 12px; padding: 8px 6px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .drawer-item-icon { width: 24px; height: 24px; background: #234d60; border-radius: 30%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid #4797b5; }
        .drawer-item-text { font-size: 10px; color: #b8e2f5; }
        .drawer-item-value { margin-left: auto; background: #003d55; padding: 2px 6px; border-radius: 20px; font-size: 9px; font-family: 'DSEG7 Classic', monospace; color: #f5e37a; }
        .drawer-footer { display: flex; gap: 5px; margin-top: 8px; }
        .drawer-footer button { flex: 1; background: #1a4f66; border: 1px solid #3f96b5; border-radius: 30px; padding: 5px 0; font-size: 9px; font-weight: bold; color: white; box-shadow: 0 3px 0 #0f303f; cursor: pointer; }
        .drawer-footer button:active { transform: translateY(3px); box-shadow: 0 1px 0 #0f303f; }

        /* 狀態訊息 */
        .status-message {
            position: fixed; top: 12px; left: 12px; right: 12px; background: #1d2a36;
            border: 2px solid #3487a7; border-radius: 60px; padding: 12px 20px;
            color: #dcf0f5; font-weight: bold; font-size: 14px; z-index: 3000;
            text-align: center; box-shadow: 0 5px 0 #0e1e2c; transform: translateY(-80px);
            transition: transform 0.3s ease;
        }
        .status-message.show { transform: translateY(0); }

        /* 小螢幕微調 */
        @media (max-height: 670px) {
            #playMainArea { border-radius: 20px; }
            #dataArea { min-height: 100px; max-height: 160px; }
            #content { min-height: 130px; max-height: 200px; }
            .reel-item { font-size: 22px; }
            .stop-btn { width: 38px; height: 38px; }
            .joystick { width: 48px; height: 48px; }
        }
        @media (max-width: 350px) {
            .stop-btn { width: 34px; height: 34px; }
            .joystick { width: 44px; height: 44px; }
            .game-btn { font-size: 0.7rem; }
        }
    </style>
</head>
<body>
    <div class="status-message" id="statusMessage"></div>

    <div id="playMainArea">
        <!-- 大賞燈區＋抽屜 -->
        <div id="dataArea">
            <div class="prize-light-container-special" id="prizeLightContainer">
                <div class="prizeLightPages" id="prizeLightPages">
                    <div class="prizeLightPage" data-page="0">
                        <div class="pageHeader"><div class="dataTabs"><div class="dataTab active" data-type="spins">轉數</div><div class="dataTab" data-type="bb">BB</div><div class="dataTab" data-type="rb">RB</div></div></div>
                        <div class="pageContent">
                            <div class="blockChartWrapper"><div class="blockChartLabels" id="chartLabels"></div><div class="blockChartBars" id="blockChartBars"></div></div>
                            <div class="dataPanel"><div class="dataCard dataCard-total"><div class="dataCardHeader">總轉數</div><div class="dataCardValue" id="totalSpinsValue">12,589</div></div><div class="dataCard dataCard-bb"><div class="dataCardHeader">BB次數</div><div class="dataCardValue" id="bbCountValue">156</div></div><div class="dataCard dataCard-rb"><div class="dataCardHeader">RB次數</div><div class="dataCardValue" id="rbCountValue">289</div></div></div>
                        </div>
                    </div>
                    <div class="prizeLightPage" data-page="1"><div class="pageHeader"><div class="dataTabs"><div class="dataTab active">機台履歷</div></div></div><div style="overflow-y:auto; padding:4px;"><div style="color:#88c5dd;">幸運之星 #1 履歷</div><div id="machineHistoryList"></div></div></div>
                    <div class="prizeLightPage" data-page="2"><div class="pageHeader"><div class="dataTabs"><div class="dataTab active">機台攻略</div></div></div><div style="overflow-y:auto; padding:4px;"><div style="color:#88c5dd;">幸運之星 #1 攻略</div><div id="machineStrategyList"></div></div></div>
                </div>
                <div class="prize-light-touch-zone" id="prizeLightTouchZone"><div class="touch-indicator"></div></div>
                <div class="prize-light-navigation" id="prizeLightNavigation">
                    <button class="cyber-arrow" id="prevPrizeLightPage">◀</button>
                    <div class="cyber-dots" id="prizeLightDots"><div class="cyber-dot active" data-index="0"></div><div class="cyber-dot" data-index="1"></div><div class="cyber-dot" data-index="2"></div></div>
                    <button class="cyber-arrow" id="nextPrizeLightPage">▶</button>
                </div>

                <div class="drawer-trigger-area" id="drawerTriggerArea"><div class="drawer-arrow" id="drawerArrow">◀</div></div>
                <div class="slide-drawer" id="slideDrawer">
                    <div class="drawer-header"><span>⚙️ 快捷工具</span><div style="display:flex; gap:5px;"><button id="drawerCloseBtn" style="background:transparent; border:none; color:#8fcae0; font-size:16px; cursor:pointer;">✕</button></div></div>
                    <div class="drawer-content">
                        <div class="drawer-item"><div class="drawer-item-icon">🎰</div><div class="drawer-item-text">機台編號</div><div class="drawer-item-value">#01</div></div>
                        <div class="drawer-item"><div class="drawer-item-icon">💎</div><div class="drawer-item-text">庫存代幣</div><div class="drawer-item-value" id="drawerMedal">20</div></div>
                        <div class="drawer-item"><div class="drawer-item-icon">📊</div><div class="drawer-item-text">BB機率</div><div class="drawer-item-value">12%</div></div>
                        <div class="drawer-footer"><button id="drawerSetting">設定</button><button id="drawerHistory">紀錄</button></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 滾輪區 -->
        <div id="content"><div class="reel-container"><div class="reel" id="reelL"><div class="reel-content" id="reelContentL"></div></div><div class="reel" id="reelC"><div class="reel-content" id="reelContentC"></div></div><div class="reel" id="reelR"><div class="reel-content" id="reelContentR"></div></div></div></div>

        <!-- 頂部面板 -->
        <div id="panelTop" class="control-panel"><div style="display: flex; align-items: center; height:100%; padding:0 4px;"><div style="width:18%; display: flex; justify-content: center;"><button id="maxBet" class="game-btn btn-red" style="width:100%; height:34px; font-size:0.9rem; padding:0 4px;">MAX</button></div><div style="width:60%; display: flex; justify-content: space-around;"><dl><dt>BB Point</dt><dd id="bbPoint">8,984,002pt</dd></dl><dl><dt>Medal</dt><dd id="medalNum">0Coin</dd></dl></div><div style="width:18%; display: flex; justify-content: center;"><button id="purchaseMedal" class="game-btn btn-red" style="width:100%; height:34px; font-size:0.9rem; padding:0 4px;">BUY</button></div></div></div>

        <!-- 底部搖桿+停止 -->
        <div id="panelBottom" class="control-panel"><div style="display:flex; align-items:center; justify-content:space-between; height:100%; padding:0 10px;"><div style="flex: 0 0 auto;"><button class="joystick" id="lever"><div class="lever-base-ring"></div></button></div><div style="display:flex; gap:clamp(12px, 6vw, 32px); justify-content:center; flex: 1 1 auto;"><button class="stop-btn" id="btnStopL"></button><button class="stop-btn" id="btnStopC"></button><button class="stop-btn" id="btnStopR"></button></div><div style="flex: 0 0 20px;"></div></div></div>

        <!-- 命令列 (自動按鈕) -->
        <div id="commandArea" class="control-panel"><div style="display:flex; height:100%; gap:5px; padding:0 4px;"><button id="btnHome" class="game-btn btn-gray" style="flex:1;">首頁</button><button id="btnReserve" class="game-btn btn-reserve" style="flex:1;">保留</button><button id="btnBreak" class="game-btn btn-green" style="flex:1;">離開</button><button id="btnAuto" class="game-btn btn-purple" style="flex:1;">自動</button></div></div>
    </div>

    <script>
        (function() {
            const statusMsg = document.getElementById('statusMessage');
            function showMessage(msg, type = 'info') {
                statusMsg.innerText = msg;
                statusMsg.style.borderColor = type === 'error' ? '#c6574a' : (type === 'success' ? '#3fa38c' : '#3487a7');
                statusMsg.classList.add('show');
                setTimeout(() => statusMsg.classList.remove('show'), 2500);
            }

            // 初始化滾輪符號
            const symbols = ['7','🍒','⭐','🍋','🔔','7','🍒'];
            ['reelContentL','reelContentC','reelContentR'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = symbols.map(s => `<div class="reel-item">${s}</div>`).join('');
            });

            // 機台資料
            let currentMachine = { totalSpins:12589, bbCount:156, rbCount:289, medalCount:20, bbPoint:8984002 };
            function updateDisplay() {
                document.getElementById('totalSpinsValue').innerText = currentMachine.totalSpins.toLocaleString();
                document.getElementById('bbCountValue').innerText = currentMachine.bbCount;
                document.getElementById('rbCountValue').innerText = currentMachine.rbCount;
                document.getElementById('medalNum').innerText = currentMachine.medalCount + 'Coin';
                document.getElementById('bbPoint').innerText = currentMachine.bbPoint.toLocaleString() + 'pt';
                const drawerMedal = document.getElementById('drawerMedal');
                if(drawerMedal) drawerMedal.innerText = currentMachine.medalCount;
            }
            updateDisplay();

            // 簡易圖表
            function renderChart() {
                const bars = document.getElementById('blockChartBars');
                if (!bars) return;
                const data = [4,3,5,2,4,3,4,3,2,3];
                bars.innerHTML = '';
                for (let i=0; i<10; i++) {
                    const bar = document.createElement('div'); bar.className = 'blockChartBar';
                    for (let b=0; b<data[i]; b++) {
                        const block = document.createElement('div');
                        block.className = `blockChartBlock ${b%2===0?'block-red':'block-green'}`;
                        bar.appendChild(block);
                    }
                    const val = document.createElement('div'); val.className = 'blockChartValue'; val.innerText = (20 + i*7).toString();
                    bar.appendChild(val);
                    bars.appendChild(bar);
                }
            }
            renderChart();
            document.querySelectorAll('.dataTab').forEach(tab => tab.addEventListener('click', function() {
                document.querySelectorAll('.dataTab').forEach(t=>t.classList.remove('active'));
                this.classList.add('active');
                renderChart();
            }));

            // 滾輪控制 (初始停止按鈕為禁用)
            const reels = ['reelContentL','reelContentC','reelContentR'].map(id=>document.getElementById(id));
            const stops = ['btnStopL','btnStopC','btnStopR'].map(id=>document.getElementById(id));
            let rolling = false;
            stops.forEach(b=> b.disabled = true);

            document.getElementById('lever').addEventListener('click', ()=>{
                if (currentMachine.medalCount <= 0) { showMessage('代幣不足','error'); return; }
                currentMachine.medalCount--;
                currentMachine.totalSpins++;
                updateDisplay();
                reels.forEach(r=> { r.classList.add('reel-rolling'); r.style.top = ''; });  // 清除固定位置
                rolling = true;
                stops.forEach(b=> b.disabled = false);
                showMessage('滾輪轉動中');
            });

            stops.forEach((btn,i)=> btn.addEventListener('click', ()=>{
                if (!rolling) return;
                reels[i].classList.remove('reel-rolling');
                reels[i].style.top = `-${(Math.floor(Math.random()*7))*14.2857}%`;
                if (!reels.some(r=> r.classList.contains('reel-rolling'))) {
                    rolling = false;
                    stops.forEach(b=> b.disabled = true);
                    if (Math.random()>0.6) showMessage('中獎!','success');
                }
            }));

            document.getElementById('purchaseMedal').addEventListener('click', ()=>{
                if (currentMachine.bbPoint>=50) {
                    currentMachine.bbPoint -= 50;
                    currentMachine.medalCount += 50;
                    updateDisplay();
                    showMessage('購買50代幣','success');
                } else showMessage('BB點不足','error');
            });

            // 大賞燈導航
            const pages = document.getElementById('prizeLightPages');
            const dots = document.querySelectorAll('.cyber-dot');
            const prev = document.getElementById('prevPrizeLightPage');
            const next = document.getElementById('nextPrizeLightPage');
            let curPage = 0;
            function setPage(p) {
                if (p<0||p>2) return;
                curPage = p;
                pages.style.transform = `translateX(-${p*33.333}%)`;
                dots.forEach((d,i)=> d.classList.toggle('active', i===p));
                showNav();
            }
            prev.addEventListener('click', ()=> setPage(curPage-1));
            next.addEventListener('click', ()=> setPage(curPage+1));
            dots.forEach(d=> d.addEventListener('click', function(){ setPage(parseInt(this.dataset.index)); }));

            const nav = document.getElementById('prizeLightNavigation');
            const zone = document.getElementById('prizeLightTouchZone');
            let hideTimer;
            function showNav() { nav.classList.add('active'); clearTimeout(hideTimer); hideTimer = setTimeout(()=> nav.classList.remove('active'), 4000); }
            zone.addEventListener('mouseenter', showNav);
            zone.addEventListener('touchstart', showNav);
            nav.addEventListener('mouseenter', ()=> clearTimeout(hideTimer));
            nav.addEventListener('mouseleave', ()=> hideTimer = setTimeout(()=> nav.classList.remove('active'), 1000));

            // 其他按鈕
            document.getElementById('btnReserve').addEventListener('click', ()=> showMessage('保留功能'));
            document.getElementById('maxBet').addEventListener('click', ()=> showMessage('MAX BET'));
            document.getElementById('btnHome').addEventListener('click', ()=> showMessage('首頁'));
            document.getElementById('btnBreak').addEventListener('click', ()=> showMessage('離開'));

            document.getElementById('machineHistoryList').innerHTML = '<div style="color:#c0ddec;">· 02/15 最大獎8500</div><div style="color:#c0ddec;">· 02/12 BB連發2次</div>';
            document.getElementById('machineStrategyList').innerHTML = '<div style="color:#c0ddec;">📌 20:00後RB機率較高</div><div style="color:#c0ddec;">📌 連10沒中可略增注</div>';

            // 抽屜
            const triggerArea = document.getElementById('drawerTriggerArea');
            const drawer = document.getElementById('slideDrawer');
            const closeBtn = document.getElementById('drawerCloseBtn');
            triggerArea.addEventListener('click', (e) => { e.stopPropagation(); drawer.classList.toggle('open'); });
            closeBtn.addEventListener('click', (e) => { e.stopPropagation(); drawer.classList.remove('open'); });
            document.addEventListener('click', (e) => { if (!drawer.contains(e.target) && !triggerArea.contains(e.target)) drawer.classList.remove('open'); });
            document.getElementById('drawerSetting').addEventListener('click', (e) => { e.stopPropagation(); showMessage('快捷設定'); });
            document.getElementById('drawerHistory').addEventListener('click', (e) => { e.stopPropagation(); showMessage('快捷紀錄'); });

            // ========== 子母畫面 全手機修正版 ==========
            let autoModeActive = false;
            let pipWindow = null;
            const autoBtn = document.getElementById('btnAuto');
            const isDocumentPiPSupported = 'documentPictureInPicture' in window;

            // 停止按鈕陣列全域
            autoBtn.addEventListener('click', async () => {
                autoModeActive = !autoModeActive;

                if (autoModeActive) {
                    if (isDocumentPiPSupported) {
                        showMessage('自動模式開啟 · 切換App即小視窗');
                        try {
                            if ('mediaSession' in navigator) {
                                navigator.mediaSession.setActionHandler('enterpictureinpicture', enterPiP);
                                navigator.mediaSession.metadata = new MediaMetadata({
                                    title: '幸運之星模擬機',
                                    artist: '自動模式進行中'
                                });
                            }
                        } catch (e) { console.log('mediaSession err', e); }
                    } else {
                        showMessage('自動模式啟用 (但瀏覽器不支援子母畫面)', 'error');
                    }
                } else {
                    if (pipWindow) { pipWindow.close(); pipWindow = null; }
                    showMessage('自動模式關閉');
                }
            });

            // 監聽頁面隱藏 (使用者切換App或分頁) 自動開啟PiP
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && autoModeActive && isDocumentPiPSupported && !pipWindow) {
                    enterPiP();
                }
            });

            async function enterPiP() {
                try {
                    // 更通用的尺寸，適合絕大多數手機畫面比例
                    pipWindow = await window.documentPictureInPicture.requestWindow({
                        width: 360,
                        height: 640
                    });

                    // 建立PiP內容
                    const pipDoc = pipWindow.document;
                    pipDoc.head.innerHTML = `<style>
                        body { margin:0; background:#10131c; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; padding:8px; font-family:sans-serif; }
                        .reel-container { display:flex; gap:4px; background:#0d121b; border-radius:20px; border:1px solid #2f4457; padding:4px; width:100%; max-width:340px; }
                        .reel { flex:1; background:#1b2633; border-radius:12px; border:1px solid #3d5c70; overflow:hidden; position:relative; height:140px; }
                        .reel-content { position:absolute; width:100%; height:700%; }
                        .reel-item { height:14.2857%; display:flex; align-items:center; justify-content:center; font-size:26px; color:#c0e2f0; border-bottom:1px solid #2e4e62; background:#1b2735; }
                        .reel-rolling { animation: roll 0.07s linear infinite; }
                        @keyframes roll { 0% { top:0; } 100% { top:-14.2857%; } }
                        .pip-status { color:#a0c8dd; margin-top:12px; font-size:15px; font-weight:bold; background:#1f2a36; padding:6px 16px; border-radius:40px; border:1px solid #3487a7; }
                    </style>`;

                    const body = pipDoc.body;

                    // 複製滾輪容器（保留當前轉動狀態）
                    const originalReels = document.querySelector('.reel-container');
                    let reelHtml = '';
                    if (originalReels) {
                        reelHtml = originalReels.outerHTML;
                    } else {
                        reelHtml = `<div class="reel-container"><div class="reel"><div class="reel-content reel-rolling">${symbols.map(s=>`<div class="reel-item">${s}</div>`).join('')}</div></div><div class="reel"><div class="reel-content reel-rolling">${symbols.map(s=>`<div class="reel-item">${s}</div>`).join('')}</div></div><div class="reel"><div class="reel-content reel-rolling">${symbols.map(s=>`<div class="reel-item">${s}</div>`).join('')}</div></div></div>`;
                    }

                    // 移除原有id避免重複
                    const containerDiv = document.createElement('div');
                    containerDiv.innerHTML = reelHtml;
                    containerDiv.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
                    body.appendChild(containerDiv.firstChild);

                    // 增加狀態文字
                    const statusDiv = pipDoc.createElement('div');
                    statusDiv.className = 'pip-status';
                    statusDiv.innerText = autoModeActive ? '⚡ 自動模式運轉中' : '🎰 子母畫面';
                    body.appendChild(statusDiv);

                    // 監聽關閉
                    pipWindow.addEventListener('pagehide', () => {
                        pipWindow = null;
                    });

                    showMessage('子母畫面啟動', 'success');

                } catch (err) {
                    console.warn('PiP失敗:', err);
                    showMessage('子母畫面無法開啟', 'error');
                    pipWindow = null;
                }
            }

            // 字體適應
            function adjustUIFontSize() { /* 無需額外動作，使用clamp即可 */ }
            adjustUIFontSize();
            window.addEventListener('resize', adjustUIFontSize);
        })();
    </script>
</body>
</html>
