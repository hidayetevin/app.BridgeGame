import { useEffect } from 'react';
import { useSphere } from '@react-three/cannon';
import { Mesh } from 'three';
import { useGameStore } from '../store/gameStore';

interface NodePhysicsProps {
    id: string;
    x: number;
    y: number;
    type: 'normal' | 'anchor';
}

const NodePhysics = ({ id, x, y, type }: NodePhysicsProps) => {
    const isAnchor = type === 'anchor';
    const { registerPhysicsBody, unregisterPhysicsBody } = useGameStore();

    const [ref, api] = useSphere(() => ({
        mass: isAnchor ? 0 : 0.5,
        position: [x, y, 0],
        args: [isAnchor ? 0.3 : 0.2],
        type: isAnchor ? 'Static' : 'Dynamic',
        collisionFilterGroup: 8, // Nodes Group
        collisionFilterMask: 0,  // No collision with anything
    }));

    // Register physics body REF and API
    useEffect(() => {
        registerPhysicsBody(id, ref, api);
        return () => unregisterPhysicsBody(id);
    }, [id, ref, api, registerPhysicsBody, unregisterPhysicsBody]);

    return (
        <mesh ref={ref as React.Ref<Mesh>}>
            <sphereGeometry args={[isAnchor ? 0.3 : 0.2, 16, 16]} />
            <meshStandardMaterial
                color={isAnchor ? '#8b4513' : '#2196f3'}
            />
        </mesh>
    );
};

export default NodePhysics;
