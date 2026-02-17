import { MaterialType } from '../types';

export interface MaterialProps {
    name: string;
    color: string;
    cost: number;
    strength: number;      // Max force before breaking (Newtons)
    stiffness: number;     // For physics constraint
    thickness: number;
    isRoad: boolean;       // Determines collision mask
}

export const MATERIALS: Record<MaterialType, MaterialProps> = {
    road: {
        name: 'Asphalt Road',
        color: '#343a40', // Dark Asphalt
        cost: 100,
        strength: 500000, // 500k
        stiffness: 5e5, // Stiffer
        thickness: 0.25, // Thick road surface
        isRoad: true,
    },
    wood: {
        name: 'Wood Beam',
        color: '#8B4513', // Brown
        cost: 10,
        strength: 100000, // 100k
        stiffness: 2e5, // Very flexible
        thickness: 0.12, // Standard beam
        isRoad: false,
    },
    steel: {
        name: 'Steel Beam',
        color: '#708090', // Grey
        cost: 50,
        strength: 2000000, // 2 Million! Super strong
        stiffness: 2e6, // Very Stiff
        thickness: 0.15,
        isRoad: false,
    },
    // Backward compatibility
    cable: {
        name: 'Cable',
        color: '#4A4A4A',
        cost: 5,
        strength: 8000,
        stiffness: 5e5,
        thickness: 0.05,
        isRoad: false,
    },
};

// Stress level colors (interpolation from green to red)
export function getStressColor(force: number, maxStrength: number): string {
    const ratio = Math.min(force / maxStrength, 1);

    if (ratio < 0.3) return '#4CAF50'; // Green - safe
    if (ratio < 0.6) return '#FFC107'; // Yellow - warning
    if (ratio < 0.8) return '#FF9800'; // Orange - danger
    return '#F44336'; // Red - critical
}
