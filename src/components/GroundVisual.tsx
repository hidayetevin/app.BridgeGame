import { useState, useEffect, useMemo } from 'react';
import { TextureLoader, RepeatWrapping, Texture, CanvasTexture } from 'three';
import { useThree } from '@react-three/fiber';

interface GroundVisualProps {
    width: number;
    height: number;
}

const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg';
let globalTexture: Texture | null = null;
let textureLoadingPromise: Promise<Texture> | null = null;

// Generate Asphalt Road Texture with Stripes
function createRoadTexture() {
    // Check for SSR/Server environment just in case
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // 1. Asphalt Background (Dark Grey)
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, 512, 512);

        // 2. Noise/Grain for Asphalt realism
        for (let i = 0; i < 50000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#3a3a3a' : '#2a2a2a';
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // 3. White Dashed Line (Center)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 15;
        ctx.setLineDash([40, 40]); // Dash pattern
        ctx.beginPath();
        // Draw line horizontally across the middle of texture (representing road length)
        // Since we map this to a plane scaled by width, 'X' is length, 'Y' is width of road
        ctx.moveTo(0, 256);
        ctx.lineTo(512, 256);
        ctx.stroke();

        // 4. Side Lines (Borders/Pavement edge)
        ctx.strokeStyle = '#555555'; // Grey border
        ctx.lineWidth = 10;
        ctx.setLineDash([]); // Solid line
        ctx.beginPath();
        // Top Border
        ctx.moveTo(0, 10);
        ctx.lineTo(512, 10);
        // Bottom Border
        ctx.moveTo(0, 502);
        ctx.lineTo(512, 502);
        ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
}

export default function GroundVisual({ width, height }: GroundVisualProps) {
    const gl = useThree((state) => state.gl);

    // Grass Texture State
    const [texture, setTexture] = useState<Texture | null>(null);

    // Road Texture (Procedural - generated once per width change)
    const roadTexture = useMemo(() => {
        const tex = createRoadTexture();
        if (tex) {
            tex.wrapS = RepeatWrapping;
            tex.wrapT = RepeatWrapping;
            // Repeat horizontally based on width (approx 1 dash cycle per 5 units)
            // Y-repeat is 1 because the road strip covers the full specific mesh height
            tex.repeat.set(width / 5, 1);
            const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
            tex.anisotropy = Math.min(16, maxAnisotropy);
            tex.needsUpdate = true;
        }
        return tex;
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
