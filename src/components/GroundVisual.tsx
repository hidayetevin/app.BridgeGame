import { useState, useEffect, useRef } from 'react';
import { TextureLoader, RepeatWrapping, Texture } from 'three';
import { useThree } from '@react-three/fiber';

interface GroundVisualProps {
    width: number;
    height: number;
}

const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg';
let globalTexture: Texture | null = null;
let textureLoadingPromise: Promise<Texture> | null = null;

export default function GroundVisual({ width, height }: GroundVisualProps) {
    const gl = useThree((state) => state.gl);
    const [texture, setTexture] = useState<Texture | null>(null);
    const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg';

    useEffect(() => {
        const applyTextureSettings = (tex: Texture) => {
            const clonedTex = tex.clone(); // Clone is crucial for independent repeat settings
            clonedTex.wrapS = clonedTex.wrapT = RepeatWrapping;
            clonedTex.repeat.set(width / 4, height / 4);
            const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
            clonedTex.anisotropy = Math.min(16, maxAnisotropy);
            clonedTex.needsUpdate = true;
            setTexture(clonedTex);
        };

        if (globalTexture) {
            applyTextureSettings(globalTexture);
        } else {
            if (!textureLoadingPromise) {
                textureLoadingPromise = new Promise((resolve, reject) => {
                    new TextureLoader().load(
                        textureUrl,
                        (loadedTex) => {
                            globalTexture = loadedTex;
                            resolve(loadedTex);
                        },
                        undefined,
                        reject
                    );
                });
            }

            textureLoadingPromise
                .then(applyTextureSettings)
                .catch((err) => console.warn('Texture load failed', err));
        }
    }, [width, height, gl]);

    return (
        <group>
            {/* Base Soil Mesh (Side/Bottom) */}
            <mesh>
                <boxGeometry args={[width, height, 5]} />
                <meshLambertMaterial color="#5D4037" />
            </mesh>

            {/* Grass Layer on Top */}
            <mesh position={[0, height / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width, 5]} />
                <meshLambertMaterial
                    map={texture}
                    color="#88ff88" // Always green tint, texture adds detail
                />
            </mesh>
        </group>
    );
}
