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
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                ⚙️ {t.settings}
            </h2>

            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '32px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t.version}</span>
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>1.0.0</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
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
                        marginTop: '24px',
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '18px',
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
