import { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Image } from '@react-three/drei';
import Camera from './Camera';
import Cursor from './Cursor';
import NodeComponent from './NodeComponent';
import BeamComponent from './BeamComponent';
import GhostBeam from './GhostBeam';
import PhysicsWorld from './PhysicsWorld';
import { VehiclePreview } from './Vehicle';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';
import GroundVisual from './GroundVisual';
import TutorialGuide from './TutorialGuide';

export default function Scene() {
    const { nodes, beams, gameState } = useGameStore();
    const isSimulating = gameState.mode === 'simulation';
    const level = LEVELS[gameState.levelIndex];

    // Background Image Component — tam ekrana oturur
    const ResponsiveBackground = () => {
        const { viewport, camera } = useThree();

        // 1. "Beyaz boşluk kalmaması" için genişlik tam, yükseklik %130 olarak ayarlanır.
        // Yüksekliği fazla tutuyoruz ki, resmi aşağı kaydırdığımızda üstten beyazlık çıkmasın.
        const bgWidth = viewport.width * 1.05;
        const bgHeight = viewport.height * 1.30;

        // 2. Kameranın Y merkezini bul.
        const oCam = camera as THREE.OrthographicCamera;
        const camCenterY = (oCam.top + oCam.bottom) / 2;

        // 3. Resmi aşağı kaydır (- işareti yönümüzü aşağı çevirir).
        // Böylece resmin alt tarafındaki sular kadrajın içine (kameraların gördüğü alana) girer.
        const posY = camCenterY - (viewport.height * 0.10);

        return (
            <Suspense fallback={null}>
                <Image
                    url="/images/background.png"
                    transparent
                    position={[camera.position.x, posY, -17]}
                    scale={[bgWidth, bgHeight]}
                />
            </Suspense>
        );
    };

    // In game screen (editor + simulation): render every frame.
    // In menu/settings/shop: demand-only — the 3D background is static,
    // no need to burn GPU at 60fps when nothing moves.
    const frameloop = gameState.screen === 'game' ? 'always' : 'demand';

    return (
        <Canvas
            dpr={[1, 1.5]}
            frameloop={frameloop}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Camera Setup */}
            <Camera />

            {/* Lighting */}
            {/* Lighting - Strong Environment Light */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <hemisphereLight intensity={1.0} groundColor="#444444" />

            {/* Environment: Background Image perfectly scaled for mobile/desktop */}
            {level && (
                <ResponsiveBackground />
            )}

            {/* Editor/Visual Ground (Non-Physics) */}
            {!isSimulating && level && (
                <>
                    {/* Dynamic Ground Platforms */}
                    {level.platforms.map((p, index) => (
                        <group key={`vis-ground-${index}`} position={[p.x, p.y - 50, 0]}>
                            <GroundVisual width={p.width} height={100} />
                        </group>
                    ))}
                </>
            )}

            {/* EDITOR MODE - Static construction */}
            {!isSimulating && gameState.screen === 'game' && (
                <>
                    {/* Interactive Cursor */}
                    <Cursor offsetY={0} />

                    {/* Tutorial / Help Hand (only shows if conditions met) */}
                    <TutorialGuide />

                    {/* Render all beams */}
                    {beams.map((beam) => (
                        <BeamComponent
                            key={beam.id}
                            id={beam.id}
                            startNodeId={beam.startNodeId}
                            endNodeId={beam.endNodeId}
                            material={beam.material}
                        />
                    ))}

                    {/* Ghost Beam (preview during drawing) */}
                    <GhostBeam />

                    {/* Render all nodes */}
                    {nodes.map((node) => (
                        <NodeComponent
                            key={node.id}
                            id={node.id}
                            x={node.x}
                            y={node.y}
                            type={node.type}
                        />
                    ))}

                    {/* Preview Vehicle so player knows where it spawns */}
                    <VehiclePreview />
                </>
            )}

            {/* SIMULATION MODE - Physics active */}
            {isSimulating && <PhysicsWorld />}

        </Canvas>
    );
}
