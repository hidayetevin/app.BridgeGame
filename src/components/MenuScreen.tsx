import React from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../data/translations';
import { LEVELS } from '../data/levels';

const MenuScreen: React.FC = () => {
    const { setScreen, gameState } = useGameStore();
    const t = translations[gameState.language];
    const currentLevel = LEVELS[gameState.levelIndex];
    const totalStars = gameState.totalStarsEarned || 0;
    const levelStars = gameState.levelStars[gameState.levelIndex] || 0;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            display: 'flex',
            flexDirection: 'row',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2027 100%)',
            color: 'white',
            zIndex: 1000,
            overflow: 'hidden',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>

            {/* ── Animated background stars ── */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {[...Array(18)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: `${2 + (i % 3)}px`,
                        height: `${2 + (i % 3)}px`,
                        background: 'white',
                        borderRadius: '50%',
                        opacity: 0.15 + (i % 5) * 0.08,
                        left: `${(i * 37 + 11) % 100}%`,
                        top: `${(i * 53 + 7) % 100}%`,
                        animation: `twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite alternate`,
                    }} />
                ))}
            </div>

            {/* ── Left Panel: Branding ── */}
            <div style={{
                flex: '0 0 45%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3vh 4vw',
                position: 'relative',
                zIndex: 1,
                borderRight: '1px solid rgba(255,255,255,0.07)',
            }}>
                {/* App Icon + Title */}
                <div style={{ textAlign: 'center', marginBottom: '3vh' }}>
                    <div style={{
                        width: 'clamp(72px, 18vh, 96px)',
                        height: 'clamp(72px, 18vh, 96px)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        margin: '0 auto 16px',
                        boxShadow: '0 0 40px rgba(56, 189, 248, 0.4), 0 8px 32px rgba(0,0,0,0.5)',
                        border: '2px solid rgba(56,189,248,0.3)',
                    }}>
                        <img src="/images/app_icon.png" alt="icon"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(22px, 5vh, 38px)',
                        fontWeight: 900,
                        margin: 0,
                        background: 'linear-gradient(120deg, #38bdf8, #a78bfa, #38bdf8)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'shimmer 3s linear infinite',
                        letterSpacing: '-0.5px',
                        lineHeight: 1.1,
                        textAlign: 'center',
                    }}>
                        {t.title}
                    </h1>

                    <p style={{
                        margin: '8px 0 0',
                        fontSize: 'clamp(11px, 2vh, 14px)',
                        color: 'rgba(148, 163, 184, 0.9)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}>
                        Build · Solve · Cross
                    </p>
                </div>

                {/* Stars total */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '14px',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'clamp(14px, 3vh, 18px)',
                    fontWeight: 700,
                }}>
                    <span style={{ fontSize: '1.4em' }}>⭐</span>
                    <span style={{ color: '#fbbf24' }}>{totalStars}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85em' }}>
                        {t.total_stars || 'toplam yıldız'}
                    </span>
                </div>

                {/* Bridge decoration */}
                <div style={{
                    marginTop: '3vh',
                    fontSize: 'clamp(28px, 7vh, 44px)',
                    filter: 'drop-shadow(0 4px 16px rgba(56,189,248,0.4))',
                    animation: 'float 3s ease-in-out infinite',
                }}>
                    🌉
                </div>
            </div>

            {/* ── Right Panel: Actions ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'stretch',
                padding: '3vh 4vw',
                gap: '1.8vh',
                zIndex: 1,
            }}>

                {/* Current Level Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(167,139,250,0.08))',
                    border: '1px solid rgba(56,189,248,0.25)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(8px)',
                    marginBottom: '0.5vh',
                }}>
                    <div style={{ fontSize: 'clamp(11px, 1.8vh, 13px)', color: 'rgba(148,163,184,0.8)', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Aktif Seviye
                    </div>
                    <div style={{ fontSize: 'clamp(14px, 2.8vh, 18px)', fontWeight: 700, color: '#38bdf8' }}>
                        #{gameState.levelIndex + 1} — {(t as any)[`lvl_${gameState.levelIndex}`] || currentLevel.name}
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{
                                fontSize: 'clamp(14px, 2.5vh, 18px)',
                                opacity: i < levelStars ? 1 : 0.2,
                                filter: i < levelStars ? 'drop-shadow(0 0 4px #fbbf24)' : 'grayscale(1)',
                            }}>⭐</span>
                        ))}
                    </div>
                </div>

                {/* PLAY Button */}
                <button
                    onClick={() => setScreen('game')}
                    style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        padding: 'clamp(12px, 3vh, 18px) 24px',
                        borderRadius: '14px',
                        fontSize: 'clamp(16px, 3.5vh, 22px)',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 24px rgba(34,197,94,0.5), 0 4px 16px rgba(0,0,0,0.3)',
                        letterSpacing: '0.5px',
                        animation: 'pulse-green 2s ease-in-out infinite',
                        transition: 'transform 0.15s, filter 0.15s',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                    onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    ▶ {t.play}
                </button>

                {/* Shop Button */}
                <button
                    onClick={() => setScreen('shop' as any)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.1))',
                        color: '#fbbf24',
                        padding: 'clamp(10px, 2.5vh, 16px) 24px',
                        borderRadius: '14px',
                        fontSize: 'clamp(14px, 3vh, 20px)',
                        fontWeight: 700,
                        border: '1.5px solid rgba(251,191,36,0.35)',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'transform 0.15s, background 0.2s',
                    }}
                    onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    🏪 {gameState.language === 'tr' ? 'Araç Marketi' : 'Car Shop'}
                </button>

                {/* Settings Button */}
                <button
                    onClick={() => setScreen('settings')}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.7)',
                        padding: 'clamp(8px, 2vh, 14px) 24px',
                        borderRadius: '14px',
                        fontSize: 'clamp(13px, 2.5vh, 18px)',
                        fontWeight: 600,
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'transform 0.15s, background 0.2s',
                    }}
                    onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    ⚙️ {t.settings}
                </button>
            </div>

            {/* ── CSS Animations ── */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes twinkle {
                    from { opacity: 0.05; transform: scale(0.8); }
                    to   { opacity: 0.35; transform: scale(1.2); }
                }
                @keyframes pulse-green {
                    0%, 100% { box-shadow: 0 0 24px rgba(34,197,94,0.5), 0 4px 16px rgba(0,0,0,0.3); }
                    50%       { box-shadow: 0 0 40px rgba(34,197,94,0.75), 0 4px 16px rgba(0,0,0,0.3); }
                }
            `}</style>
        </div>
    );
};

export default MenuScreen;
