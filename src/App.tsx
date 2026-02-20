import { useEffect } from 'react';
import Scene from './components/Scene';
import MenuScreen from './components/MenuScreen';
import SettingsScreen from './components/SettingsScreen';
import { useGameStore } from './store/gameStore';
import { LEVELS } from './data/levels';
import { translations } from './data/translations';

function App() {
    const { nodes, beams, resetLevel, gameState, setMode, loadLevel, hasWon, hasLost, selectedMaterial, selectMaterial, timeLeft, isTimerRunning, decrementTime } = useGameStore();
    const currentLevel = LEVELS[gameState.levelIndex];
    const t = translations[gameState.language];

    // Initialize level on mount
    useEffect(() => {
        if (nodes.length === 0) {
            loadLevel(0); // Load first level
        }
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                decrementTime();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, decrementTime]);

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

                    {/* UI Overlay - Top Left */}
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        🌉 {t.title}
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 'normal',
                            marginTop: '4px',
                            opacity: 0.75
                        }}>
                            {t.level} {gameState.levelIndex + 1}: {(t as any)[`lvl_${gameState.levelIndex}`] || currentLevel.name}
                        </div>
                    </div>

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
                        backdropFilter: 'blur(4px)'
                    }}>
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
                        gap: '12px'
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

                        {/* Reset Button */}
                        <button
                            onClick={resetLevel}
                            style={{
                                background: 'rgba(239, 68, 68, 0.8)',
                                color: 'white',
                                padding: '8px 24px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                                backdropFilter: 'blur(4px)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                        >
                            🔄 {t.reset_btn}
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
                            padding: '40px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            zIndex: 100 // Ensure modal is on top
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{t.level_complete}</div>
                            <div style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
                                {(t as any)[`lvl_${gameState.levelIndex}`] || currentLevel.name}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={resetLevel}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        border: '2px solid white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 {t.retry}
                                </button>
                                {gameState.levelIndex < LEVELS.length - 1 && (
                                    <button
                                        onClick={() => loadLevel(gameState.levelIndex + 1)}
                                        style={{
                                            background: 'white',
                                            color: '#4CAF50',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
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
                            padding: '40px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            zIndex: 100
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💀</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                                {timeLeft === 0 ? t.times_up : t.bridge_failed}
                            </div>
                            <div style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
                                {timeLeft === 0 ? t.out_of_time : t.vehicle_fell}
                            </div>
                            <button
                                onClick={resetLevel}
                                style={{
                                    background: 'white',
                                    color: '#F44336',
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                🔄 {t.try_again}
                            </button>
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
                        zIndex: 10 // Ensure on top
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

                    {/* Level Selector - Bottom Left */}
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        color: 'white',
                        fontSize: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t.select_level}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {LEVELS.map((level, index) => (
                                <button
                                    key={level.id}
                                    onClick={() => loadLevel(index)}
                                    disabled={gameState.mode === 'simulation'}
                                    style={{
                                        background: gameState.levelIndex === index ? 'rgba(33, 150, 243, 0.8)' : 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: gameState.mode === 'simulation' ? 'not-allowed' : 'pointer',
                                        opacity: gameState.mode === 'simulation' ? 0.5 : 1
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Instructions - Bottom Right */}
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '16px',
                        color: 'white',
                        fontSize: '12px',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)',
                        maxWidth: '300px'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>📋 {t.how_to_play}</div>
                        <div style={{ opacity: 0.9, lineHeight: '1.5' }}>
                            {gameState.mode === 'editor' ? (
                                <>
                                    {t.inst_ed_1}<br />
                                    {t.inst_ed_2}<br />
                                    {t.inst_ed_3}
                                </>
                            ) : (
                                <>
                                    {t.inst_sim_1}<br />
                                    {t.inst_sim_2}<br />
                                    {t.inst_sim_3}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
