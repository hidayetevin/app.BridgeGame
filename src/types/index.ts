export type MaterialType = 'road' | 'wood' | 'steel' | 'cable'; // Keeping cable for backward compat if needed, but UI will show Road/Wood/Steel

export interface Node {
    id: string;
    x: number;
    y: number;
    type: 'normal' | 'anchor';
}

export interface Beam {
    id: string;
    startNodeId: string;
    endNodeId: string;
    material: MaterialType;
}

export interface GameState {
    screen: 'menu' | 'game' | 'settings' | 'shop';
    language: 'en' | 'tr';
    mode: 'editor' | 'simulation';
    budget: number;
    spent: number;
    levelIndex: number;
    levelStars: Record<number, number>;   // Per-level best score (1-3), for display
    totalStarsEarned: number;             // Accumulated star currency (can exceed 3× levels)
    budgetExceeded: boolean;
    equippedCar: string;                  // ID of currently active car
    ownedCars: string[];                  // IDs of purchased cars
}

export interface LevelData {
    id: number;
    name: string;
    budget: number;
    anchors: Array<{ x: number; y: number }>;
    vehicleStart: { x: number; y: number };
    vehicleTarget: number;
    waterLevel: number;
    platforms: Array<{ x: number; y: number; width: number }>;
    timeLimit: number; // Seconds
}
