import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Vector2, Plane } from 'three';
import { snapToGrid } from '../utils/snapToGrid';
import { useGameStore } from '../store/gameStore';

interface CursorProps {
    offsetY?: number;
}

export default function Cursor({ offsetY = 0 }: CursorProps) {
    const { camera, size, gl } = useThree();
    const [gridPosition, setGridPosition] = useState(new Vector3(0, 0, 0));
    const [isVisible, setIsVisible] = useState(false);

    const raycaster = useRef(new Raycaster());
    const mouse = useRef(new Vector2());
    const plane = useRef(new Plane(new Vector3(0, 0, 1), 0));

    const {
        addNode,
        getNodeAt,
        getNearestNode,
        startDrawingBeam,
        isDrawingBeam,
        updateGhostBeam,
        finishDrawingBeam,
        cancelDrawingBeam,
        selectedNodeId,
    } = useGameStore();

    useFrame(() => {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersection = new Vector3();
        raycaster.current.ray.intersectPlane(plane.current, intersection);

        if (intersection) {
            const snappedX = snapToGrid(intersection.x);
            const snappedY = snapToGrid(intersection.y);

            setGridPosition(new Vector3(snappedX, snappedY + offsetY, 0));

            // Update ghost beam if drawing
            if (isDrawingBeam) {
                updateGhostBeam(snappedX, snappedY);
            }
        }
    });

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            mouse.current.x = (event.clientX / size.width) * 2 - 1;
            mouse.current.y = -(event.clientY / size.height) * 2 + 1;
            setIsVisible(true);
        };

        const handlePointerLeave = () => {
            setIsVisible(false);
        };

        // 🧲 BASMACA MIKNATIS - ON PRESS (Çizime başlama)
        // Parmak ekrana değdiği anda, 1.5 birim yarıçap içindeki en yakın düğümü bulup oradan çizmeye başlar.
        // Böylece tam düğüme basmak gerekmez, yakınına basmak yeter.
        const handlePointerDown = (event: PointerEvent) => {
            if (isDrawingBeam) return; // Zaten çiziyorsa müdahale etme

            // Ekran koordinatlarından 3D dünya koordinatlarına çevir
            const nx = (event.clientX / size.width) * 2 - 1;
            const ny = -(event.clientY / size.height) * 2 + 1;

            const tempRay = new Raycaster();
            tempRay.setFromCamera({ x: nx, y: ny } as any, camera);
            const hit = new Vector3();
            tempRay.ray.intersectPlane(plane.current, hit);

            if (hit) {
                const nearest = getNearestNode(hit.x, hit.y, 1.5);
                if (nearest) {
                    startDrawingBeam(nearest.id);
                }
            }
        };

        const handlePointerUp = () => {
            if (isDrawingBeam) {
                let finalX = gridPosition.x;
                let finalY = gridPosition.y;

                // 🧲 MIKNATIS ETKİSİ / SADECE BIRAKINCA - ON DROP
                // Parmağı havaya kaldırdığınız an: çevredeki tam 5x5 (~2 birim yarıçap) alan taranır. 
                // Hedefte önceden atılmış mavi bir düğüm (Node) varsa anında ona yapışır.
                const nearest = getNearestNode(finalX, finalY, 1.5);
                if (nearest && nearest.id !== selectedNodeId) {
                    finalX = nearest.x;
                    finalY = nearest.y;
                }

                const targetNode = getNodeAt(finalX, finalY);

                if (targetNode && targetNode.id !== selectedNodeId) {
                    // Finish beam on existing node
                    finishDrawingBeam(targetNode.id);
                } else if (!targetNode) {
                    // Create new node and finish beam
                    addNode(finalX, finalY);
                    const newNode = getNodeAt(finalX, finalY);
                    if (newNode) {
                        finishDrawingBeam(newNode.id);
                    }
                } else {
                    // Cancel if same node
                    cancelDrawingBeam();
                }
            }
        };

        const canvas = gl.domElement;
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerleave', handlePointerLeave);
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
        };
    }, [size, gl, camera, isDrawingBeam, gridPosition, getNodeAt, getNearestNode, startDrawingBeam, addNode, finishDrawingBeam, cancelDrawingBeam, selectedNodeId]);

    if (!isVisible) return null;

    return (
        <group position={gridPosition}>
            <mesh>
                <boxGeometry args={[0.8, 0.8, 0.2]} />
                <meshStandardMaterial
                    color={isDrawingBeam ? '#4CAF50' : '#ffd93d'}
                    transparent
                    opacity={0.6}
                    emissive={isDrawingBeam ? '#4CAF50' : '#ffd93d'}
                    emissiveIntensity={0.3}
                />
            </mesh>

            <mesh position={[0, 0, 0.15]}>
                <ringGeometry args={[0.3, 0.4, 16]} />
                <meshBasicMaterial
                    color={isDrawingBeam ? '#4CAF50' : '#000000'}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    );
}
