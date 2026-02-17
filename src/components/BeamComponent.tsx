import { useGameStore } from '../store/gameStore';
import { MaterialType } from '../types';

interface BeamComponentProps {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

// Material properties
const MATERIAL_PROPS = {
    wood: {
        color: '#8B4513',
        thickness: 0.08,
    },
    steel: {
        color: '#708090',
        thickness: 0.12,
    },
    cable: {
        color: '#4A4A4A',
        thickness: 0.04,
    },
};

export default function BeamComponent({
    id,
    startNodeId,
    endNodeId,
    material,
}: BeamComponentProps) {
    const { getNodeById } = useGameStore();

    const startNode = getNodeById(startNodeId);
    const endNode = getNodeById(endNodeId);

    if (!startNode || !endNode) return null;

    // Calculate beam position and rotation
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;

    const props = MATERIAL_PROPS[material];

    return (
        <group position={[midX, midY, 0]} rotation={[0, 0, angle]}>
            <mesh>
                <boxGeometry args={[length, props.thickness, props.thickness]} />
                <meshStandardMaterial color={props.color} />
            </mesh>
        </group>
    );
}
