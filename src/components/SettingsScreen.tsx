import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import AudioManager from '../utils/AudioManager';

const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
        onClick={() => onChange(!value)}
        style={{
            width: '52px',
            height: '28px',
            borderRadius: '14px',
            background: value ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.25s ease',
            flexShrink: 0,
        }}
    >
        <div style={{
            position: 'absolute',
            top: '3px',
            left: value ? '26px' : '3px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'left 0.25s ease',
        }} />
    </div>
);

const SettingsScreen: React.FC = () => {
    const { setScreen, setLanguage, gameState } = useGameStore();
    const t = translations[gameState.language];
    const isTr = gameState.language === 'tr';

    const [musicOn, setMusicOn] = useState(!AudioManager.isMusicMuted);
    const [sfxOn, setSfxOn] = useState(!AudioManager.isSfxMuted);

    const handleMusicToggle = (value: boolean) => {
        setMusicOn(value);
        AudioManager.setMusicMute(!value);
    };

    const handleSfxToggle = (value: boolean) => {
        setSfxOn(value);
        AudioManager.setSfxMute(!value);
        if (value) AudioManager.playSound('click'); // preview sound
    };

    const settingRow = (label: string, icon: string, value: boolean, onChange: (v: boolean) => void) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <span style={{ fontSize: 'clamp(14px, 3vh, 18px)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{icon}</span>
                {label}
            </span>
            <ToggleSwitch value={value} onChange={onChange} />
        </div>
    );

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
            background: 'rgba(0, 0, 0, 0.85)',
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
                background: 'rgba(255, 255, 255, 0.08)',
                padding: 'max(16px, 3vh) clamp(24px, 5vw, 40px)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5vh',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
            }}>

                {/* Dil */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(14px, 3vh, 18px)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🌐</span>
                        {t.language}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['tr', 'en'] as const).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                style={{
                                    background: gameState.language === lang
                                        ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
                                        : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '8px 18px',
                                    borderRadius: '10px',
                                    border: gameState.language === lang
                                        ? '1.5px solid rgba(255,255,255,0.4)'
                                        : '1.5px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Müzik */}
                {settingRow(
                    isTr ? 'Arka Plan Müziği' : 'Background Music',
                    '🎵',
                    musicOn,
                    handleMusicToggle
                )}

                {/* Ses Efektleri */}
                {settingRow(
                    isTr ? 'Ses Efektleri' : 'Sound Effects',
                    '🔊',
                    sfxOn,
                    handleSfxToggle
                )}

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Versiyon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                    <span style={{ fontSize: '14px' }}>{t.version}</span>
                    <span style={{ fontSize: '14px' }}>1.0.0</span>
                </div>

                {/* Geri Butonu */}
                <button
                    onClick={() => setScreen('menu')}
                    style={{
                        marginTop: '1vh',
                        background: 'rgba(239, 68, 68, 0.7)',
                        color: 'white',
                        padding: 'max(10px, 1.8vh) 24px',
                        borderRadius: '12px',
                        fontSize: 'clamp(14px, 3.5vh, 18px)',
                        fontWeight: 'bold',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.7)'}
                >
                    🔙 {t.back}
                </button>
            </div>
        </div>
    );
};

export default SettingsScreen;
