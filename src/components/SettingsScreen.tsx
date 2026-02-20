import React from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';

const SettingsScreen: React.FC = () => {
    const { setScreen, setLanguage, gameState } = useGameStore();
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
            background: 'rgba(0, 0, 0, 0.85)', // Darker background for settings
            backdropFilter: 'blur(10px)',
            color: 'white',
            zIndex: 1000
        }}>
            <h2 style={{
                fontSize: 'clamp(24px, 6vh, 48px)',
                fontWeight: 'bold',
                marginBottom: '4vh',
                textAlign: 'center'
            }}>
                ⚙️ {t.settings}
            </h2>

            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: 'max(16px, 3vh) 32px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2vh',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(14px, 3vh, 18px)', fontWeight: 'bold' }}>{t.version}</span>
                    <span style={{ fontSize: 'clamp(12px, 2.5vh, 16px)', opacity: 0.8 }}>1.0.0</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1vh' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t.language}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setLanguage('tr')}
                            style={{
                                background: gameState.language === 'tr' ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: gameState.language === 'tr' ? '2px solid white' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            TR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                background: gameState.language === 'en' ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: gameState.language === 'en' ? '2px solid white' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            EN
                        </button>
                    </div>
                </div>

                {/* You can add more settings here like Volume, Graphics Quality etc. */}

                <button
                    onClick={() => setScreen('menu')}
                    style={{
                        marginTop: '2vh',
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: 'white',
                        padding: 'max(8px, 1.5vh) 24px',
                        borderRadius: '8px',
                        fontSize: 'clamp(14px, 3.5vh, 18px)',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                >
                    🔙 {t.back}
                </button>
            </div>
        </div>
    );
};

export default SettingsScreen;
