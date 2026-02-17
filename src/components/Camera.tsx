import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useEffect } from 'react';

export default function Camera() {
    const { camera } = useThree();

    useEffect(() => {
        // Set initial camera position and zoom
        camera.position.set(0, 5, 20);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    return (
        <OrthographicCamera
            makeDefault
            zoom={50}
            position={[0, 5, 20]}
            near={0.1}
            far={1000}
        />
    );
}
