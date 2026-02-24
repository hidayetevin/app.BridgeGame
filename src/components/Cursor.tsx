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
            let snappedX = snapToGrid(intersection.x);
            let snappedY = snapToGrid(intersection.y);

            // 🧲 MIKNATIS ETKİSİ / MAGNETISM (USER EXPERIENCE)
            // Eğer yeni bir hat çekiliyorsa (isDrawingBeam), kullanıcının parmağı nerede olursa olsun, 
            // 3 birim (yaklaşık 7x7 grid alanı) etrafında bir düğüm (Node) varsa otomatik olarak o düğüme kilitlen ("Snap").
            if (isDrawingBeam) {
                // 3.0 birim yarıçap çok geniş ve esnek bir dokunmatik alan (yaklaşık 60x60 piksel parmak ucu payı) sağlar
                const nearest = getNearestNode(intersection.x, intersection.y, 3.0);
                if (nearest && nearest.id !== selectedNodeId) {
                    snappedX = nearest.x;
                    snappedY = nearest.y;
                }
            }

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

        const handlePointerUp = () => {
            if (isDrawingBeam) {
                const x = gridPosition.x;
                const y = gridPosition.y;
                const targetNode = getNodeAt(x, y);

                if (targetNode && targetNode.id !== selectedNodeId) {
                    // Finish beam on existing node
                    finishDrawingBeam(targetNode.id);
                } else if (!targetNode) {
                    // Create new node and finish beam
                    addNode(x, y);
                    const newNode = getNodeAt(x, y);
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
        canvas.addEventListener('pointerup', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
            canvas.removeEventListener('pointerup', handlePointerUp);
        };
    }, [size, gl, isDrawingBeam, gridPosition, getNodeAt, getNearestNode, addNode, finishDrawingBeam, cancelDrawingBeam, selectedNodeId]);

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
