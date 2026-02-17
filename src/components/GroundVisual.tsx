import { useState, useEffect, useMemo } from 'react';
import { TextureLoader, RepeatWrapping, Texture } from 'three';
import { useThree } from '@react-three/fiber';
import { getRoadTexture } from '../utils/roadTexture';

interface GroundVisualProps {
    width: number;
    height: number;
}

const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg';
let globalTexture: Texture | null = null;
let textureLoadingPromise: Promise<Texture> | null = null;

export default function GroundVisual({ width, height }: GroundVisualProps) {
    const gl = useThree((state) => state.gl);

    // Grass Texture State
    const [texture, setTexture] = useState<Texture | null>(null);

    // Road Texture (Procedural - shared utility)
    const roadTexture = useMemo(() => {
        const baseTex = getRoadTexture();
        if (baseTex) {
            const tex = baseTex.clone();
            tex.wrapS = RepeatWrapping;
            tex.wrapT = RepeatWrapping;
            // Repeat horizontally based on width (approx 1 dash cycle per 5 units)
            tex.repeat.set(width / 5, 1);
            const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
            tex.anisotropy = Math.min(16, maxAnisotropy);
            tex.needsUpdate = true;
            return tex;
        }
        return null;
    }, [width, gl]);

    useEffect(() => {
        const applyTextureSettings = (tex: Texture) => {
            const clonedTex = tex.clone();
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
                    color="#88ff88" // Green tint fallback/blend
                />
            </mesh>

            {/* Asphalt Road Layer on Top of Grass */}
            {roadTexture && (
                <mesh position={[0, height / 2 + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width, 3]} /> {/* Road width 3 units */}
                    <meshLambertMaterial
                        map={roadTexture}
                        color="#ffffff"
                        transparent
                        opacity={0.95}
                    />
                </mesh>
            )}
        </group>
    );
}
