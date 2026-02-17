import { create } from 'zustand';
import { Node, Beam, MaterialType, GameState } from '../types';
import { LEVELS } from '../data/levels';

interface PhysicsBodyData {
    ref: any; // RefObject (for constraints)
    api: any; // Cannon API (for position/velocity)
}

interface GameStore {
    // Graph Data
    nodes: Node[];
    beams: Beam[];

    // Game State
    gameState: GameState;

    // Construction State
    selectedNodeId: string | null;
    isDrawingBeam: boolean;
    ghostBeamEnd: { x: number; y: number } | null;
    selectedMaterial: MaterialType; // New State

    // Physics State
    physicsBodies: Map<string, PhysicsBodyData>;
    brokenBeamIds: Set<string>;

    // Win/Loss State
    hasWon: boolean;
    hasLost: boolean;

    // Actions - Nodes
    addNode: (x: number, y: number, type?: 'normal' | 'anchor') => void;
    removeNode: (id: string) => void;
    getNodeById: (id: string) => Node | undefined;
    getNodeAt: (x: number, y: number) => Node | undefined;

    // Actions - Beams
    addBeam: (startNodeId: string, endNodeId: string, material: MaterialType) => void;
    removeBeam: (id: string) => void;
    getBeamBetween: (nodeId1: string, nodeId2: string) => Beam | undefined;
    breakBeam: (id: string) => void;

    // Actions - Construction
    startDrawingBeam: (nodeId: string) => void;
    updateGhostBeam: (x: number, y: number) => void;
    finishDrawingBeam: (endNodeId: string, material: MaterialType) => void;
    cancelDrawingBeam: () => void;
    selectMaterial: (material: MaterialType) => void; // New Action

    // Actions - Physics
    registerPhysicsBody: (nodeId: string, ref: any, api: any) => void;
    unregisterPhysicsBody: (nodeId: string) => void;
    getPhysicsBody: (nodeId: string) => PhysicsBodyData | undefined;

    // Actions - Game State
    setMode: (mode: 'editor' | 'simulation') => void;
    setWin: () => void;
    setLoss: () => void;
    loadLevel: (levelIndex: number) => void;
    resetLevel: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial State
    nodes: [],
    beams: [],
    gameState: {
        mode: 'editor',
        budget: 1000,
        spent: 0,
        levelIndex: 0,
    },
    selectedNodeId: null,
    isDrawingBeam: false,
    ghostBeamEnd: null,
    selectedMaterial: 'road', // Default material
    physicsBodies: new Map(),
    brokenBeamIds: new Set(),
    hasWon: false,
    hasLost: false,

    // Node Actions
    addNode: (x, y, type = 'normal') => {
        const newNode: Node = {
            id: `node_${Date.now()}_${Math.random()}`,
            x,
            y,
            type,
        };
        set((state) => ({ nodes: [...state.nodes, newNode] }));
    },

    removeNode: (id) => {
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            beams: state.beams.filter((b) => b.startNodeId !== id && b.endNodeId !== id),
        }));
        get().unregisterPhysicsBody(id);
    },

    getNodeById: (id) => {
        return get().nodes.find((n) => n.id === id);
    },

    getNodeAt: (x, y) => {
        return get().nodes.find((n) => n.x === x && n.y === y);
    },

    // Beam Actions
    addBeam: (startNodeId, endNodeId, material) => {
        if (get().getBeamBetween(startNodeId, endNodeId)) return;

        // Check budget logic would go here

        const newBeam: Beam = {
            id: `beam_${Date.now()}_${Math.random()}`,
            startNodeId,
            endNodeId,
            material,
        };
        set((state) => ({ beams: [...state.beams, newBeam] }));
    },

    removeBeam: (id) => {
        set((state) => ({
            beams: state.beams.filter((b) => b.id !== id),
        }));
    },

    getBeamBetween: (nodeId1, nodeId2) => {
        return get().beams.find(
            (b) =>
                (b.startNodeId === nodeId1 && b.endNodeId === nodeId2) ||
                (b.startNodeId === nodeId2 && b.endNodeId === nodeId1)
        );
    },

    breakBeam: (id) => {
        set((state) => ({
            brokenBeamIds: new Set([...state.brokenBeamIds, id]),
            beams: state.beams.filter((b) => b.id !== id),
        }));
    },

    // Construction Actions
    startDrawingBeam: (nodeId) => {
        set({
            selectedNodeId: nodeId,
            isDrawingBeam: true,
            ghostBeamEnd: null,
        });
    },

    updateGhostBeam: (x, y) => {
        set({ ghostBeamEnd: { x, y } });
    },

    finishDrawingBeam: (endNodeId) => {
        const { selectedNodeId, addBeam, selectedMaterial } = get();
        if (selectedNodeId && endNodeId && selectedNodeId !== endNodeId) {
            addBeam(selectedNodeId, endNodeId, selectedMaterial);
        }
        set({
            selectedNodeId: null,
            isDrawingBeam: false,
            ghostBeamEnd: null,
        });
    },

    cancelDrawingBeam: () => {
        set({
            selectedNodeId: null,
            isDrawingBeam: false,
            ghostBeamEnd: null,
        });
    },

    selectMaterial: (material) => {
        set({ selectedMaterial: material });
    },

    // Physics Actions
    registerPhysicsBody: (nodeId, ref, api) => {
        const bodies = get().physicsBodies;
        bodies.set(nodeId, { ref, api });
        set({ physicsBodies: new Map(bodies) });
    },

    unregisterPhysicsBody: (nodeId) => {
        const bodies = get().physicsBodies;
        bodies.delete(nodeId);
        set({ physicsBodies: new Map(bodies) });
    },

    getPhysicsBody: (nodeId) => {
        return get().physicsBodies.get(nodeId);
    },

    // Game State Actions
    setMode: (mode) => {
        set((state) => ({
            gameState: { ...state.gameState, mode },
            brokenBeamIds: new Set(),
            hasWon: false,
            hasLost: false,
        }));
    },

    setWin: () => {
        set({ hasWon: true });
    },

    setLoss: () => {
        set({ hasLost: true });
    },

    loadLevel: (levelIndex) => {
        const level = LEVELS[levelIndex];
        if (!level) return;

        set({
            nodes: [],
            beams: [],
            selectedNodeId: null,
            isDrawingBeam: false,
            ghostBeamEnd: null,
            physicsBodies: new Map(), // Updated property name
            brokenBeamIds: new Set(),
            hasWon: false,
            hasLost: false,
            gameState: {
                mode: 'editor',
                budget: level.budget,
                spent: 0,
                levelIndex,
            },
        });

        // Add anchor nodes from level data
        const { addNode } = get();
        level.anchors.forEach((anchor) => {
            addNode(anchor.x, anchor.y, 'anchor');
        });
    },

    resetLevel: () => {
        const currentLevel = get().gameState.levelIndex;
        get().loadLevel(currentLevel);
    },
}));
