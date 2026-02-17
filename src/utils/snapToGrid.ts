import { Vector3 } from 'three';

/**
 * Snaps a coordinate to the nearest integer (grid unit)
 */
export function snapToGrid(value: number): number {
    return Math.round(value);
}

/**
 * Snaps a Vector3 to the nearest grid point
 */
export function snapVector3ToGrid(vector: Vector3): Vector3 {
    return new Vector3(
        snapToGrid(vector.x),
        snapToGrid(vector.y),
        snapToGrid(vector.z)
    );
}

/**
 * Checks if a position is within grid bounds
 */
export function isWithinGridBounds(x: number, y: number, maxBounds = 10): boolean {
    return Math.abs(x) <= maxBounds && Math.abs(y) <= maxBounds;
}
