import { useRef, useEffect } from 'react';
import { useBox, useSphere, useHingeConstraint } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';

export default function Vehicle() {
    const { gameState, setWon, setLost } = useGameStore();
    const level = LEVELS[gameState.levelIndex];

    const posX = useRef(level.vehicleStart.x);
    const posY = useRef(level.vehicleStart.y);
    const hasWon = useRef(false);
    const hasFallen = useRef(false);

    // Collision Mask:
    // Group 2: Vehicle
    // Mask: 1 (Ground) | 4 (Beams) = 5
    // NOT 8 (Nodes/Anchors)

    // 1. Chassis (Car Body)
    const [chassisRef, chassisApi] = useBox(() => ({
        mass: 15,
        position: [level.vehicleStart.x, level.vehicleStart.y, 0],
        args: [1.6, 0.5, 0.8],
        allowSleep: false,
        angularDamping: 0.5,
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4, // Ground and Beams only
        angularFactor: [0, 0, 1], // Lock rotation to Z axis only!
    }));

    // 2. Wheel 1 (Rear)
    const [wheel1Ref, wheel1Api] = useSphere(() => ({
        mass: 2,
        position: [level.vehicleStart.x - 0.6, level.vehicleStart.y - 0.4, 0],
        args: [0.45],
        friction: 2, // High friction for grip
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4, // Ground and Beams only
    }));

    // 3. Wheel 2 (Front)
    const [wheel2Ref, wheel2Api] = useSphere(() => ({
        mass: 2,
        position: [level.vehicleStart.x + 0.6, level.vehicleStart.y - 0.4, 0],
        args: [0.45],
        friction: 2,
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4, // Ground and Beams only
    }));

    // 4. Attach Wheels to Chassis
    useHingeConstraint(chassisRef, wheel1Ref, {
        pivotA: [-0.6, -0.4, 0],
        pivotB: [0, 0, 0],
        axisA: [0, 0, 1],
        axisB: [0, 0, 1],
    });

    useHingeConstraint(chassisRef, wheel2Ref, {
        pivotA: [0.6, -0.4, 0],
        pivotB: [0, 0, 0],
        axisA: [0, 0, 1],
        axisB: [0, 0, 1],
    });

    // 5. Game Logic
    useFrame(() => {
        if (gameState.mode !== 'simulation') return;

        chassisApi.position.subscribe((p) => {
            posX.current = p[0];
            posY.current = p[1];
        });

        if (posX.current >= level.vehicleTarget && !hasWon.current) {
            hasWon.current = true;
            setWon(true);
        }

        if (posY.current < level.waterLevel && !hasFallen.current && !hasWon.current) {
            hasFallen.current = true;
            setLost(true);
        }

        // Drive Logic
        if (!hasWon.current && !hasFallen.current && posX.current < level.vehicleTarget) {
            // Apply torque for driving
            wheel1Api.angularVelocity.set(0, 0, -20); // Faster (-20)
            wheel2Api.angularVelocity.set(0, 0, -20);

            // Removed manual push force, let the wheels do the work
            // chassisApi.applyForce([10, 0, 0], [0, 0, 0]);
        }
    });

    // Reset
    useEffect(() => {
        if (gameState.mode === 'editor') {
            chassisApi.position.set(level.vehicleStart.x, level.vehicleStart.y, 0);
            chassisApi.velocity.set(0, 0, 0);
            chassisApi.angularVelocity.set(0, 0, 0);
            chassisApi.rotation.set(0, 0, 0);

            wheel1Api.position.set(level.vehicleStart.x - 0.6, level.vehicleStart.y - 0.4, 0);
            wheel1Api.velocity.set(0, 0, 0);
            wheel1Api.angularVelocity.set(0, 0, 0);

            wheel2Api.position.set(level.vehicleStart.x + 0.6, level.vehicleStart.y - 0.4, 0);
            wheel2Api.velocity.set(0, 0, 0);
            wheel2Api.angularVelocity.set(0, 0, 0);

            hasWon.current = false;
            hasFallen.current = false;
        }
    }, [gameState.mode, chassisApi, wheel1Api, wheel2Api, level]);

    return (
        <group>
            {/* Chassis Visual */}
            <mesh ref={chassisRef as React.Ref<Mesh>} castShadow>
                <boxGeometry args={[1.6, 0.5, 0.8]} />
                <meshStandardMaterial color="#e53935" />
            </mesh>

            {/* Wheel 1 Visual */}
            <mesh ref={wheel1Ref as React.Ref<Mesh>} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#212121" />
            </mesh>

            {/* Wheel 2 Visual */}
            <mesh ref={wheel2Ref as React.Ref<Mesh>} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#212121" />
            </mesh>
        </group>
    );
}
