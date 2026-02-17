import { Physics } from '@react-three/cannon';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';
import NodePhysics from './NodePhysics';
import BeamPhysics from './BeamPhysics';
import Vehicle from './Vehicle';
import Ground from './Ground';

export default function PhysicsWorld() {
    const { gameState, nodes, beams } = useGameStore();
    const isSimulating = gameState.mode === 'simulation';
    const level = LEVELS[gameState.levelIndex];

    if (!isSimulating || !level) return null;

    return (
        <>
            <Physics
                gravity={[0, -20, 0]}
                defaultContactMaterial={{
                    friction: 0.8,    // High friction for tires
                    restitution: 0.1, // Low bounce
                }}
            >
                {/* Render physics-enabled nodes */}
                {nodes.map((node) => (
                    <NodePhysics
                        key={node.id}
                        id={node.id}
                        x={node.x}
                        y={node.y}
                        type={node.type}
                    />
                ))}

                {/* Render physics-enabled beams as constraints */}
                {beams.map((beam) => (
                    <BeamPhysics
                        key={beam.id}
                        id={beam.id}
                        startNodeId={beam.startNodeId}
                        endNodeId={beam.endNodeId}
                        material={beam.material}
                    />
                ))}

                {/* Vehicle - now starts on platform */}
                <Vehicle />

                {/* Left Ground Platform */}
                <Ground
                    x={level.platformLeftX}
                    y={level.platformY - 2.5} // Center Y (surface is at platformY)
                    width={level.platformWidth}
                    height={5}
                />

                {/* Right Ground Platform */}
                <Ground
                    x={level.platformRightX}
                    y={level.platformY - 2.5} // Center Y
                    width={level.platformWidth}
                    height={5}
                />
            </Physics>

            {/* Water level indicator (outside physics) */}
            <mesh position={[0, level.waterLevel, -0.5]}>
                <planeGeometry args={[100, 1]} />
                <meshBasicMaterial color="#2196F3" transparent opacity={0.3} />
            </mesh>
        </>
    );
}
