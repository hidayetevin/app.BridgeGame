import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, usePointToPointConstraint } from '@react-three/cannon';
import { useGameStore } from '../store/gameStore';
import { MATERIALS, getStressColor } from '../utils/materials';
import { MaterialType } from '../types';
import * as THREE from 'three';

interface BeamPhysicsProps {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

// 1. Wrapper Component: Waits for nodes to be ready in physics system
export default function BeamPhysicsWrapper(props: BeamPhysicsProps) {
    const { getPhysicsBody } = useGameStore();

    const startBodyData = getPhysicsBody(props.startNodeId);
    const endBodyData = getPhysicsBody(props.endNodeId);

    // If bodies are not ready yet, don't render the physics component
    // This prevents constraint failures on initial render
    if (!startBodyData || !endBodyData) {
        return null;
    }

    return <BeamPhysicsCore {...props} startBodyData={startBodyData} endBodyData={endBodyData} />;
}

// 2. Core Component: Only renders when refs are guaranteed to exist
function BeamPhysicsCore({
    id,
    startNodeId,
    endNodeId,
    material,
    startBodyData,
    endBodyData,
}: BeamPhysicsProps & { startBodyData: any, endBodyData: any }) {
    const { getNodeById, breakBeam } = useGameStore();
    const [currentForce, setCurrentForce] = useState(0);

    const startNode = getNodeById(startNodeId);
    const endNode = getNodeById(endNodeId);

    if (!startNode || !endNode) return null;

    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;
    const angle = Math.atan2(dy, dx);

    const materialProps = MATERIALS[material];

    // Create Physics Body for the Beam
    const [beamRef] = useBox(() => ({
        mass: 0.2,
        position: [midX, midY, 0],
        rotation: [0, 0, angle],
        args: [length, materialProps.thickness, 1],
        collisionFilterGroup: 4, // Group 4: Beams
        collisionFilterMask: 2,  // Only collide with Vehicle (2)
    }));

    // Constraint 1: Connect Beam Start to StartNode
    usePointToPointConstraint(beamRef, startBodyData.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Constraint 2: Connect Beam End to EndNode
    usePointToPointConstraint(beamRef, endBodyData.ref, {
        pivotA: [length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Stress Calculation
    useFrame(() => {
        // Safety check mostly for hot reload or cleanup
        if (!startBodyData.api || !endBodyData.api) return;

        const startPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();

        startBodyData.api.position.subscribe((p: number[]) => startPos.set(p[0], p[1], p[2]));
        endBodyData.api.position.subscribe((p: number[]) => endPos.set(p[0], p[1], p[2]));

        const currentDistance = startPos.distanceTo(endPos);
        const strain = Math.abs(currentDistance - length);

        const estimatedForce = strain * materialProps.stiffness * 0.0005;

        setCurrentForce(estimatedForce);

        if (estimatedForce > materialProps.strength) {
            breakBeam(id);
        }
    });

    const stressColor = getStressColor(currentForce, materialProps.strength);

    return (
        <mesh ref={beamRef as React.Ref<THREE.Mesh>}>
            <boxGeometry args={[length, materialProps.thickness, 1]} />
            <meshStandardMaterial
                color={stressColor}
                emissive={currentForce > materialProps.strength * 0.7 ? stressColor : '#000000'}
                emissiveIntensity={currentForce > materialProps.strength * 0.7 ? 0.3 : 0}
            />
        </mesh>
    );
}
