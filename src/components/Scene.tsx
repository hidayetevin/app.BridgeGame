import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import Camera from './Camera';
import Grid from './Grid';
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

    return (
        <Canvas
            dpr={[1, 2]}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Camera Setup */}
            <Camera />

            {/* Lighting */}
            {/* Lighting - Strong Environment Light */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <hemisphereLight intensity={1.0} groundColor="#444444" />

            {/* Grid for reference */}
            <Grid />

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

                    {/* Water level indicator */}
                    <mesh position={[0, level.waterLevel, -0.5]}>
                        <planeGeometry args={[100, 1]} />
                        <meshBasicMaterial color="#2196F3" transparent opacity={0.3} />
                    </mesh>
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

            {/* Performance Stats */}
            <Stats />
        </Canvas>
    );
}
