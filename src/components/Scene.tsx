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
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Grid for reference */}
            <Grid />

            {/* Editor/Visual Ground (Non-Physics) */}
            {!isSimulating && level && (
                <>
                    {/* Left Ground Platform */}
                    <mesh position={[level.platformLeftX, level.platformY - 2.5, 0]}>
                        <boxGeometry args={[level.platformWidth, 5, 5]} />
                        <meshStandardMaterial color="#4CAF50" />
                        <mesh position={[0, 2.6, 0]}>
                            <boxGeometry args={[level.platformWidth, 0.2, 5]} />
                            <meshStandardMaterial color="#81C784" />
                        </mesh>
                    </mesh>

                    {/* Right Ground Platform */}
                    <mesh position={[level.platformRightX, level.platformY - 2.5, 0]}>
                        <boxGeometry args={[level.platformWidth, 5, 5]} />
                        <meshStandardMaterial color="#4CAF50" />
                        <mesh position={[0, 2.6, 0]}>
                            <boxGeometry args={[level.platformWidth, 0.2, 5]} />
                            <meshStandardMaterial color="#81C784" />
                        </mesh>
                    </mesh>

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
