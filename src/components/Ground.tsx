import { useBox } from '@react-three/cannon';
import { Mesh } from 'three';

interface GroundProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
}

export default function Ground({ x, y, width, height, color = '#4CAF50' }: GroundProps) {
    // Static physics body (mass = 0)
    const [ref] = useBox(() => ({
        mass: 0,
        position: [x, y, 0],
        args: [width, height, 5],
        type: 'Static',
        friction: 0.8, // High friction for tires

        collisionFilterGroup: 1, // Group 1: Ground
        collisionFilterMask: 2,  // Only collide with Vehicle (2). Ignore Beams and Nodes.
    }));

    return (
        <mesh ref={ref as React.Ref<Mesh>}>
            <boxGeometry args={[width, height, 5]} />
            <meshStandardMaterial color={color} />
            {/* Top green grass layer visual */}
            <mesh position={[0, height / 2 + 0.1, 0]}>
                <boxGeometry args={[width, 0.2, 5]} />
                <meshStandardMaterial color="#81C784" />
            </mesh>
        </mesh>
    );
}
