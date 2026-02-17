import { useGameStore } from '../store/gameStore';

interface NodeComponentProps {
    id: string;
    x: number;
    y: number;
    type: 'normal' | 'anchor';
}

export default function NodeComponent({ id, x, y, type }: NodeComponentProps) {
    const { selectedNodeId, startDrawingBeam, isDrawingBeam } = useGameStore();

    const isSelected = selectedNodeId === id;
    const isAnchor = type === 'anchor';

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        if (!isDrawingBeam) {
            startDrawingBeam(id);
        }
    };

    return (
        <group position={[x, y, 0]}>
            {/* Main node sphere */}
            <mesh onPointerDown={handlePointerDown}>
                <sphereGeometry args={[isAnchor ? 0.3 : 0.2, 16, 16]} />
                <meshStandardMaterial
                    color={
                        isSelected
                            ? '#ffeb3b' // Yellow when selected
                            : isAnchor
                                ? '#8b4513' // Brown for anchors
                                : '#2196f3' // Blue for normal nodes
                    }
                    emissive={isSelected ? '#ffeb3b' : '#000000'}
                    emissiveIntensity={isSelected ? 0.5 : 0}
                />
            </mesh>

            {/* Anchor indicator - fixed to ground */}
            {isAnchor && (
                <mesh position={[0, 0, -0.1]}>
                    <cylinderGeometry args={[0.15, 0.25, 0.2, 8]} />
                    <meshStandardMaterial color="#654321" />
                </mesh>
            )}

            {/* Selection ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.35, 0.45, 16]} />
                    <meshBasicMaterial color="#ffeb3b" transparent opacity={0.6} />
                </mesh>
            )}
        </group>
    );
}
