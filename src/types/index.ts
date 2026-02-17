// Type definitions for the Bridge Constructor game

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

export type MaterialType = 'wood' | 'steel' | 'cable';

export interface MaterialProperties {
    name: string;
    color: string;
    cost: number;
    strength: number; // Max force before breaking
    stiffness: number; // For physics constraint
}

export interface GameState {
    mode: 'editor' | 'simulation';
    budget: number;
    spent: number;
    levelIndex: number;
}

export interface LevelData {
    id: number;
    name: string;
    budget: number;
    anchors: Array<{ x: number; y: number }>;
    startX: number;
    targetX: number;
    waterLevel: number;
}
