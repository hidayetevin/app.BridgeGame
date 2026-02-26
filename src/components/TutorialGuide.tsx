import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function TutorialGuide() {
    const { gameState, beams } = useGameStore();

    // Sadece 1. seviyede (index 0), oyun ekranındayken, editör modundayken ve henüz HİÇBİR kiriş çizilmemişse görünür.
    const isVisible = gameState.screen === 'game' && gameState.levelIndex === 0 && gameState.mode === 'editor' && beams.length === 0;

    const handRef = useRef<HTMLDivElement>(null);

    // Başlangıç ve bitiş noktaları (1. Seviye için sabit anchor noktaları)
    const startX = -4.5;
    const endX = 4.5;
    const Y = -2;

    useFrame(({ clock }) => {
        if (!isVisible || !handRef.current) return;

        // 0'dan 1'e doğru gidip gelen (ping-pong) bir animasyon süresi
        // 2 saniyede bir turu tamamlar
        const t = (clock.getElapsedTime() % 2) / 2;

        // Easing (yavaş başlayıp hızlanıp yavaşlama)
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Elin X pozisyonunu başlangıçtan bitişe doğru oynat
        const currentX = startX + (endX - startX) * easeT;

        // Elin aşağı yukarı basma hareketi (sadece başlangıç ve bitişte basıyormuş gibi hissettirmek için)
        // t değeri 0 (başlangıç) ve 1 (bitiş) iken el biraz aşağı insin (scale küçülsün)
        const isPressing = t < 0.1 || t > 0.9;
        const scale = isPressing ? 0.8 : 1;

        // CSS Translate kullanarak X eksenindeki hareketi ve scale'i ekliyoruz.
        // Başlangıç x pozisyonu startX'te sabitlendiği için, (currentX - startX) kadar kaydırıyoruz ve piksele oranlıyoruz (x 50px).
        // 3D uzaydan HTML uzayına kaba bir dönüşüm oranı (~50-60px per unit)
        const cssX = (currentX - startX) * 45;
        handRef.current.style.transform = `translate3d(calc(-50% + ${cssX}px), -20%, 0) scale(${scale})`;
    });

    if (!isVisible) return null;

    return (
        <group position={[0, Y, 1]}>
            {/* Arka planda yanıp sönen şeffaf bir kılavuz çizgi/yol */}
            <mesh position={[(startX + endX) / 2, 0, -0.1]}>
                <planeGeometry args={[Math.abs(endX - startX), 0.4]} />
                <meshBasicMaterial color="#4CAF50" transparent opacity={0.3} />
            </mesh>

            <Html
                position={[startX, 0, 0]} // Başlangıç noktası baz alınır
                center
                style={{ pointerEvents: 'none' }} // Tıklamayı engellememesi kritik
            >
                <div
                    ref={handRef}
                    style={{
                        fontSize: '48px',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                        willChange: 'transform',
                        transformOrigin: 'top left',
                        marginTop: '10px' // Düğümün hafif altına hizalamak için
                    }}
                >
                    👆
                </div>
            </Html>

            {/* Animasyon için ekstra bir "Beni Çek" metni */}
            <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
                <style>{`
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.8; }
                        100% { transform: scale(1.05); opacity: 1; }
                    }
                `}</style>
                <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                    animation: 'pulse 1.5s infinite alternate',
                    border: '2px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)'
                }}>
                    Karşıya bağlamak için basılı tutup sürükle!
                </div>
            </Html>
        </group>
    );
}
