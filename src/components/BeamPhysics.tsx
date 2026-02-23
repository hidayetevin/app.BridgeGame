import React, { useEffect, useRef, useMemo } from 'react';
import { useBox, usePointToPointConstraint } from '@react-three/cannon';
import { useGameStore } from '../store/gameStore';
import { MATERIALS } from '../utils/materials';
import { MaterialType } from '../types';
import * as THREE from 'three';
import { Mesh, RepeatWrapping } from 'three';
import { useThree } from '@react-three/fiber';
import { getRoadTexture } from '../utils/roadTexture';

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
    const gl = useThree((state) => state.gl);
    // useRef instead of useState — force value never needs to trigger a re-render.
    // With useState: every beam caused ~10 React re-renders/sec = 200/sec for 20 beams.
    const forceRef = useRef(0);

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

    // Dynamic Road Texture
    const texture = useMemo(() => {
        if (material === 'road') {
            const baseTex = getRoadTexture();
            if (baseTex) {
                const tex = baseTex.clone();
                tex.wrapS = RepeatWrapping;
                tex.wrapT = RepeatWrapping;
                tex.repeat.set(length / 5, 1);
                const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
                tex.anisotropy = Math.min(16, maxAnisotropy);
                tex.needsUpdate = true;
                return tex;
            }
        }
        return null;
    }, [material, length, gl]);

    const collisionMask = isRoad ? 2 : 0;
    const damping = isRoad ? 0.5 : 0.1;
    const collisionThickness = isRoad ? 0.5 : customThickness;

    // Visual Depth
    const depth = isRoad ? 3 : 0.4;

    // Physics Body
    const [beamRef] = useBox(() => ({
        mass: 0.05,
        position: [midX, midY, 0],
        rotation: [0, 0, angle],
        args: [length, collisionThickness, 5], // Physics depth remains 5 for safety
        collisionFilterGroup: 4,
        collisionFilterMask: collisionMask,
        angularFactor: [0, 0, 1] as [number, number, number],
        linearDamping: damping,
        angularDamping: damping,
    }));

    // Constraints
    usePointToPointConstraint(beamRef, startBodyData.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    usePointToPointConstraint(beamRef, endBodyData.ref, {
        pivotA: [length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    // Stress Logic (Kept for breaking, removed for coloring)
    useEffect(() => {
        if (!startBodyData.api || !endBodyData.api) return;

        let p1 = new THREE.Vector3();
        let p2 = new THREE.Vector3();

        const unsub1 = startBodyData.api.position.subscribe((v: number[]) => p1.set(v[0], v[1], v[2]));
        const unsub2 = endBodyData.api.position.subscribe((v: number[]) => p2.set(v[0], v[1], v[2]));

        let checkInterval: NodeJS.Timeout;

        const startTimeout = setTimeout(() => {
            checkInterval = setInterval(() => {
                const dist = p1.distanceTo(p2);
                const strain = Math.abs(dist - length);
                const force = strain * materialProps.stiffness;

                // Store in ref — no re-render needed, only used for break check
                forceRef.current = force;

                if (force > materialProps.strength) {
                    breakBeam(id);
                }
            }, 150); // 150ms instead of 100ms — beam can't break visually faster than 6fps anyway
        }, 1000);

        return () => {
            unsub1();
            unsub2();
            clearTimeout(startTimeout);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [breakBeam, id, length, materialProps, startBodyData, endBodyData]);

    return (
        <mesh ref={beamRef as React.Ref<Mesh>}>
            <boxGeometry args={[length, customThickness, depth]} />
            <meshStandardMaterial
                color={texture ? '#ffffff' : materialProps.color} // Use texture or original color
                map={texture}
                transparent={!isRoad}
                opacity={1}
            />
        </mesh>
    );
};

// ... (BrokenBeam remains mostly same but allows texture)

const BrokenBeam = ({
    startNodeId,
    endNodeId,
    material,
    startBodyData,
}: BeamPhysicsProps & { startBodyData: any }) => {
    const startNode = useGameStore((s) => s.getNodeById(startNodeId));
    const endNode = useGameStore((s) => s.getNodeById(endNodeId));
    const gl = useThree((state) => state.gl);

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
    const depth = isRoad ? 3 : 0.4;

    // Texture for broken beam too
    const texture = useMemo(() => {
        if (material === 'road') {
            const baseTex = getRoadTexture();
            if (baseTex) {
                const tex = baseTex.clone();
                tex.wrapS = RepeatWrapping;
                tex.wrapT = RepeatWrapping;
                tex.repeat.set(length / 5, 1);
                const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
                tex.anisotropy = Math.min(16, maxAnisotropy);
                tex.needsUpdate = true;
                return tex;
            }
        }
        return null;
    }, [material, length, gl]);

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

    usePointToPointConstraint(beamRef, startBodyData.ref, {
        pivotA: [-length / 2, 0, 0],
        pivotB: [0, 0, 0],
    });

    return (
        <mesh ref={beamRef as React.Ref<Mesh>}>
            <boxGeometry args={[length, customThickness, depth]} />
            <meshStandardMaterial
                color={texture ? '#888888' : '#8B0000'} // Darker if broken texture, or red
                map={texture}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};

const BeamPhysicsWrapper = (props: BeamPhysicsProps) => {
    const { getPhysicsBody, brokenBeamIds } = useGameStore();

    const startBodyData = getPhysicsBody(props.startNodeId);
    const endBodyData = getPhysicsBody(props.endNodeId);

    if (!startBodyData || !endBodyData) {
        return null;
    }

    const isBroken = brokenBeamIds.has(props.id);

    if (isBroken) {
        return <BrokenBeam {...props} startBodyData={startBodyData} />;
    }

    return <IntactBeam {...props} startBodyData={startBodyData} endBodyData={endBodyData} />;
};

export default BeamPhysicsWrapper;
