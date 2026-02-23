import { useEffect, useState } from 'react';
import Scene from './components/Scene';
import MenuScreen from './components/MenuScreen';
import SettingsScreen from './components/SettingsScreen';
import { useGameStore } from './store/gameStore';
import { LEVELS } from './data/levels';
import { translations } from './data/translations';
import { AdManager } from './utils/AdManager';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function App() {
    const { setScreen, nodes, beams, resetLevel, gameState, setMode, loadLevel, hasWon, hasLost, selectedMaterial, selectMaterial, timeLeft, isTimerRunning, decrementTime, undo, history, addBudget, clearBudgetExceeded, doubleStars } = useGameStore();
    const currentLevel = LEVELS[gameState.levelIndex];
    const t = translations[gameState.language];
    const [isPaused, setIsPaused] = useState(false);
    const [showWinActions, setShowWinActions] = useState(false);
    const [doubleUsed, setDoubleUsed] = useState(false);

    // Calculate current stars
    const percentSpent = (gameState.spent / currentLevel.budget) * 100;
    let currentStars = 3;
    if (percentSpent > 75) currentStars = 1;
    else if (percentSpent > 40) currentStars = 2;

    // Initialize level on mount
    useEffect(() => {
        if (nodes.length === 0) {
            loadLevel(useGameStore.getState().gameState.levelIndex); // Load current/saved level
        }

        // Initialize and show AdMob Banner if on Native platform
        const initNative = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    await StatusBar.hide();
                } catch (e) {
                    console.log('StatusBar hide error', e);
                }
            }
            await AdManager.init();
            await AdManager.showBanner();
            await AdManager.prepareInterstitial(); // preload for later
        };
        initNative();
    }, []);

    // Double-star countdown when win modal appears
    useEffect(() => {
        if (hasWon) {
            setShowWinActions(false);
            setDoubleUsed(false);
            const timer = setTimeout(() => setShowWinActions(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [hasWon]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                decrementTime();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, decrementTime, isPaused]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* 3D Scene always in Background */}
            <Scene />

            {/* Fullscreen Overlays */}
            {gameState.screen === 'menu' && <MenuScreen />}
            {gameState.screen === 'settings' && <SettingsScreen />}

            {/* In-Game UI */}
            {gameState.screen === 'game' && (
                <>

                    {/* Timer Overlay - Top Center */}
                    {gameState.mode === 'simulation' && (
                        <div style={{
                            position: 'absolute',
                            top: '120px', // Moved down below buttons and materials
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: timeLeft <= 5 ? '#f44336' : 'white', // Red if low time
                            fontWeight: 'bold',
                            fontSize: '24px',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '8px 24px',
                            borderRadius: '8px',
                            backdropFilter: 'blur(4px)',
                            border: timeLeft <= 5 ? '2px solid #f44336' : 'none',
                            transition: 'all 0.3s'
                        }}>
                            ⏱️ {timeLeft}s
                        </div>
                    )}

                    {/* Pause Button - Top Left */}
                    <button
                        onClick={() => setIsPaused(true)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            backdropFilter: 'blur(4px)',
                            transition: 'background 0.2s',
                            zIndex: 90
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                    >
                        ⏸️
                    </button>

                    {/* Stats Overlay - Top Right */}
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: 'white',
                        fontSize: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        zIndex: 50,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '20px', letterSpacing: '4px', textAlign: 'center', marginBottom: '4px' }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <span key={i} style={{ opacity: i < currentStars ? 1 : 0.3, filter: i < currentStars ? 'none' : 'grayscale(1)' }}>⭐</span>
                            ))}
                        </div>
                        <div>{t.nodes}: {nodes.length}</div>
                        <div>{t.beams}: {beams.length}</div>
                        <div>{t.budget}: ${(currentLevel.budget - gameState.spent).toFixed(2)}</div>
                    </div>

                    {/* Control Buttons */}
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '12px',
                        zIndex: 100,
                        pointerEvents: 'auto'
                    }}>
                        {/* Play/Stop Button */}
                        <button
                            onClick={() => setMode(gameState.mode === 'editor' ? 'simulation' : 'editor')}
                            disabled={hasWon || hasLost}
                            style={{
                                background: gameState.mode === 'editor' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 152, 0, 0.8)',
                                color: 'white',
                                padding: '8px 24px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: (hasWon || hasLost) ? 'not-allowed' : 'pointer',
                                backdropFilter: 'blur(4px)',
                                transition: 'background 0.2s',
                                opacity: (hasWon || hasLost) ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!hasWon && !hasLost) {
                                    e.currentTarget.style.background = gameState.mode === 'editor'
                                        ? 'rgba(56, 142, 60, 0.9)'
                                        : 'rgba(245, 124, 0, 0.9)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = gameState.mode === 'editor'
                                    ? 'rgba(76, 175, 80, 0.8)'
                                    : 'rgba(255, 152, 0, 0.8)';
                            }}
                        >
                            {gameState.mode === 'editor' ? `▶️ ${t.play_btn}` : `⏸️ ${t.stop_btn}`}
                        </button>

                        {/* Undo Button */}
                        <button
                            onClick={undo}
                            disabled={gameState.mode !== 'editor' || history.length === 0}
                            style={{
                                background: 'rgba(33, 150, 243, 0.8)',
                                color: 'white',
                                padding: '8px 24px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: (gameState.mode !== 'editor' || history.length === 0) ? 'not-allowed' : 'pointer',
                                backdropFilter: 'blur(4px)',
                                transition: 'background 0.2s',
                                opacity: (gameState.mode !== 'editor' || history.length === 0) ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (gameState.mode === 'editor' && history.length > 0) {
                                    e.currentTarget.style.background = 'rgba(30, 136, 229, 0.9)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(33, 150, 243, 0.8)';
                            }}
                        >
                            ↩️ {t.undo}
                        </button>
                    </div>

                    {/* Win Modal */}
                    {hasWon && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(76, 175, 80, 0.95)',
                            padding: 'clamp(20px, 4vh, 40px)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            zIndex: 100,
                            minWidth: 'clamp(240px, 50vw, 380px)',
                        }}>
                            <div style={{ fontSize: 'clamp(48px, 10vh, 64px)', marginBottom: 'max(8px, 2vh)' }}>🎉</div>

                            {/* Stars display */}
                            <div style={{ fontSize: 'clamp(24px, 5vh, 32px)', letterSpacing: '8px', marginBottom: 'max(8px, 2vh)' }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            opacity: i < (doubleUsed ? Math.min(currentStars * 2, 3) : currentStars) ? 1 : 0.3,
                                            filter: i < (doubleUsed ? Math.min(currentStars * 2, 3) : currentStars) ? 'none' : 'grayscale(1)',
                                            transition: 'opacity 0.4s, filter 0.4s',
                                        }}
                                    >⭐</span>
                                ))}
                            </div>

                            <div style={{ fontSize: 'clamp(20px, 4vh, 32px)', fontWeight: 'bold', marginBottom: 'max(4px, 1vh)' }}>{t.level_complete}</div>
                            <div style={{ fontSize: 'clamp(14px, 3vh, 18px)', marginBottom: 'max(16px, 3vh)', opacity: 0.9 }}>
                                {(t as any)[`lvl_${gameState.levelIndex}`] || currentLevel.name}
                            </div>

                            {/* 2x Button — shown first, hides after use or when other buttons appear */}
                            {!doubleUsed && (
                                <div style={{
                                    marginBottom: showWinActions ? 'max(12px, 2vh)' : '0',
                                    transition: 'margin 0.3s',
                                }}>
                                    <button
                                        onClick={async () => {
                                            const success = await AdManager.showRewarded();
                                            if (success) {
                                                AdManager.markRewardedWatched(); // skip next interstitial
                                                doubleStars();
                                                setDoubleUsed(true);
                                                setShowWinActions(true);
                                            }
                                            // If !success: dismissed early — do nothing, stay on modal
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                                            color: '#1a1a1a',
                                            padding: 'clamp(10px, 2vh, 16px) clamp(24px, 5vw, 40px)',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            fontSize: 'clamp(16px, 3.5vh, 22px)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 16px rgba(255,165,0,0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: '0 auto',
                                            animation: 'pulse-btn 1.5s ease-in-out infinite',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.3em' }}>📺</span>
                                        ⭐ x2 {gameState.language === 'tr' ? 'Kazan' : 'Earn'}
                                    </button>
                                </div>
                            )}

                            {/* Retry / Next Level — appear after 2 sec */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                opacity: showWinActions ? 1 : 0,
                                transform: showWinActions ? 'translateY(0)' : 'translateY(8px)',
                                transition: 'opacity 0.4s, transform 0.4s',
                                pointerEvents: showWinActions ? 'auto' : 'none',
                            }}>
                                <button
                                    onClick={async () => {
                                        await AdManager.showInterstitial();
                                        resetLevel();
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: 'clamp(8px, 1.5vh, 12px) clamp(16px, 3.5vh, 24px)',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: 'clamp(14px, 3vh, 18px)',
                                        border: '2px solid white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 {t.retry}
                                </button>
                                {gameState.levelIndex < LEVELS.length - 1 && (
                                    <button
                                        onClick={async () => {
                                            await AdManager.showInterstitial();
                                            loadLevel(gameState.levelIndex + 1);
                                        }}
                                        style={{
                                            background: 'white',
                                            color: '#4CAF50',
                                            padding: 'clamp(8px, 1.5vh, 12px) clamp(16px, 3.5vh, 24px)',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            fontSize: 'clamp(14px, 3vh, 18px)',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ➡️ {t.next_level}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loss Modal */}
                    {hasLost && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(244, 67, 54, 0.95)',
                            padding: 'clamp(20px, 4vh, 40px)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            zIndex: 100
                        }}>
                            <div style={{ fontSize: 'clamp(48px, 10vh, 64px)', marginBottom: 'max(8px, 2vh)' }}>💀</div>
                            <div style={{ fontSize: 'clamp(20px, 4vh, 32px)', fontWeight: 'bold', marginBottom: 'max(4px, 1vh)' }}>
                                {timeLeft === 0 ? t.times_up : t.bridge_failed}
                            </div>
                            <div style={{ fontSize: 'clamp(14px, 3vh, 18px)', marginBottom: 'max(16px, 3vh)', opacity: 0.9 }}>
                                {timeLeft === 0 ? t.out_of_time : t.vehicle_fell}
                            </div>
                            <button
                                onClick={async () => {
                                    await AdManager.showInterstitial();
                                    resetLevel();
                                }}
                                style={{
                                    background: 'white',
                                    color: '#F44336',
                                    padding: 'clamp(8px, 1.5vh, 12px) clamp(16px, 3.5vh, 32px)',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: 'clamp(14px, 3vh, 18px)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                🔄 {t.try_again}
                            </button>
                        </div>
                    )}

                    {/* Budget Modal */}
                    {gameState.budgetExceeded && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(56, 189, 248, 0.95)', // Blue theme
                            padding: 'clamp(20px, 4vh, 40px)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            zIndex: 110
                        }}>
                            <div style={{ fontSize: 'clamp(48px, 10vh, 64px)', marginBottom: 'max(8px, 2vh)' }}>💰</div>
                            <div style={{ fontSize: 'clamp(20px, 4vh, 32px)', fontWeight: 'bold', marginBottom: 'max(4px, 1vh)' }}>
                                {t.out_of_budget}
                            </div>
                            <div style={{ fontSize: 'clamp(14px, 3vh, 18px)', marginBottom: 'max(16px, 3vh)', opacity: 0.9 }}>
                                ${gameState.spent.toFixed(2)} / ${gameState.budget.toFixed(2)}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={async () => {
                                        const success = await AdManager.showRewarded();
                                        if (success) {
                                            AdManager.markRewardedWatched(); // skip next interstitial
                                            addBudget(50);
                                            clearBudgetExceeded();
                                        }
                                        // If !success: dismissed early — modal stays open, user can try again or cancel
                                    }}
                                    style={{
                                        background: 'white',
                                        color: '#0284c7',
                                        padding: 'clamp(8px, 1.5vh, 12px) clamp(16px, 3.5vh, 24px)',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: 'clamp(14px, 3vh, 18px)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📺 {t.watch_ad_50}
                                </button>
                                <button
                                    onClick={() => clearBudgetExceeded()}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: 'clamp(8px, 1.5vh, 12px) clamp(16px, 3.5vh, 24px)',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        fontSize: 'clamp(14px, 3vh, 18px)',
                                        border: '2px solid white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✖️ {t.cancel}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Material Selector - Top Center (Below Play/Reset) */}
                    <div style={{
                        position: 'absolute',
                        top: '64px', // Below play buttons (16px + ~40px height + gap)
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontSize: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        gap: '8px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        zIndex: 50 // Ensure on top
                    }}>
                        {/* <div style={{ fontWeight: 'bold', marginRight: '4px' }}>Mat:</div> */}
                        {([
                            { id: 'road', name: `🛣️ ${t.mat_road}`, color: '#343a40' },
                            { id: 'wood', name: `🪵 ${t.mat_wood}`, color: '#8B4513' },
                            { id: 'steel', name: `🏗️ ${t.mat_steel}`, color: '#708090' }
                        ] as const).map(mat => (
                            <button
                                key={mat.id}
                                onClick={() => selectMaterial(mat.id)}
                                disabled={gameState.mode === 'simulation'}
                                style={{
                                    background: selectedMaterial === mat.id ? mat.color : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    border: selectedMaterial === mat.id ? '2px solid white' : '1px solid transparent',
                                    cursor: gameState.mode === 'simulation' ? 'not-allowed' : 'pointer',
                                    textAlign: 'center',
                                    opacity: gameState.mode === 'simulation' ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px'
                                }}
                            >
                                <span>{mat.name}</span>
                            </button>
                        ))}
                    </div>



                    {/* Pause Modal */}
                    {isPaused && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            zIndex: 1000
                        }}>
                            <h2 style={{ fontSize: '36px', marginBottom: '32px', fontWeight: 'bold' }}>{t.pause}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '250px' }}>
                                <button
                                    onClick={() => setIsPaused(false)}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ▶️ {t.resume}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPaused(false);
                                        resetLevel();
                                    }}
                                    style={{
                                        background: '#2196F3',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🔄 {t.restart}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPaused(false);
                                        setScreen('menu');
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        border: '2px solid rgba(255, 255, 255, 0.4)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🏠 {t.main_menu}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
