import { useGameStore } from '../store/gameStore';
import { MATERIALS } from '../utils/materials';

export default function GhostBeam() {
    const { selectedNodeId, ghostBeamEnd, getNodeById, isDrawingBeam, selectedMaterial } = useGameStore();

    if (!isDrawingBeam || !selectedNodeId || !ghostBeamEnd) return null;

    const startNode = getNodeById(selectedNodeId);
    if (!startNode) return null;

    const dx = ghostBeamEnd.x - startNode.x;
    const dy = ghostBeamEnd.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const midX = (startNode.x + ghostBeamEnd.x) / 2;
    const midY = (startNode.y + ghostBeamEnd.y) / 2;

    // Get material properties for preview
    const materialProps = MATERIALS[selectedMaterial] || MATERIALS['wood'];

    return (
        <group position={[midX, midY, 0]} rotation={[0, 0, angle]}>
            <mesh>
                <boxGeometry args={[length, materialProps.thickness, 1]} />
                <meshStandardMaterial
                    color={materialProps.color}
                    transparent
                    opacity={0.5}
                    emissive={materialProps.color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    );
}
