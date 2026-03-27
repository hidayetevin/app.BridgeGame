import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

interface BackgroundSceneProps {
    waterLevel: number;
}

/** Gradient sky plane using vertexColors so no shader needed */
function Sky({ waterLevel }: { waterLevel: number }) {
    const { viewport } = useThree();
    const W = viewport.width * 3;
    const H = viewport.height * 4;

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(W, H, 1, 4);

        // Renk gradyanı: En üst → koyu mavi, orta → açık mavi, alt → su rengi
        const colors: number[] = [];
        const positions = geo.attributes.position.array;
        const skyTop = new THREE.Color('#0a1628');  // Gece/şafak mavi
        const skyMid = new THREE.Color('#1a6fa8');  // Açık gök
        const skyHor = new THREE.Color('#5bb8f5');  // Ufuk - açık
        const waterCol = new THREE.Color('#1565a8');  // Su rengi

        for (let i = 0; i < positions.length / 3; i++) {
            const y = positions[i * 3 + 1]; // local Y (-H/2 .. +H/2)
            const t = (y + H / 2) / H;     // 0=alt, 1=üst

            let color: THREE.Color;
            if (t > 0.75) color = skyTop.clone().lerp(skyMid, (t - 0.75) / 0.25);
            else if (t > 0.5) color = skyMid.clone().lerp(skyHor, (t - 0.5) / 0.25);
            else color = skyHor.clone().lerp(waterCol, 1 - t / 0.5);

            colors.push(color.r, color.g, color.b);
        }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return geo;
    }, [W, H]);

    // Kameranın Y merkezi — arka plan ufuk noktasını waterLevel +  viewport yüksekliğinin ortasına koyduk
    const centerY = waterLevel + viewport.height * 0.5;

    return (
        <mesh geometry={geometry} position={[0, centerY, -30]} renderOrder={-10}>
            <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
    );
}

/** Su düzlemi — tam waterLevel'e oturur, sonsuz geniş */
function Water({ waterLevel }: { waterLevel: number }) {
    const { viewport } = useThree();
    const W = viewport.width * 4;
    const H = Math.abs(waterLevel) * 2 + 20; // Su derinliği

    return (
        <mesh position={[0, waterLevel - H / 2, -28]} renderOrder={-9}>
            <planeGeometry args={[W, H]} />
            <meshBasicMaterial color="#0d47a1" />
        </mesh>
    );
}

/** Basit bulut — birkaç beyaz elips grubundan oluşuyor */
function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
    return (
        <group position={[x, y, -27]}>
            {[
                [0, 0, 1.2, 0.6],
                [0.8, 0.1, 1.0, 0.5],
                [-0.7, 0.05, 0.9, 0.5],
                [0, 0.3, 0.8, 0.4],
            ].map(([cx, cy, rx, ry], i) => (
                <mesh key={i} position={[cx * scale, cy * scale, 0]}>
                    <circleGeometry args={[rx * scale, 12]} />
                    <meshBasicMaterial
                        color="white"
                        transparent
                        opacity={0.72}
                    />
                    {/* Elips için scale hack */}
                    <mesh scale={[1, ry / rx, 1]} position={[0, 0, 0.01]}>
                        <circleGeometry args={[rx * scale, 12]} />
                        <meshBasicMaterial color="white" transparent opacity={0} />
                    </mesh>
                </mesh>
            ))}
        </group>
    );
}

/** Ufuk çizgisi — perspektif hissi için ince bir parlaklık bandı */
function Horizon({ waterLevel }: { waterLevel: number }) {
    const { viewport } = useThree();
    return (
        <mesh position={[0, waterLevel + 0.15, -26.5]}>
            <planeGeometry args={[viewport.width * 4, 0.3]} />
            <meshBasicMaterial color="#90caf9" transparent opacity={0.45} />
        </mesh>
    );
}

export default function BackgroundScene({ waterLevel }: BackgroundSceneProps) {
    // Su görsel pozisyonunu aşağı kaydırmak için bu değeri artır (negatif = aşağı)
    const waterOffset = -5;
    const w = waterLevel + waterOffset;

    return (
        <>
            <Sky waterLevel={w} />
            <Water waterLevel={w} />
            <Horizon waterLevel={w} />

            {/* Statik bulutlar — span boyutuna göre yatayda dağıtılmış */}
            <Cloud x={-12} y={w + 8} scale={1.8} />
            <Cloud x={-4} y={w + 11} scale={1.2} />
            <Cloud x={4} y={w + 9} scale={1.5} />
            <Cloud x={11} y={w + 12} scale={1.0} />
            <Cloud x={-8} y={w + 14} scale={0.9} />
            <Cloud x={7} y={w + 14} scale={1.3} />
        </>
    );
}
