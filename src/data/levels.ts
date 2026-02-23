export interface LevelData {
    id: number;
    name: string;
    budget: number;
    anchors: Array<{ x: number; y: number }>;
    vehicleStart: { x: number; y: number };
    vehicleTarget: number;
    waterLevel: number;
    gap: number;
    platformLeftX: number; // Center X of left platform
    platformRightX: number; // Center X of right platform
    platformY: number;      // Y position of platform surface
    platformWidth: number;
    timeLimit: number;
}

export const LEVELS: LevelData[] = [
    {
        id: 1,
        name: 'Tutorial Bridge',
        budget: 500,
        anchors: [
            { x: -4.5, y: -2 },
            { x: 4.5, y: -2 },
        ],
        vehicleStart: { x: -12, y: -1 },
        vehicleTarget: 6,       // just past the right anchor (4.5) — bridge cleared ✓
        waterLevel: -6,
        gap: 9,
        platformLeftX: -14.5,
        platformRightX: 14.5,
        platformY: -2,
        platformWidth: 20,
        timeLimit: 10
    },
    {
        id: 2,
        name: 'The Valley',
        budget: 800,
        anchors: [
            { x: -7, y: 0 },
            { x: 7, y: 0 },
        ],
        vehicleStart: { x: -14, y: 1 },
        vehicleTarget: 9,       // just past right anchor (7)
        waterLevel: -6,
        gap: 14,
        platformLeftX: -17,
        platformRightX: 17,
        platformY: 0,
        platformWidth: 20,
        timeLimit: 10
    },
    {
        id: 3,
        name: 'Canyon Crossing',
        budget: 1200,
        anchors: [
            { x: -9, y: 2 },
            { x: 9, y: 2 },
        ],
        vehicleStart: { x: -16, y: 3 },
        vehicleTarget: 11,      // just past right anchor (9)
        waterLevel: -8,
        gap: 18,
        platformLeftX: -19,
        platformRightX: 19,
        platformY: 2,
        platformWidth: 20,
        timeLimit: 10
    },
];

