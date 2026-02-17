import { useGameStore } from '../store/gameStore';

export default function GhostBeam() {
    const { selectedNodeId, ghostBeamEnd, getNodeById, isDrawingBeam } = useGameStore();

    if (!isDrawingBeam || !selectedNodeId || !ghostBeamEnd) return null;

    const startNode = getNodeById(selectedNodeId);
    if (!startNode) return null;

    const dx = ghostBeamEnd.x - startNode.x;
    const dy = ghostBeamEnd.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const midX = (startNode.x + ghostBeamEnd.x) / 2;
    const midY = (startNode.y + ghostBeamEnd.y) / 2;

    return (
        <group position={[midX, midY, 0]} rotation={[0, 0, angle]}>
            <mesh>
                <boxGeometry args={[length, 0.08, 0.08]} />
                <meshStandardMaterial
                    color="#4CAF50"
                    transparent
                    opacity={0.5}
                    emissive="#4CAF50"
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    );
}
