import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { RepeatWrapping } from 'three';
import { useGameStore } from '../store/gameStore';
import { MATERIALS } from '../utils/materials';
import { MaterialType } from '../types';
import { getRoadTexture } from '../utils/roadTexture';
import AudioManager from '../utils/AudioManager';

interface BeamComponentProps {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

export default function BeamComponent({ id, startNodeId, endNodeId, material }: BeamComponentProps) {
    const { getNodeById, gameState } = useGameStore();
    const gl = useThree((state) => state.gl);

    const startNode = getNodeById(startNodeId);
    const endNode = getNodeById(endNodeId);

    // Memoize texture generation to prevent recreation on every render
    const texture = useMemo(() => {
        if (!startNode || !endNode) return null;

        // Calculate length for correct texture tiling
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (material === 'road') {
            const baseTex = getRoadTexture();
            if (baseTex) {
                const tex = baseTex.clone();
                tex.wrapS = RepeatWrapping;
                tex.wrapT = RepeatWrapping;

                // Repeat based on length (maintain scale consistency with ground road)
                // Ground road uses width/5. Here we use length/5.
                tex.repeat.set(length / 5, 1);

                const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
                tex.anisotropy = Math.min(16, maxAnisotropy);
                tex.needsUpdate = true;
                return tex;
            }
        }
        return null;
    }, [material, startNode, endNode, gl]);

    if (!startNode || !endNode) return null;

    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;
    const angle = Math.atan2(dy, dx);

    const materialProps = MATERIALS[material] || MATERIALS['wood'];

    // Match visual depth to ground road width (3 units) for roads, others thinner
    const depth = material === 'road' ? 3 : 0.4;

    return (
        <group>
            {/* Visual Beam */}
            <mesh
                position={[midX, midY, 0]}
                rotation={[0, 0, angle]}
                onClick={(e) => {
                    e.stopPropagation();
                    // Handle click in editor mode to remove beam
                    if (gameState.mode === 'editor') {
                        const { removeBeam } = useGameStore.getState();
                        removeBeam(id);
                        AudioManager.playSound('break'); // Play 'break' or 'delete' sound
                    }
                }}
            >
                <boxGeometry args={[length, materialProps.thickness, depth]} />
                <meshStandardMaterial
                    color={texture ? '#ffffff' : materialProps.color} // Use white if textured, else material color
                    map={texture}
                    transparent
                    opacity={gameState.mode === 'editor' ? 1 : 0.8}
                />
            </mesh>
        </group>
    );
}
