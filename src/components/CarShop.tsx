import { useState, Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { CARS, CarData } from '../data/cars';
import { AdManager } from '../utils/AdManager';
import AudioManager from '../utils/AudioManager';

// ─── 3D preview of a single car ───────────────────────────────────────────────
function CarPreview3D({ car }: { car: CarData }) {
    const { scene } = useGLTF(car.glbPath);
    const cloned = useMemo(() => scene.clone(true), [scene, car.id]);
    return (
        <primitive
            object={cloned}
            scale={car.previewScale}
            rotation={[0.2, car.previewRotY, 0]}
            position={[0, -0.5, 0]}
        />
    );
}

// ─── CarShop screen ───────────────────────────────────────────────────────────
export default function CarShop() {
    const { gameState, setScreen, buyCar, equipCar } = useGameStore() as any;
    const isTr = gameState.language === 'tr';

    // Hide banner while in shop, restore on exit
    useEffect(() => {
        AdManager.hideBanner();
        return () => { AdManager.showBanner(); };
    }, []);

    const [selectedId, setSelectedId] = useState<string>(
        gameState.equippedCar || 'sedan-sports'
    );
    const [feedback, setFeedback] = useState<string | null>(null);

    const selected = CARS.find(c => c.id === selectedId) || CARS[0];

    // Preload the selected car's GLB when selection changes
    // so it's cached before the 3D canvas tries to render it
    useEffect(() => {
        useGLTF.preload(selected.glbPath);
    }, [selected.glbPath]);
    const stars = gameState.totalStarsEarned || 0;
    const owned: string[] = gameState.ownedCars || ['sedan-sports'];
    const equipped: string = gameState.equippedCar || 'sedan-sports';

    const isOwned = owned.includes(selected.id);
    const isEquipped = equipped === selected.id;
    const canAfford = stars >= selected.price;

    const showFeedback = (msg: string) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(null), 2000);
    };

    const handleBuy = () => {
        const ok = buyCar(selected.id, selected.price);
        if (ok) {
            AudioManager.playSound('money');
            showFeedback(isTr ? '✅ Satın alındı ve giydirildi!' : '✅ Purchased & equipped!');
        } else {
            showFeedback(isTr ? '❌ Yeterli yıldız yok!' : '❌ Not enough stars!');
        }
    };

    const handleEquip = () => {
        equipCar(selected.id);
        AudioManager.playSound('click');
        showFeedback(isTr ? '✅ Araç giydirildi!' : '✅ Vehicle equipped!');
    };

    // Category filter
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const categories = [
        { id: 'all', label: isTr ? 'Tümü' : 'All', icon: '🚗' },
        { id: 'car', label: isTr ? 'Arabalar' : 'Cars', icon: '🚗' },
        { id: 'truck', label: isTr ? 'Kamyonlar' : 'Trucks', icon: '🚛' },
        { id: 'special', label: isTr ? 'Özel' : 'Special', icon: '🚓' },
        { id: 'kart', label: isTr ? 'Kartlar' : 'Karts', icon: '🏎️' },
    ];
    const filteredCars = activeCategory === 'all'
        ? CARS
        : CARS.filter(c => c.category === activeCategory);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f2340 100%)',
            display: 'flex', flexDirection: 'column',
            color: 'white', fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
            zIndex: 1000,
        }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                flexShrink: 0,
            }}>
                <button
                    onClick={() => {
                        AudioManager.playSound('click');
                        setScreen('menu');
                    }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                >
                    <span style={{ fontSize: '18px' }}>←</span> {isTr ? 'Geri' : 'Back'}
                </button>
                <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    🏪 {isTr ? 'Araç Marketi' : 'Vehicle Market'}
                </div>
                <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontWeight: 800,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)'
                }}>
                    <span style={{ fontSize: '18px' }}>⭐</span> {stars}
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── Left: 3D Preview + Info ── */}
                <div style={{
                    width: '38%', display: 'flex', flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0,
                }}>
                    {/* 3D Canvas */}
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Canvas
                            camera={{ position: [4, 2.5, 4], fov: 35 }}
                            style={{ background: 'transparent' }}
                            gl={{ powerPreference: 'default', antialias: false }}
                            dpr={1}
                        >
                            {/* Warm multi-directional lighting replaces heavy Environment HDR */}
                            <ambientLight intensity={0.9} />
                            <directionalLight position={[5, 8, 5]} intensity={1.4} />
                            <directionalLight position={[-4, 3, -4]} intensity={0.5} color="#b0c8ff" />
                            <hemisphereLight intensity={0.6} groundColor="#334155" />
                            <Suspense fallback={null}>
                                <CarPreview3D car={selected} />
                            </Suspense>
                            <OrbitControls
                                enablePan={false}
                                enableZoom={false}
                                autoRotate
                                autoRotateSpeed={3}
                                minPolarAngle={Math.PI / 4}
                                maxPolarAngle={Math.PI / 2.2}
                            />
                        </Canvas>
                    </div>

                    {/* Car info + action */}
                    <div style={{
                        padding: '24px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {selected.emoji} {isTr ? selected.name : selected.nameEn}
                        </div>

                        {isEquipped && (
                            <div style={{
                                display: 'inline-block',
                                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                                padding: '3px 10px', borderRadius: '12px',
                                fontSize: '12px', fontWeight: 'bold', marginBottom: '10px',
                            }}>
                                ✓ {isTr ? 'Kullanımda' : 'Equipped'}
                            </div>
                        )}

                        {feedback && (
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '8px 12px', borderRadius: '8px',
                                fontSize: '13px', marginBottom: '10px',
                                animation: 'fadein-badge 0.3s ease',
                            }}>
                                {feedback}
                            </div>
                        )}

                        {isOwned ? (
                            !isEquipped && (
                                <button
                                    onClick={handleEquip}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        border: 'none', color: 'white',
                                        padding: '14px', borderRadius: '14px',
                                        fontWeight: 800, fontSize: '16px', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    🚗 {isTr ? 'Seç' : 'Equip'}
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleBuy}
                                disabled={!canAfford}
                                style={{
                                    width: '100%',
                                    background: canAfford
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: canAfford ? '#1a1a1a' : 'rgba(255, 255, 255, 0.3)',
                                    padding: '14px', borderRadius: '14px',
                                    fontWeight: 800, fontSize: '16px',
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                    boxShadow: canAfford ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => canAfford && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={e => canAfford && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {canAfford
                                    ? `⭐ ${selected.price} — ${isTr ? 'Satın Al' : 'Buy'}`
                                    : `⭐ ${selected.price} ${isTr ? '(Yetersiz)' : '(Need more stars)'}`}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Right: Category filter + Car Grid ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Category tabs */}
                    <div style={{
                        display: 'flex', gap: '6px', padding: '10px 12px',
                        flexShrink: 0, overflowX: 'auto',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    background: activeCategory === cat.id
                                        ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
                                        : 'rgba(255,255,255,0.07)',
                                    border: 'none', color: 'white',
                                    padding: '6px 12px', borderRadius: '20px',
                                    fontSize: '12px', fontWeight: 'bold',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                }}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Car grid */}
                    <div style={{
                        flex: 1, overflowY: 'auto',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '8px',
                        alignContent: 'start',
                    }}>
                        {filteredCars.map(car => {
                            const isOwnedCar = owned.includes(car.id);
                            const isEquippedCar = equipped === car.id;
                            const isSelected = selectedId === car.id;

                            return (
                                <div
                                    key={car.id}
                                    onClick={() => setSelectedId(car.id)}
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(29,78,216,0.3))'
                                            : 'rgba(255,255,255,0.06)',
                                        border: isSelected
                                            ? '2px solid #3b82f6'
                                            : isEquippedCar
                                                ? '2px solid #22c55e'
                                                : '2px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        padding: '10px 6px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        position: 'relative',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {/* Owned / locked badge */}
                                    {isEquippedCar && (
                                        <div style={{
                                            position: 'absolute', top: '4px', right: '4px',
                                            background: '#22c55e', borderRadius: '50%',
                                            width: '16px', height: '16px',
                                            fontSize: '10px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>✓</div>
                                    )}
                                    {!isOwnedCar && !isEquippedCar && (
                                        <div style={{
                                            position: 'absolute', top: '4px', right: '4px',
                                            fontSize: '11px', opacity: 0.7,
                                        }}>🔒</div>
                                    )}

                                    {/* Big emoji icon */}
                                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                                        {car.emoji}
                                    </div>

                                    {/* Name */}
                                    <div style={{
                                        fontSize: '10px', fontWeight: 'bold',
                                        lineHeight: 1.2, marginBottom: '4px',
                                        opacity: 0.9,
                                    }}>
                                        {isTr ? car.name : car.nameEn}
                                    </div>

                                    {/* Price or owned */}
                                    <div style={{
                                        fontSize: '11px',
                                        color: isOwnedCar ? '#86efac' : '#fcd34d',
                                        fontWeight: 'bold',
                                    }}>
                                        {isOwnedCar
                                            ? (isTr ? '✓ Sahip' : '✓ Owned')
                                            : car.price === 0
                                                ? (isTr ? 'Ücretsiz' : 'Free')
                                                : `⭐ ${car.price}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
