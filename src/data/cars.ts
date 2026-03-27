// All purchasable vehicles from Kenney Car Kit
// price: cost in stars (totalStarsEarned)
// 0 = free / starter

export interface CarData {
    id: string;          // matches GLB filename without extension
    glbPath: string;     // full path for useGLTF
    name: string;        // display name (tr)
    nameEn: string;      // display name (en)
    price: number;       // stars required to unlock (0 = free)
    emoji: string;       // fallback icon
    category: 'car' | 'truck' | 'special' | 'kart';
    // Rotation/scale/offset to look good in the preview canvas
    previewRotY: number;
    previewScale: number;
}

const BASE = '/models/GLB format/';

export const CARS: CarData[] = [
    // ── Free starter ────────────────────────────────────
    {
        id: 'sedan-sports',
        glbPath: BASE + 'sedan-sports.glb',
        name: 'Spor Sedan',
        nameEn: 'Sports Sedan',
        price: 0,
        emoji: '🚗',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.4,
    },

    // ── Cars ────────────────────────────────────────────
    {
        id: 'sedan',
        glbPath: BASE + 'sedan.glb',
        name: 'Sedan',
        nameEn: 'Sedan',
        price: 5,
        emoji: '🚙',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.4,
    },
    {
        id: 'hatchback-sports',
        glbPath: BASE + 'hatchback-sports.glb',
        name: 'Spor Hatchback',
        nameEn: 'Sports Hatchback',
        price: 8,
        emoji: '🚗',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.4,
    },
    {
        id: 'suv',
        glbPath: BASE + 'suv.glb',
        name: 'SUV',
        nameEn: 'SUV',
        price: 10,
        emoji: '🚙',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.2,
    },
    {
        id: 'suv-luxury',
        glbPath: BASE + 'suv-luxury.glb',
        name: 'Lüks SUV',
        nameEn: 'Luxury SUV',
        price: 20,
        emoji: '🚙',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.2,
    },
    {
        id: 'race',
        glbPath: BASE + 'race.glb',
        name: 'Yarış Arabası',
        nameEn: 'Race Car',
        price: 25,
        emoji: '🏎️',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.6,
    },
    {
        id: 'race-future',
        glbPath: BASE + 'race-future.glb',
        name: 'Fütüristik Yarışçı',
        nameEn: 'Future Racer',
        price: 40,
        emoji: '🏎️',
        category: 'car',
        previewRotY: Math.PI / 4,
        previewScale: 1.6,
    },

    // ── Special / Service ───────────────────────────────
    {
        id: 'police',
        glbPath: BASE + 'police.glb',
        name: 'Polis Arabası',
        nameEn: 'Police Car',
        price: 15,
        emoji: '🚓',
        category: 'special',
        previewRotY: Math.PI / 4,
        previewScale: 1.4,
    },
    {
        id: 'taxi',
        glbPath: BASE + 'taxi.glb',
        name: 'Taksi',
        nameEn: 'Taxi',
        price: 12,
        emoji: '🚕',
        category: 'special',
        previewRotY: Math.PI / 4,
        previewScale: 1.4,
    },
    {
        id: 'ambulance',
        glbPath: BASE + 'ambulance.glb',
        name: 'Ambulans',
        nameEn: 'Ambulance',
        price: 18,
        emoji: '🚑',
        category: 'special',
        previewRotY: Math.PI / 4,
        previewScale: 1.1,
    },
    {
        id: 'firetruck',
        glbPath: BASE + 'firetruck.glb',
        name: 'İtfaiye',
        nameEn: 'Fire Truck',
        price: 22,
        emoji: '🚒',
        category: 'truck',
        previewRotY: Math.PI / 4,
        previewScale: 0.9,
    },

    // ── Trucks ───────────────────────────────────────────
    {
        id: 'van',
        glbPath: BASE + 'van.glb',
        name: 'Minibüs',
        nameEn: 'Van',
        price: 12,
        emoji: '🚐',
        category: 'truck',
        previewRotY: Math.PI / 4,
        previewScale: 1.2,
    },
    {
        id: 'delivery',
        glbPath: BASE + 'delivery.glb',
        name: 'Kargo Aracı',
        nameEn: 'Delivery Van',
        price: 15,
        emoji: '🚚',
        category: 'truck',
        previewRotY: Math.PI / 4,
        previewScale: 1.1,
    },
    {
        id: 'truck',
        glbPath: BASE + 'truck.glb',
        name: 'Kamyon',
        nameEn: 'Truck',
        price: 30,
        emoji: '🚛',
        category: 'truck',
        previewRotY: Math.PI / 4,
        previewScale: 0.9,
    },
    {
        id: 'garbage-truck',
        glbPath: BASE + 'garbage-truck.glb',
        name: 'Çöp Kamyonu',
        nameEn: 'Garbage Truck',
        price: 20,
        emoji: '🗑️',
        category: 'truck',
        previewRotY: Math.PI / 4,
        previewScale: 0.9,
    },
    {
        id: 'tractor',
        glbPath: BASE + 'tractor.glb',
        name: 'Traktör',
        nameEn: 'Tractor',
        price: 18,
        emoji: '🚜',
        category: 'special',
        previewRotY: Math.PI / 4,
        previewScale: 1.3,
    },

    // ── Karts ────────────────────────────────────────────
    {
        id: 'kart-oopi',
        glbPath: BASE + 'kart-oopi.glb',
        name: 'Go-Kart',
        nameEn: 'Go-Kart',
        price: 6,
        emoji: '🏎️',
        category: 'kart',
        previewRotY: Math.PI / 4,
        previewScale: 2.0,
    },
    {
        id: 'kart-oozi',
        glbPath: BASE + 'kart-oozi.glb',
        name: 'Kart Oozi',
        nameEn: 'Kart Oozi',
        price: 6,
        emoji: '🏎️',
        category: 'kart',
        previewRotY: Math.PI / 4,
        previewScale: 2.0,
    },
];

export const CAR_GLB_BASE = BASE;
