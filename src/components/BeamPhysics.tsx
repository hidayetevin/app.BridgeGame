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

export default function BeamPhysics({
    id,
    startNodeId,
    endNodeId,
    material,
}: BeamPhysicsProps) {
    const { getNodeById, getPhysicsBody, breakBeam } = useGameStore();
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

    // Get physics bodies
    const startBodyData = getPhysicsBody(startNodeId);
    const endBodyData = getPhysicsBody(endNodeId);

    // Create Physics Body for the Beam (Road Surface)
    const [beamRef, beamApi] = useBox(() => ({
        mass: 0.2,
        position: [midX, midY, 0],
        rotation: [0, 0, angle],
        args: [length, materialProps.thickness, 1], // Z=1 for vehicle to ride on
        collisionFilterGroup: 4, // Group 4: Beams
        // IMPORTANT FIX: Only collide with Vehicle (2). 
        // Ignore Ground (1), Other Beams (4), Nodes (8).
        // This prevents "physics explosion" when beams overlap or touch nodes.
        collisionFilterMask: 2,
    }));

    // Constraint 1: Connect Beam Start to StartNode
    usePointToPointConstraint(beamRef, startBodyData?.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Constraint 2: Connect Beam End to EndNode
    usePointToPointConstraint(beamRef, endBodyData?.ref, {
        pivotA: [length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Calculate stress
    useFrame(() => {
        if (!startBodyData?.api || !endBodyData?.api) return;

        const startPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();

        startBodyData.api.position.subscribe((p: number[]) => startPos.set(p[0], p[1], p[2]));
        endBodyData.api.position.subscribe((p: number[]) => endPos.set(p[0], p[1], p[2]));

        const currentDistance = startPos.distanceTo(endPos);
        const strain = Math.abs(currentDistance - length);

        // Increased force tolerance slightly to prevent instant break on start
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
