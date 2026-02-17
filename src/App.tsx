import { useEffect } from 'react';
import Scene from './components/Scene';
import { useGameStore } from './store/gameStore';
import { LEVELS } from './data/levels';

function App() {
    const { nodes, beams, resetLevel, gameState, setMode, loadLevel, hasWon, hasLost, selectedMaterial, selectMaterial, timeLeft, isTimerRunning, decrementTime } = useGameStore();
    const currentLevel = LEVELS[gameState.levelIndex];

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
            {/* 3D Scene */}
            <Scene />

            {/* Timer Overlay - Top Center */}
            {gameState.mode === 'simulation' && (
                <div style={{
                    position: 'absolute',
                    top: '80px', // Moved down below buttons
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
                🌉 Bridge Constructor
                <div style={{
                    fontSize: '12px',
                    fontWeight: 'normal',
                    marginTop: '4px',
                    opacity: 0.75
                }}>
                    Level {gameState.levelIndex + 1}: {currentLevel.name}
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
                <div>Nodes: {nodes.length}</div>
                <div>Beams: {beams.length}</div>
                <div>Budget: ${currentLevel.budget}</div>
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
                    {gameState.mode === 'editor' ? '▶️ Play' : '⏸️ Stop'}
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
                    🔄 Reset
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
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>LEVEL COMPLETE!</div>
                    <div style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
                        {currentLevel.name}
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
                            🔄 Retry
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
                                ➡️ Next Level
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
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💀</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {timeLeft === 0 ? "TIME'S UP!" : "BRIDGE FAILED!"}
                    </div>
                    <div style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
                        {timeLeft === 0 ? "You ran out of time" : "The vehicle fell into the water"}
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
                        🔄 Try Again
                    </button>
                </div>
            )}

            {/* Material Selector - Bottom Left (Above Level Selector) */}
            <div style={{
                position: 'absolute',
                bottom: '100px', // Adjusted to be above levels
                left: '16px',
                color: 'white',
                fontSize: '14px',
                background: 'rgba(0,0,0,0.5)',
                padding: '12px 16px',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                gap: '8px',
                flexDirection: 'column'
            }}>
                <div style={{ fontWeight: 'bold' }}>Materials:</div>
                {([
                    { id: 'road', name: '🛣️ Road', color: '#343a40' },
                    { id: 'wood', name: '🪵 Wood', color: '#8B4513' },
                    { id: 'steel', name: '🏗️ Steel', color: '#708090' }
                ] as const).map(mat => (
                    <button
                        key={mat.id}
                        onClick={() => selectMaterial(mat.id)}
                        disabled={gameState.mode === 'simulation'}
                        style={{
                            background: selectedMaterial === mat.id ? mat.color : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            border: selectedMaterial === mat.id ? '2px solid white' : '1px solid transparent',
                            cursor: gameState.mode === 'simulation' ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            opacity: gameState.mode === 'simulation' ? 0.5 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
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
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Select Level:</div>
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
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>📋 How to Play:</div>
                <div style={{ opacity: 0.9, lineHeight: '1.5' }}>
                    {gameState.mode === 'editor' ? (
                        <>
                            • Click node → Drag → Release<br />
                            • Build a bridge<br />
                            • Click ▶️ Play to test
                        </>
                    ) : (
                        <>
                            🚗 Vehicle driving...<br />
                            Watch the stress (color)<br />
                            Red beams may break!
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
