import React from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';

const MenuScreen: React.FC = () => {
    const { setScreen, gameState } = useGameStore();
    const t = translations[gameState.language];

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)', // Semi-transparent overlay to see the 3D scene in the background
            backdropFilter: 'blur(8px)',
            color: 'white',
            zIndex: 1000
        }}>
            <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '48px',
                textShadow: '0 4px 16px rgba(0,0,0,0.5)',
                textAlign: 'center'
            }}>
                🌉 {t.title}
            </h1>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                width: '100%',
                maxWidth: '300px'
            }}>
                <button
                    onClick={() => setScreen('game')}
                    style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.background = '#45a049';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = '#4CAF50';
                    }}
                >
                    ▶️ {t.play}
                </button>

                <button
                    onClick={() => setScreen('settings')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    ⚙️ {t.settings}
                </button>
            </div>
        </div>
    );
};

export default MenuScreen;
