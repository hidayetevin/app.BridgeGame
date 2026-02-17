import { useGameStore } from '../store/gameStore';
import { MATERIALS } from '../utils/materials';
import { MaterialType } from '../types';

interface BeamComponentProps {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

export default function BeamComponent({ id, startNodeId, endNodeId, material }: BeamComponentProps) {
    const { getNodeById, gameState } = useGameStore();

    const startNode = getNodeById(startNodeId);
    const endNode = getNodeById(endNodeId);

    if (!startNode || !endNode) return null;

    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;
    const angle = Math.atan2(dy, dx);

    const materialProps = MATERIALS[material] || MATERIALS['wood']; // Fallback

    return (
        <group>
            {/* Visual Beam */}
            <mesh
                position={[midX, midY, 0]}
                rotation={[0, 0, angle]}
                onClick={(e) => {
                    e.stopPropagation();
                    // Optional: Handle click in editor mode
                }}
            >
                <boxGeometry args={[length, materialProps.thickness, 1]} />
                <meshStandardMaterial
                    color={materialProps.color}
                    transparent
                    opacity={gameState.mode === 'editor' ? 1 : 0.8}
                />
            </mesh>

            {/* Optional: Add joint spheres at ends for better visual connection? 
                Currently handled by Nodes 
            */}
        </group>
    );
}
