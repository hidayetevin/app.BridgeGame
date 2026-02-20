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
    screen: 'menu' | 'game' | 'settings';
    language: 'en' | 'tr';
    mode: 'editor' | 'simulation';
    budget: number;
    spent: number;
    levelIndex: number;
    levelStars: Record<number, number>;
}

export interface LevelData {
    id: number;
    name: string;
    budget: number;
    anchors: Array<{ x: number; y: number }>;
    vehicleStart: { x: number; y: number };
    vehicleTarget: number;
    waterLevel: number;
    gap: number;
    platformLeftX: number;
    platformRightX: number;
    platformY: number;
    platformWidth: number;
    timeLimit: number; // Seconds
}
