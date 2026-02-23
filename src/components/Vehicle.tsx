import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useBox, useSphere, useHingeConstraint } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';

// ─── Paths ────────────────────────────────────────────────────────────────────
const CAR_PATH = '/models/GLB format/sedan-sports.glb';
const WHEEL_PATH = '/models/GLB format/wheel-default.glb';

// ─── GLB components (used as children of physics meshes) ─────────────────────
// Because they are CHILDREN of the cannon-managed mesh, they inherit position
// and rotation for free — no useFrame sync needed.

function CarBodyGLB() {
    const { scene } = useGLTF(CAR_PATH);
    const cloned = useMemo(() => scene.clone(true), [scene]);
    // Kenney sedan is ~1 unit long in its local X axis
    // Physics chassis is 1.6 wide in world X
    // Rotate so car faces +X direction (right)
    // position Y -0.25 puts bottom of car flush with chassis bottom
    return (
        <primitive
            object={cloned}
            scale={1.4}
            rotation={[0, Math.PI / 2, 0]}
            position={[0, -0.25, 0]}
        />
    );
}

function WheelGLB({ flip }: { flip?: boolean }) {
    const { scene } = useGLTF(WHEEL_PATH);
    const cloned = useMemo(() => scene.clone(true), [scene]);
    return (
        <primitive
            object={cloned}
            scale={0.9}
            rotation={[0, flip ? Math.PI : 0, 0]}
        />
    );
}

// ─── Position tracker for game logic ─────────────────────────────────────────
// Reads cannon body position from the mesh ref every frame
function PositionTracker({
    chassisRef,
    posX,
    posY,
    level,
    hasWon,
    hasFallen,
    setWon,
    setLost,
    wheel1Api,
    wheel2Api,
    gameMode,
}: {
    chassisRef: React.RefObject<Mesh>;
    posX: React.MutableRefObject<number>;
    posY: React.MutableRefObject<number>;
    level: any;
    hasWon: React.MutableRefObject<boolean>;
    hasFallen: React.MutableRefObject<boolean>;
    setWon: (w: boolean) => void;
    setLost: (l: boolean) => void;
    wheel1Api: any;
    wheel2Api: any;
    gameMode: string;
}) {
    useFrame(() => {
        if (gameMode !== 'simulation' || !chassisRef.current) return;

        posX.current = chassisRef.current.position.x;
        posY.current = chassisRef.current.position.y;

        if (posX.current >= level.vehicleTarget && !hasWon.current) {
            hasWon.current = true;
            setWon(true);
        }

        if (posY.current < level.waterLevel && !hasFallen.current && !hasWon.current) {
            hasFallen.current = true;
            setLost(true);
        }

        if (!hasWon.current && !hasFallen.current && posX.current < level.vehicleTarget) {
            wheel1Api.angularVelocity.set(0, 0, -20);
            wheel2Api.angularVelocity.set(0, 0, -20);
        }
    });
    return null;
}

// ─── Main Vehicle ─────────────────────────────────────────────────────────────
export default function Vehicle() {
    const { gameState, setWon, setLost } = useGameStore();
    const level = LEVELS[gameState.levelIndex];

    const posX = useRef(level.vehicleStart.x);
    const posY = useRef(level.vehicleStart.y);
    const hasWon = useRef(false);
    const hasFallen = useRef(false);

    // 1. Chassis
    const [chassisRef, chassisApi] = useBox<Mesh>(() => ({
        mass: 15,
        position: [level.vehicleStart.x, level.vehicleStart.y, 0],
        args: [1.6, 0.5, 0.8],
        allowSleep: false,
        angularDamping: 0.5,
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4,
        angularFactor: [0, 0, 1],
    }));

    // 2. Rear wheel
    const [wheel1Ref, wheel1Api] = useSphere<Mesh>(() => ({
        mass: 2,
        position: [level.vehicleStart.x - 0.6, level.vehicleStart.y - 0.4, 0],
        args: [0.45],
        friction: 2,
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4,
    }));

    // 3. Front wheel
    const [wheel2Ref, wheel2Api] = useSphere<Mesh>(() => ({
        mass: 2,
        position: [level.vehicleStart.x + 0.6, level.vehicleStart.y - 0.4, 0],
        args: [0.45],
        friction: 2,
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 4,
    }));

    // 4. Hinge constraints
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

    // 5. Reset on editor mode
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
            {/* Game logic tracker — reads chassis position each frame */}
            <PositionTracker
                chassisRef={chassisRef}
                posX={posX}
                posY={posY}
                level={level}
                hasWon={hasWon}
                hasFallen={hasFallen}
                setWon={setWon}
                setLost={setLost}
                wheel1Api={wheel1Api}
                wheel2Api={wheel2Api}
                gameMode={gameState.mode}
            />

            {/* ── Chassis mesh (cannon-tracked) + car GLB as child ── */}
            <mesh ref={chassisRef} castShadow>
                <boxGeometry args={[1.6, 0.5, 0.8]} />
                <meshStandardMaterial visible={false} />

                <Suspense fallback={
                    /* Fallback box car while GLB loads */
                    <group>
                        <mesh position={[0, 0.1, 0]}>
                            <boxGeometry args={[1.5, 0.38, 0.8]} />
                            <meshStandardMaterial color="#e53935" roughness={0.3} metalness={0.5} />
                        </mesh>
                        <mesh position={[0.05, 0.38, 0]}>
                            <boxGeometry args={[0.85, 0.28, 0.7]} />
                            <meshStandardMaterial color="#b71c1c" roughness={0.3} />
                        </mesh>
                    </group>
                }>
                    <CarBodyGLB />
                </Suspense>
            </mesh>

            {/* ── Rear wheel + GLB wheel as child ── */}
            <mesh ref={wheel1Ref} castShadow>
                <sphereGeometry args={[0.45, 8, 8]} />
                <meshStandardMaterial visible={false} />
                <Suspense fallback={null}>
                    <WheelGLB />
                </Suspense>
            </mesh>

            {/* ── Front wheel ── */}
            <mesh ref={wheel2Ref} castShadow>
                <sphereGeometry args={[0.45, 8, 8]} />
                <meshStandardMaterial visible={false} />
                <Suspense fallback={null}>
                    <WheelGLB flip />
                </Suspense>
            </mesh>
        </group>
    );
}

// Preload both models immediately
useGLTF.preload(CAR_PATH);
useGLTF.preload(WHEEL_PATH);
