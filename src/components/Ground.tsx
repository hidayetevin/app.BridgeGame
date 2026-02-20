import { useBox } from '@react-three/cannon';
import { Mesh } from 'three';
import GroundVisual from './GroundVisual';

interface GroundProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
}

export default function Ground({ x, y, width, height }: GroundProps) {
    // Static physics body (mass = 0)
    const [ref] = useBox(() => ({
        mass: 0,
        position: [x, y, 0],
        args: [width, height, 5],
        type: 'Static',
        friction: 0.8,
        collisionFilterGroup: 1,
        collisionFilterMask: 2,
    }));

    return (
        <group ref={ref as React.Ref<Mesh>}>
            <GroundVisual width={width} height={height} />
        </group>
    );
}
