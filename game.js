* { margin: 0; padding: 0; box-sizing: border-box; }
button, input { font: inherit; }
button { user-select: none; }
:focus-visible { outline: 3px solid #66ffcc; outline-offset: 3px; }

html, body {
    width: 100%;
    min-height: 100%;
    overflow: hidden;
    background: #05050f;
    font-family: 'Courier New', monospace;
    color: #fff;
}

#bg-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    display: block;
}

#lobby {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background:
        radial-gradient(ellipse at 50% 30%, rgba(255, 100, 0, 0.15), transparent 60%),
        radial-gradient(ellipse at 50% 80%, rgba(255, 0, 255, 0.12), transparent 60%);
    transition: opacity 0.4s ease;
}

#lobby.hidden { opacity: 0; pointer-events: none; }

.title-wrap { margin-bottom: 10px; text-align: center; }

.game-title {
    font-size: clamp(46px, 8vw, 90px);
    font-weight: 900;
    letter-spacing: clamp(6px, 1.5vw, 16px);
    background: linear-gradient(180deg, #fff 0%, #ffcc00 40%, #ff6600 70%, #ff0066 100%);
    background-size: 100% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 150, 0, 0.6), 0 0 60px rgba(255, 50, 0, 0.4);
    animation: titleFloat 4s ease-in-out infinite, titleShine 3s linear infinite;
    line-height: 1;
}

@keyframes titleFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
@keyframes titleShine { 0%{background-position:0% 0%;} 100%{background-position:0% 200%;} }

.subtitle {
    font-size: clamp(11px, 1.5vw, 16px);
    letter-spacing: clamp(4px, 1vw, 10px);
    color: #ff6600;
    text-shadow: 0 0 15px #ff3300, 0 0 30px #ff0000;
    margin-top: 6px;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }

.menu {
    display: flex; flex-direction: column; gap: 14px;
    margin-top: 40px; width: 100%; max-width: 340px; z-index: 2;
}

.menu-btn {
    position: relative; padding: 16px 32px;
    font-family: inherit; font-size: 18px; font-weight: bold;
    letter-spacing: 4px; text-transform: uppercase;
    color: #ffcc00;
    background: linear-gradient(145deg, rgba(20,20,40,0.9), rgba(10,10,25,0.95));
    border: 2px solid rgba(255, 200, 0, 0.5);
    border-radius: 12px; cursor: pointer; overflow: hidden;
    transition: all 0.25s ease;
    text-shadow: 0 0 10px rgba(255, 200, 0, 0.6);
    display: flex; align-items: center; justify-content: center; gap: 12px;
}

.menu-btn .btn-icon { font-size: 22px; filter: drop-shadow(0 0 6px currentColor); }

.menu-btn::before {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,200,0,0.25), transparent);
    transition: left 0.5s ease;
}

.menu-btn:hover::before { left: 100%; }

.menu-btn:hover {
    border-color: #ffcc00; color: #fff;
    box-shadow: 0 0 25px rgba(255,200,0,0.6), 0 0 50px rgba(255,100,0,0.3);
    transform: translateY(-2px) scale(1.02);
}

.menu-btn:active { transform: translateY(1px) scale(0.99); }

.menu-btn.primary {
    background: linear-gradient(145deg, #ffcc00, #ff8800);
    color: #1a1a2e; text-shadow: none; border-color: #ffcc00;
    font-size: 20px; padding: 18px 32px;
}

.menu-btn.primary:hover { box-shadow: 0 0 30px rgba(255,200,0,0.9), 0 0 70px rgba(255,100,0,0.5); }
.menu-btn.primary .btn-icon { color: #1a1a2e; filter: none; }

.lobby-footer {
    position: absolute; bottom: 14px; left: 0; right: 0;
    text-align: center; color: #555;
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
}

.lobby-footer .highlight { color: #ffcc00; }

.modal-bg {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    display: none; justify-content: center; align-items: center;
    padding: 20px; opacity: 0; transition: opacity 0.3s ease;
}

.modal-bg.show { display: flex; opacity: 1; }

.modal {
    background: linear-gradient(160deg, #10102a, #08081a);
    border: 2px solid rgba(255,200,0,0.5);
    border-radius: 20px; padding: 28px 32px;
    width: 100%; max-width: 520px; max-height: 88vh;
    overflow-y: auto;
    box-shadow: 0 0 60px rgba(255,200,0,0.3);
    transform: scale(0.9) translateY(20px);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-bg.show .modal { transform: scale(1) translateY(0); }
.modal::-webkit-scrollbar { width: 8px; }
.modal::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
.modal::-webkit-scrollbar-thumb { background: #ffcc00; border-radius: 4px; }

.modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; padding-bottom: 14px;
    border-bottom: 2px solid rgba(255,200,0,0.3);
}

.modal-title {
    font-size: 24px; font-weight: bold; letter-spacing: 4px;
    color: #ffcc00; text-transform: uppercase;
    text-shadow: 0 0 15px rgba(255,200,0,0.8);
}

.modal-close {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,50,50,0.2); border: 2px solid #ff3333;
    color: #ff3333; font-size: 20px; font-weight: bold;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-family: inherit; transition: all 0.2s;
}

.modal-close:hover { background: #ff3333; color: #fff; transform: rotate(90deg); }

.form-group { margin-bottom: 20px; }

.form-label {
    display: block; font-size: 12px; letter-spacing: 3px;
    color: #ffcc00; text-transform: uppercase;
    margin-bottom: 10px; font-weight: bold;
}

.form-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
}

.option-btn {
    padding: 12px 16px; font-family: inherit;
    font-size: 13px; font-weight: bold; letter-spacing: 2px;
    text-transform: uppercase; color: #aaa;
    background: rgba(20,20,40,0.6);
    border: 2px solid rgba(100,100,150,0.4);
    border-radius: 10px; cursor: pointer; transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
}

.option-btn .opt-icon { font-size: 20px; margin-bottom: 2px; }
.option-btn:hover { color: #fff; border-color: rgba(255,200,0,0.6); transform: translateY(-2px); }

.option-btn.selected {
    color: #1a1a2e;
    background: linear-gradient(145deg, #ffcc00, #ff9900);
    border-color: #ffcc00;
    box-shadow: 0 0 20px rgba(255,200,0,0.6);
}

.slider-wrap { display: flex; align-items: center; gap: 12px; }

.slider {
    -webkit-appearance: none; appearance: none; flex: 1;
    height: 6px; background: rgba(100,100,150,0.3);
    border-radius: 3px; outline: none; cursor: pointer;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 20px; height: 20px; border-radius: 50%;
    background: #ffcc00; box-shadow: 0 0 12px #ffcc00; cursor: pointer;
}

.slider::-moz-range-thumb {
    width: 20px; height: 20px; border-radius: 50%;
    background: #ffcc00; box-shadow: 0 0 12px #ffcc00;
    cursor: pointer; border: none;
}

.slider-value { min-width: 50px; text-align: right; color: #fff; font-weight: bold; font-size: 14px; }

.toggle-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px dashed rgba(255,200,0,0.15);
}

.toggle-row:last-child { border-bottom: none; }
.toggle-label { font-size: 14px; color: #ddd; letter-spacing: 1px; }
.toggle-label small { display: block; color: #666; font-size: 11px; letter-spacing: 0; margin-top: 2px; }

.toggle-switch {
    position: relative; width: 52px; height: 28px;
    background: rgba(60,60,90,0.6); border-radius: 14px;
    cursor: pointer; transition: 0.3s;
    border: 2px solid rgba(100,100,150,0.4); flex-shrink: 0;
}

.toggle-switch::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 20px; height: 20px; background: #888;
    border-radius: 50%; transition: 0.3s;
}

.toggle-switch.on { background: rgba(255,200,0,0.3); border-color: #ffcc00; }
.toggle-switch.on::after { left: 26px; background: #ffcc00; box-shadow: 0 0 12px #ffcc00; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.stat-card {
    padding: 16px;
    background: linear-gradient(145deg, rgba(30,30,60,0.6), rgba(15,15,35,0.6));
    border: 1px solid rgba(255,200,0,0.3);
    border-radius: 12px; text-align: center;
}

.stat-value {
    font-size: 28px; font-weight: bold; color: #ffcc00;
    text-shadow: 0 0 15px rgba(255,200,0,0.6); margin-bottom: 4px;
}

.stat-label { font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase; }

.stats-actions { display: flex; gap: 10px; margin-top: 20px; }
.stats-actions .menu-btn { flex: 1; font-size: 13px; padding: 12px 16px; }

.credits-content { text-align: center; line-height: 1.9; }

.credits-content h3 {
    color: #ffcc00; font-size: 16px; letter-spacing: 4px;
    margin: 20px 0 8px; text-transform: uppercase;
    text-shadow: 0 0 10px rgba(255,200,0,0.6);
}

.credits-content h3:first-child { margin-top: 0; }
.credits-content p { color: #ccc; font-size: 14px; letter-spacing: 1px; }
.credits-content .heart { color: #ff3366; animation: beat 1s ease-in-out infinite; display: inline-block; }

@keyframes beat { 0%,100%{transform:scale(1);} 50%{transform:scale(1.3);} }

#btnBackToLobby {
    position: fixed; top: 14px; left: 14px; z-index: 30;
    padding: 8px 16px;
    background: rgba(10,10,25,0.9);
    border: 2px solid rgba(255,200,0,0.5);
    border-radius: 10px; color: #ffcc00;
    font-family: inherit; font-size: 13px; font-weight: bold;
    letter-spacing: 2px; cursor: pointer; display: none;
    transition: all 0.2s;
}

#btnBackToLobby:hover { background: #ffcc00; color: #1a1a2e; box-shadow: 0 0 20px #ffcc00; }
#btnBackToLobby.show { display: block; }

#game-container {
    position: fixed; inset: 0; z-index: 5;
    display: none; justify-content: center; align-items: center;
    background: #05050f;
}

#game-container.show { display: flex; }

#gameLoading {
    position: fixed; inset: 0; z-index: 100;
    display: none; justify-content: center; align-items: center;
    flex-direction: column; gap: 20px;
    background: rgba(5,5,15,0.95); color: #ffcc00;
}

#gameLoading.show { display: flex; }

.spinner {
    width: 60px; height: 60px;
    border: 4px solid rgba(255,200,0,0.2);
    border-top-color: #ffcc00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; }

@media (max-width: 500px) {
    .menu { max-width: 90%; }
    .menu-btn { padding: 14px 20px; font-size: 15px; letter-spacing: 2px; }
    .modal { padding: 20px; }
    .modal-title { font-size: 18px; }
    .stats-grid { grid-template-columns: 1fr; }
}

#touch-controls { display:none; position:absolute; left:50%; bottom:12px; transform:translateX(-50%);
    z-index:25; grid-template-columns:repeat(3,48px); grid-template-rows:repeat(2,48px); gap:6px; }
#touch-controls button { border:1px solid rgba(255,204,0,.65); border-radius:10px; color:#ffcc00;
    background:rgba(10,10,25,.85); font-size:22px; }
#touch-controls button:active { background:#ffcc00; color:#15152b; }
@media (max-width: 700px), (pointer: coarse) {
    #touch-controls { display:grid; }
    #game-canvas-container { touch-action: none; }
}
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
