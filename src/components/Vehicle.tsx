import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useBox, useSphere, useHingeConstraint } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../store/gameStore';
import { LEVELS } from '../data/levels';
import { CARS } from '../data/cars';

// ─── Paths ────────────────────────────────────────────────────────────────────
const GLB_BASE = '/models/GLB format/';
const DEFAULT_CAR = 'sedan-sports';

// ─── GLB car body — child of physics chassis mesh ─────────────────────────────
function CarBodyGLB({ glbPath, previewScale }: { glbPath: string; previewScale: number }) {
    const { scene } = useGLTF(glbPath);
    const cloned = useMemo(() => scene.clone(true), [scene, glbPath]);
    return (
        <primitive
            object={cloned}
            scale={previewScale * 0.5}  // previewScale is 1.4 for sedan → 0.7 game scale
            rotation={[0, Math.PI / 2, 0]}
            position={[0, -0.50, 0]}
        />
    );
}

// ─── Static Visual Preview for Editor Mode ──────────────────────────────────────
export function VehiclePreview() {
    const { gameState } = useGameStore();
    const level = LEVELS[gameState.levelIndex];
    if (!level) return null;

    const equippedId = gameState.equippedCar || DEFAULT_CAR;
    const carData = CARS.find(c => c.id === equippedId) || CARS[0];
    const carGlbPath = GLB_BASE + equippedId + '.glb';

    return (
        <group position={[level.vehicleStart.x, level.vehicleStart.y, 0]}>
            <Suspense fallback={
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[1.5, 0.38, 0.8]} />
                    <meshStandardMaterial color="#e53935" roughness={0.3} metalness={0.5} />
                </mesh>
            }>
                <CarBodyGLB glbPath={carGlbPath} previewScale={carData.previewScale} />
            </Suspense>
        </group>
    );
}

// ─── Main Vehicle ─────────────────────────────────────────────────────────────
export default function Vehicle() {
    const { gameState, setWon, setLost } = useGameStore();
    const level = LEVELS[gameState.levelIndex];

    // Resolve equipped car data for GLB path
    const equippedId = gameState.equippedCar || DEFAULT_CAR;
    const carData = CARS.find(c => c.id === equippedId) || CARS[0];
    const carGlbPath = GLB_BASE + equippedId + '.glb';

    // Preload the equipped car ahead of simulation start
    useEffect(() => {
        useGLTF.preload(carGlbPath);
    }, [carGlbPath]);

    // Track cannon physics position via subscribe (same as original approach)
    const posX = useRef(level.vehicleStart.x);
    const posY = useRef(level.vehicleStart.y);
    const hasWon = useRef(false);
    const hasFallen = useRef(false);

    // 1. Chassis
    const [chassisRef, chassisApi] = useBox<Mesh>(() => ({
        mass: 15,
        position: [level.vehicleStart.x, level.vehicleStart.y, 0],
        // Orijinal görünümden daha küçük bir çarpışma kutusu (Hitbox) kullanıyoruz.
        // Bu sayede ani rampalara çıkarken arabanın tekerleği yola değmeden önce tamponu yere sürtüp arabayı takla attırmayacak.
        args: [1.2, 0.3, 0.8],
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

    // 5. Subscribe to cannon position — original approach, reliable
    useEffect(() => {
        const unsub = chassisApi.position.subscribe((p) => {
            posX.current = p[0];
            posY.current = p[1];
        });
        return unsub;
    }, [chassisApi]);

    // 6. Game logic & drive — runs every frame
    useFrame(() => {
        if (gameState.mode !== 'simulation') return;

        // Win check
        if (posX.current >= level.vehicleTarget && !hasWon.current) {
            hasWon.current = true;
            setWon(true);
        }

        // Fall check
        if (posY.current < level.waterLevel && !hasFallen.current && !hasWon.current) {
            hasFallen.current = true;
            setLost(true);
        }

        // Drive
        if (!hasWon.current && !hasFallen.current) {
            wheel1Api.angularVelocity.set(0, 0, -20);
            wheel2Api.angularVelocity.set(0, 0, -20);
        }
    });

    // 7. Reset when switching back to editor
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
            {/* ── Chassis: cannon physics mesh + car GLB as child ── */}
            <mesh ref={chassisRef} castShadow>
                <boxGeometry args={[1.6, 0.5, 0.8]} />
                <meshStandardMaterial visible={false} />

                <Suspense fallback={
                    <group>
                        <mesh position={[0, 0.1, 0]}>
                            <boxGeometry args={[1.5, 0.38, 0.8]} />
                            <meshStandardMaterial color="#e53935" roughness={0.3} metalness={0.5} />
                        </mesh>
                    </group>
                }>
                    <CarBodyGLB glbPath={carGlbPath} previewScale={carData.previewScale} />
                </Suspense>
            </mesh>

            {/* ── Wheels: physics only, invisible (car GLB has its own wheels) ── */}
            <mesh ref={wheel1Ref} visible={false}>
                <sphereGeometry args={[0.45, 8, 8]} />
                <meshStandardMaterial />
            </mesh>

            <mesh ref={wheel2Ref} visible={false}>
                <sphereGeometry args={[0.45, 8, 8]} />
                <meshStandardMaterial />
            </mesh>
        </group>
    );
}

// Only preload the default (starter) car at module load time.
// All other cars preload lazily: when equipped (Vehicle useEffect)
// or when selected in CarShop.
useGLTF.preload(GLB_BASE + DEFAULT_CAR + '.glb');

