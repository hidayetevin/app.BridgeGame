import { create } from 'zustand';
import { Node, Beam, MaterialType, GameState } from '../types';
import { LEVELS } from '../data/levels';
import { MATERIALS } from '../utils/materials';

interface PhysicsBodyData {
    ref: any; // RefObject (for constraints)
    api: any; // Cannon API (for position/velocity)
}

interface ActionRecord {
    type: 'add_beam' | 'remove_beam';
    addedNodes: Node[];
    addedBeams: Beam[];
    removedBeams: Beam[];
    costChange: number;
}

interface GameStore {
    // Graph Data
    nodes: Node[];
    beams: Beam[];
    history: ActionRecord[];

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

    // Timer State
    timeLeft: number;
    isTimerRunning: boolean;

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
    finishDrawingBeam: (endNodeId: string) => void;
    cancelDrawingBeam: () => void;
    selectMaterial: (material: MaterialType) => void;
    undo: () => void;
    recordAction: (type: 'add_beam' | 'remove_beam', addedNodes: Node[], addedBeams: Beam[], removedBeams: Beam[], costChange: number) => void;

    // Actions - Physics
    registerPhysicsBody: (nodeId: string, ref: any, api: any) => void;
    unregisterPhysicsBody: (nodeId: string) => void;
    getPhysicsBody: (nodeId: string) => PhysicsBodyData | undefined;

    // Actions - Timer
    setTime: (time: number) => void;
    decrementTime: () => void;
    stopTimer: () => void;

    // Actions - Game State
    setScreen: (screen: 'menu' | 'game' | 'settings') => void;
    setLanguage: (lang: 'en' | 'tr') => void;
    setMode: (mode: 'editor' | 'simulation') => void;
    setWon: (won: boolean) => void;
    setLost: (lost: boolean) => void;
    loadLevel: (index: number) => void;
    resetLevel: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial State
    nodes: [],
    beams: [],
    history: [],
    gameState: {
        screen: 'menu',
        language: 'tr',
        mode: 'editor',
        budget: 0,
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
    timeLeft: 0,
    isTimerRunning: false,

    // Node Actions
    addNode: (x, y, type = 'normal') => {
        // Normally nodes are added during drawing beams, but exposed just in case. 
        // We will not record isolated node additions unless they are part of a beam.
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

    recordAction: (type, addedNodes, addedBeams, removedBeams, costChange) => {
        set((state) => ({
            history: [...state.history, { type, addedNodes, addedBeams, removedBeams, costChange }]
        }));
    },

    // Beam Actions
    addBeam: (startNodeId, endNodeId, material) => {
        const state = get();
        if (state.getBeamBetween(startNodeId, endNodeId)) return;

        const startNode = state.getNodeById(startNodeId);
        const endNode = state.getNodeById(endNodeId);
        if (!startNode || !endNode) return;

        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const cost = length * MATERIALS[material].cost;

        if (state.gameState.spent + cost > state.gameState.budget) {
            console.warn('Budget exceeded!');
            return;
        }

        const newBeam: Beam = {
            id: `beam_${Date.now()}_${Math.random()}`,
            startNodeId,
            endNodeId,
            material,
        };

        set((prevState) => ({
            beams: [...prevState.beams, newBeam],
            gameState: {
                ...prevState.gameState,
                spent: prevState.gameState.spent + cost
            }
        }));

        get().recordAction('add_beam', [], [newBeam], [], cost);
    },

    removeBeam: (id) => {
        const state = get();
        const beam = state.beams.find((b) => b.id === id);
        if (!beam) return;

        const startNode = state.getNodeById(beam.startNodeId);
        const endNode = state.getNodeById(beam.endNodeId);

        // Calculate refund
        let refund = 0;
        if (startNode && endNode) {
            const dx = endNode.x - startNode.x;
            const dy = endNode.y - startNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            refund = length * MATERIALS[beam.material].cost;
        }

        set((prevState) => ({
            beams: prevState.beams.filter((b) => b.id !== id),
            gameState: {
                ...prevState.gameState,
                spent: Math.max(0, prevState.gameState.spent - refund)
            }
        }));

        get().recordAction('remove_beam', [], [], [beam], -refund);
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
            // Do NOT remove from beams array, so it stays visible (but broken)
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
        const { selectedNodeId, selectedMaterial, nodes, gameState } = get();

        if (selectedNodeId && endNodeId && selectedNodeId !== endNodeId) {
            const startNode = nodes.find(n => n.id === selectedNodeId);
            const endNode = nodes.find(n => n.id === endNodeId);

            if (startNode && endNode) {
                const dx = endNode.x - startNode.x;
                const dy = endNode.y - startNode.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const totalCost = dist * MATERIALS[selectedMaterial].cost;

                if (gameState.spent + totalCost > gameState.budget) {
                    console.warn('Budget exceeded!');
                    // Cancel drawing
                    set({
                        selectedNodeId: null,
                        isDrawingBeam: false,
                        ghostBeamEnd: null,
                    });
                    return;
                }

                const MAX_LEN = 3;

                // Only split if it's Road and longer than MAX_LEN
                if (selectedMaterial === 'road' && dist > MAX_LEN) {
                    // Normalize direction vector
                    const dirX = dx / dist;
                    const dirY = dy / dist;

                    let currentDist = 0;
                    let prevNodeId = startNode.id;
                    const newNodes: Node[] = [];
                    const newBeams: Beam[] = [];

                    // Step by MAX_LEN until close to end
                    while (currentDist + MAX_LEN < dist - 0.1) { // 0.1 tolerance
                        currentDist += MAX_LEN;

                        const newX = startNode.x + dirX * currentDist;
                        const newY = startNode.y + dirY * currentDist;

                        // Rounding to avoid float precision issues (snap to grid essentially if aligned)
                        // But let's keep it precise based on vector

                        let targetNodeId = `node_split_${Date.now()}_${currentDist}`;

                        // Check proximity to existing nodes
                        const existingNode = nodes.find(n => Math.abs(n.x - newX) < 0.1 && Math.abs(n.y - newY) < 0.1);

                        if (existingNode) {
                            targetNodeId = existingNode.id;
                        } else {
                            // First check in our newNodes list to avoid dupes in this batch
                            const alreadyCreated = newNodes.find(n => Math.abs(n.x - newX) < 0.1 && Math.abs(n.y - newY) < 0.1);
                            if (alreadyCreated) {
                                targetNodeId = alreadyCreated.id;
                            } else {
                                const newNode: Node = {
                                    id: targetNodeId,
                                    x: newX,
                                    y: newY,
                                    type: 'normal'
                                };
                                newNodes.push(newNode);
                            }
                        }

                        newBeams.push({
                            id: `beam_split_${Date.now()}_${currentDist}`,
                            startNodeId: prevNodeId,
                            endNodeId: targetNodeId,
                            material: selectedMaterial
                        });

                        prevNodeId = targetNodeId;
                    }

                    // Final beam to endNode (whatever remains)
                    newBeams.push({
                        id: `beam_split_${Date.now()}_last`,
                        startNodeId: prevNodeId,
                        endNodeId: endNodeId,
                        material: selectedMaterial
                    });

                    set(state => ({
                        nodes: [...state.nodes, ...newNodes],
                        beams: [...state.beams, ...newBeams],
                        gameState: {
                            ...state.gameState,
                            spent: state.gameState.spent + totalCost
                        }
                    }));

                    get().recordAction('add_beam', newNodes, newBeams, [], totalCost);

                } else {
                    // Normal creation (single beam)
                    // Let's create it manually so we can record it if it's not handled via split
                    if (!get().getBeamBetween(startNode.id, endNode.id)) {
                        const newBeam: Beam = {
                            id: `beam_${Date.now()}_${Math.random()}`,
                            startNodeId: startNode.id,
                            endNodeId: endNode.id,
                            material: selectedMaterial,
                        };

                        set((prevState) => ({
                            beams: [...prevState.beams, newBeam],
                            gameState: {
                                ...prevState.gameState,
                                spent: prevState.gameState.spent + totalCost
                            }
                        }));

                        get().recordAction('add_beam', [], [newBeam], [], totalCost);
                    }
                }
            }
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

    undo: () => {
        const { history, gameState } = get();
        if (history.length === 0 || gameState.mode !== 'editor') return;

        const lastAction = history[history.length - 1];
        set({ history: history.slice(0, -1) }); // Remove last action from history

        if (lastAction.type === 'add_beam') {
            // Undo add: remove the beams and nodes that were added
            const addedNodeIds = new Set(lastAction.addedNodes.map(n => n.id));
            const addedBeamIds = new Set(lastAction.addedBeams.map(b => b.id));

            set(state => ({
                nodes: state.nodes.filter(n => !addedNodeIds.has(n.id)),
                beams: state.beams.filter(b => !addedBeamIds.has(b.id)),
                gameState: {
                    ...state.gameState,
                    spent: Math.max(0, state.gameState.spent - lastAction.costChange)
                }
            }));
        } else if (lastAction.type === 'remove_beam') {
            // Undo remove: add the beams back (nodes are never removed completely on beam clear unless isolated, but we didn't wipe nodes)
            set(state => ({
                beams: [...state.beams, ...lastAction.removedBeams],
                gameState: {
                    ...state.gameState,
                    spent: state.gameState.spent - lastAction.costChange // costChange for removed is negative, subtracting it adds to cost
                }
            }));
        }
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

    // Timer Actions
    setTime: (time) => set({ timeLeft: time }),
    decrementTime: () => {
        const { timeLeft, hasWon, hasLost } = get();

        // If already over, stop
        if (hasWon || hasLost) {
            set({ isTimerRunning: false });
            return;
        }

        if (timeLeft > 0) {
            const newTime = timeLeft - 1;
            set({ timeLeft: newTime });

            // Check immediately if time is up
            if (newTime === 0) {
                set({ hasLost: true, isTimerRunning: false });
            }
        }
    },
    stopTimer: () => set({ isTimerRunning: false }),

    // Game State Actions
    setScreen: (screen) => set((state) => ({ gameState: { ...state.gameState, screen } })),
    setLanguage: (language) => set((state) => ({ gameState: { ...state.gameState, language } })),
    setMode: (mode) => {
        set((state) => {
            // Find current level time limit
            const currentLevel = LEVELS[state.gameState.levelIndex];
            const timeLimit = currentLevel?.timeLimit || 30;

            return {
                gameState: { ...state.gameState, mode },
                physicsBodies: mode === 'editor' ? new Map() : state.physicsBodies,
                brokenBeamIds: mode === 'editor' ? new Set() : state.brokenBeamIds,
                hasWon: false,
                hasLost: false,
                // Timer Logic: Start on simulation, stop on editor
                timeLeft: mode === 'simulation' ? timeLimit : 0,
                isTimerRunning: mode === 'simulation',
            };
        });
    },

    setWon: (won) => {
        const { hasLost } = get();
        if (!hasLost) {
            set({ hasWon: won, isTimerRunning: false });
        }
    },
    setLost: (lost) => {
        const { hasWon } = get();
        if (!hasWon) {
            set({ hasLost: lost, isTimerRunning: false });
        }
    },

    loadLevel: (index) => {
        const level = LEVELS[index];
        if (!level) return;

        set({
            nodes: [],
            beams: [],
            history: [],
            selectedNodeId: null,
            isDrawingBeam: false,
            ghostBeamEnd: null,
            physicsBodies: new Map(), // Updated property name
            brokenBeamIds: new Set(),
            hasWon: false,
            hasLost: false,
            timeLeft: 0,
            isTimerRunning: false,
            gameState: {
                screen: get().gameState?.screen || 'menu',
                language: get().gameState?.language || 'tr',
                mode: 'editor',
                budget: level.budget,
                spent: 0,
                levelIndex: index,
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
