import { CanvasTexture, RepeatWrapping } from 'three';

// Singleton texture instance to allow cloning
let cachedRoadTexture: CanvasTexture | null = null;

export function getRoadTexture(): CanvasTexture | null {
    if (typeof document === 'undefined') return null;

    // Return cached master texture if exists
    if (cachedRoadTexture) {
        return cachedRoadTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // 1. Asphalt Background (Dark Blue-Grey)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 512, 512);

        // 2. Heavy Noise/Grain
        for (let i = 0; i < 100000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#34495e' : '#1a252f';
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // 3. Side Lines (Solid White)
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 12;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(512, 15);
        ctx.moveTo(0, 497);
        ctx.lineTo(512, 497);
        ctx.stroke();

        // 4. Center Line (Dashed Yellow)
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 14;
        ctx.setLineDash([50, 40]);
        ctx.beginPath();
        // Since beams are rotated, we need to map X to length.
        // Texture maps u (x) from 0 to 1.
        ctx.moveTo(0, 256);
        ctx.lineTo(512, 256);
        ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    cachedRoadTexture = texture;
    return texture;
}
