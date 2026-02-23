import { Canvas } from '@react-three/fiber';
import Camera from './Camera';
import Cursor from './Cursor';
import NodeComponent from './NodeComponent';
import BeamComponent from './BeamComponent';
import GhostBeam from './GhostBeam';
import PhysicsWorld from './PhysicsWorld';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';
import GroundVisual from './GroundVisual';

export default function Scene() {
    const { nodes, beams, gameState } = useGameStore();
    const isSimulating = gameState.mode === 'simulation';
    const level = LEVELS[gameState.levelIndex];

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

            {/* Environment: Sky and Water */}
            <color attach="background" args={['#87ceeb']} /> {/* Sky Blue */}
            {level && (
                <mesh position={[0, level.waterLevel - 18, -2]} frustumCulled={false}>
                    <boxGeometry args={[200, 40, 5]} />
                    {/* Ocean water below the line */}
                    <meshBasicMaterial color="#0ea5e9" transparent opacity={0.7} />
                </mesh>
            )}

            {/* Editor/Visual Ground (Non-Physics) */}
            {!isSimulating && level && (
                <>
                    {/* Left Ground Platform */}
                    <group position={[level.platformLeftX, level.platformY - 2.5, 0]}>
                        <GroundVisual width={level.platformWidth} height={5} />
                    </group>

                    {/* Right Ground Platform */}
                    <group position={[level.platformRightX, level.platformY - 2.5, 0]}>
                        <GroundVisual width={level.platformWidth} height={5} />
                    </group>
                </>
            )}

            {/* EDITOR MODE - Static construction */}
            {!isSimulating && (
                <>
                    {/* Interactive Cursor */}
                    <Cursor offsetY={0} />

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
                </>
            )}

            {/* SIMULATION MODE - Physics active */}
            {isSimulating && <PhysicsWorld />}

        </Canvas>
    );
}
