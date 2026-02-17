import { MaterialType } from '../types';

export const MATERIALS: Record<MaterialType, {
    name: string;
    color: string;
    cost: number;
    strength: number;      // Max force before breaking (Newtons)
    stiffness: number;     // For physics constraint
    thickness: number;
}> = {
    wood: {
        name: 'Wood',
        color: '#8B4513',
        cost: 10,
        strength: 15000,
        stiffness: 1e6,
        thickness: 0.08,
    },
    steel: {
        name: 'Steel',
        color: '#708090',
        cost: 50,
        strength: 50000,
        stiffness: 5e6,
        thickness: 0.12,
    },
    cable: {
        name: 'Cable',
        color: '#4A4A4A',
        cost: 5,
        strength: 8000,
        stiffness: 5e5,
        thickness: 0.04,
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
