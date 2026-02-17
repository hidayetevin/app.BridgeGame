import { useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, usePointToPointConstraint } from '@react-three/cannon';
import { useGameStore } from '../store/gameStore';
import { MATERIALS, getStressColor } from '../utils/materials';
import { MaterialType } from '../types';
import * as THREE from 'three';
import { Mesh } from 'three';

interface BeamPhysicsProps {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

// ==========================================
// 1. INTACT BEAM (Connected at both ends)
// ==========================================
const IntactBeam = ({
    id,
    startNodeId,
    endNodeId,
    material,
    startBodyData,
    endBodyData,
}: BeamPhysicsProps & { startBodyData: any, endBodyData: any }) => {
    const { breakBeam } = useGameStore();
    const [currentForce, setCurrentForce] = useState(0);

    // Calculate Geometry
    const startNode = useGameStore((s) => s.getNodeById(startNodeId));
    const endNode = useGameStore((s) => s.getNodeById(endNodeId));

    // Memoize geometry to avoid recalcs
    const { length, midX, midY, angle, customThickness } = useMemo(() => {
        if (!startNode || !endNode) return { length: 1, midX: 0, midY: 0, angle: 0, customThickness: 0.1 };
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const mat = MATERIALS[material];
        return {
            length: len,
            midX: (startNode.x + endNode.x) / 2,
            midY: (startNode.y + endNode.y) / 2,
            angle: Math.atan2(dy, dx),
            customThickness: mat.thickness
        };
    }, [startNode, endNode, material]);

    const materialProps = MATERIALS[material];
    const isRoad = materialProps.isRoad;
    const collisionMask = isRoad ? 2 : 0;
    const damping = isRoad ? 0.5 : 0.1;

    // Physics Body
    const [beamRef] = useBox(() => ({
        mass: 0.05, // Significantly reduced mass to prevent self-collapse
        position: [midX, midY, 0],
        rotation: [0, 0, angle],
        args: [length, customThickness, 5],
        collisionFilterGroup: 4,
        collisionFilterMask: collisionMask,
        angularFactor: [0, 0, 1] as [number, number, number],
        linearDamping: damping,
        angularDamping: damping,
    }));

    // Constraint 1 (Start)
    usePointToPointConstraint(beamRef, startBodyData.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Constraint 2 (End)
    usePointToPointConstraint(beamRef, endBodyData.ref, {
        pivotA: [length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Re-implementing the stress logic properly
    useEffect(() => {
        if (!startBodyData.api || !endBodyData.api) return;

        let p1 = new THREE.Vector3();
        let p2 = new THREE.Vector3();

        const unsub1 = startBodyData.api.position.subscribe((v: number[]) => p1.set(v[0], v[1], v[2]));
        const unsub2 = endBodyData.api.position.subscribe((v: number[]) => p2.set(v[0], v[1], v[2]));

        let checkInterval: NodeJS.Timeout;

        // Delay stress check to let physics settle (1s grace period)
        const startTimeout = setTimeout(() => {
            checkInterval = setInterval(() => {
                const dist = p1.distanceTo(p2);
                const strain = Math.abs(dist - length);

                // Force = Strain * Stiffness
                const force = strain * materialProps.stiffness;

                setCurrentForce(force);

                if (force > materialProps.strength) {
                    breakBeam(id);
                }
            }, 100);
        }, 1000);

        return () => {
            unsub1();
            unsub2();
            clearTimeout(startTimeout);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [breakBeam, id, length, materialProps, startBodyData, endBodyData]);


    const stressColor = getStressColor(currentForce, materialProps.strength);

    return (
        <mesh ref={beamRef as React.Ref<Mesh>}>
            <boxGeometry args={[length, customThickness, 1]} />
            <meshStandardMaterial
                color={stressColor}
                transparent={!isRoad}
                opacity={1}
            />
        </mesh>
    );
};


// ==========================================
// 2. BROKEN BEAM (Connected at one end only)
// ==========================================
const BrokenBeam = ({
    id,
    startNodeId,
    endNodeId,
    material,
    startBodyData,
}: BeamPhysicsProps & { startBodyData: any }) => {
    // Only connect to Start Node, let end dangle.

    const startNode = useGameStore((s) => s.getNodeById(startNodeId));
    const endNode = useGameStore((s) => s.getNodeById(endNodeId));

    const { length, midX, midY, angle, customThickness } = useMemo(() => {
        if (!startNode || !endNode) return { length: 1, midX: 0, midY: 0, angle: 0, customThickness: 0.1 };
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        return {
            length: Math.sqrt(dx * dx + dy * dy),
            midX: (startNode.x + endNode.x) / 2,
            midY: (startNode.y + endNode.y) / 2,
            angle: Math.atan2(dy, dx),
            customThickness: MATERIALS[material].thickness
        };
    }, [startNode, endNode, material]);

    const materialProps = MATERIALS[material];
    const isRoad = materialProps.isRoad;

    // Physics Body - Same props but different behavior
    const [beamRef] = useBox(() => ({
        mass: 0.05,
        position: [midX, midY, 0],
        rotation: [0, 0, angle],
        args: [length, customThickness, 5],
        collisionFilterGroup: 4,
        collisionFilterMask: isRoad ? 2 : 0,
        angularFactor: [0, 0, 1] as [number, number, number],
        linearDamping: 0.1,
        angularDamping: 0.1,
    }));

    // Constraint 1 Only (Start) - Dangles from here
    usePointToPointConstraint(beamRef, startBodyData.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    return (
        <mesh ref={beamRef as React.Ref<Mesh>}>
            <boxGeometry args={[length, customThickness, 1]} />
            <meshStandardMaterial
                color={isRoad ? '#555' : '#8B0000'} // Gray or Dark Red to show damage
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};


// ==========================================
// 3. MAIN WRAPPER
// ==========================================
const BeamPhysicsWrapper = (props: BeamPhysicsProps) => {
    const { getPhysicsBody, brokenBeamIds } = useGameStore();

    const startBodyData = getPhysicsBody(props.startNodeId);
    const endBodyData = getPhysicsBody(props.endNodeId);

    if (!startBodyData || !endBodyData) {
        return null;
    }

    const isBroken = brokenBeamIds.has(props.id);

    if (isBroken) {
        // Render broken version (dangling)
        return <BrokenBeam {...props} startBodyData={startBodyData} />;
    }

    // Render intact version
    return <IntactBeam {...props} startBodyData={startBodyData} endBodyData={endBodyData} />;
};

export default BeamPhysicsWrapper;
