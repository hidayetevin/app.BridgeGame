import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';
import * as THREE from 'three';

export default function Camera() {
    const { size } = useThree();
    const { gameState } = useGameStore();
    const level = LEVELS[gameState.levelIndex] || LEVELS[0];
    const cameraRef = useRef<THREE.OrthographicCamera>(null);

    // Artık hem 'bağlantı noktaları (anchors)' hem de 'aracın başlama ve bitiş noktaları' hesaba katılacak.
    // Bu sayede araba köprü başlangıcının 10 metre uzağında doğsa bile ekranın dışında kalmaz.
    const minX = Math.min(...level.anchors.map(a => a.x), level.vehicleStart.x);
    const maxX = Math.max(...level.anchors.map(a => a.x), level.vehicleTarget);
    const span = maxX - minX;

    // We base vertical camera alignment on the lowest platform
    const minY = Math.min(...level.platforms.map(p => p.y));

    // Center of the bridge
    const camX = (minX + maxX) / 2;

    // KURAL 2: Köprü uçlarının ekranda görünecek "Minimum Genişliği" (Sarı Çizgi)
    // Sabit bir rakam değil! Seviyenin mesafesine göre dinamik ayar. Şişme veya daralmaları önler.
    const paddingX = Math.max(4, span * 0.25);
    const targetWidth = span + (paddingX * 2);

    // Dikey Yükseklik de artık seviyelere özel!
    // Su görünsün diye minY'nin altına da biraz pay bırakıyoruz (waterLevel'e kadar).
    const waterLevel = level.waterLevel ?? -10;
    const bottomY = Math.min(minY, waterLevel);
    const maxY = Math.max(...level.anchors.map(a => a.y));
    const dynamicHeight = Math.max(14, (maxY - bottomY) + 6);
    const targetHeight = dynamicHeight;

    // Ekranın Genişliğine veya Yüksekliğine göre kameranın kaç birim Zoom yapması gerektiğini hesaplar
    const zoomX = size.width / targetWidth;
    const zoomY = size.height / targetHeight;
    const zoom = Math.min(zoomX, zoomY);

    // KURAL 1: Kamerayı hizalarken su da görünsün diye merkezi biraz yukarı alıyoruz.
    // 0.38 → görüntünün alt %38'i platformların altında (su bölgesi) kalır.
    const visibleHeight = size.height / zoom;
    const camY = bottomY + visibleHeight * 0.50;
    useEffect(() => {
        if (cameraRef.current) {
            // Kamerayı +5 birim yukarı koyup aşağı doğru açılı bakmasını sağlıyoruz.
            // Aksi halde (camY ile aynı hizada olunca) 0 kalınlığındaki (tam yatay) yollar görünmez!
            cameraRef.current.position.set(camX, camY + 5, 20);
            cameraRef.current.lookAt(camX, camY, 0);
            cameraRef.current.updateProjectionMatrix();
        }
    }, [camX, camY, zoom, size]); // size is updated on resize/orientation change

    return (
        <OrthographicCamera
            ref={cameraRef}
            makeDefault
            zoom={zoom}
            position={[camX, camY + 5, 20]}
            near={0.1}
            far={1000}
        />
    );
}
