import fs from 'fs';
import path from 'path';

const levels = [];
let idCounter = 1;

function createLevel(name, budget, anchors, vehicleStart, vehicleTarget, waterLevel, platforms, timeLimit = 15) {
    levels.push({
        id: idCounter++,
        name,
        budget,
        anchors,
        vehicleStart,
        vehicleTarget,
        waterLevel,
        platforms,
        timeLimit
    });
}

// -----------------------------------------------------
// FAZ 1: Temeller ve İlerleyiş (1-10)
// -----------------------------------------------------
// 1. Tutorial
createLevel('Eğitim Köprüsü', 500,
    [{ x: -4.5, y: -2 }, { x: 4.5, y: -2 }],
    { x: -12, y: -1 }, 6, -6,
    [{ x: -54.5, y: -2, width: 100 }, { x: 54.5, y: -2, width: 100 }]
);

// 2. Biraz daha uzun
createLevel('Daha Geniş Vadi', 700,
    [{ x: -6, y: -1 }, { x: 6, y: -1 }],
    { x: -14, y: 0 }, 8, -6,
    [{ x: -56, y: -1, width: 100 }, { x: 56, y: -1, width: 100 }]
);

// 3. Desteksiz
createLevel('Desteksiz Geçiş', 1000,
    [{ x: -8, y: 0 }, { x: 8, y: 0 }],
    { x: -16, y: 1 }, 10, -6,
    [{ x: -58, y: 0, width: 100 }, { x: 58, y: 0, width: 100 }]
);

// 4. İlk Ara Ada
createLevel('İlk Ada', 1200,
    [{ x: -9, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 9, y: 0 }],
    { x: -17, y: 1 }, 11, -5,
    [{ x: -59, y: 0, width: 100 }, { x: 0, y: 0, width: 4 }, { x: 59, y: 0, width: 100 }]
);

// 5. İkiz Adalar
createLevel('İkiz Adalar', 1500,
    [{ x: -12, y: 0 }, { x: -5, y: -1 }, { x: -1, y: -1 }, { x: 5, y: -1 }, { x: 9, y: -1 }, { x: 15, y: 0 }],
    { x: -20, y: 1 }, 18, -6,
    [{ x: -62, y: 0, width: 100 }, { x: -3, y: -1, width: 4 }, { x: 7, y: -1, width: 4 }, { x: 65, y: 0, width: 100 }]
);

// 6. Ufak Bir Rampa
createLevel('Isınma Rampası', 800,
    [{ x: -5, y: -2 }, { x: 5, y: 0 }],
    { x: -15, y: -1 }, 8, -6,
    [{ x: -55, y: -2, width: 100 }, { x: 55, y: 0, width: 100 }]
);

// 7. Sarp Boğaz
createLevel('Sarp Boğaz', 1100,
    [{ x: -7, y: -3 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 7, y: 2 }],
    { x: -15, y: -2 }, 10, -8,
    [{ x: -57, y: -3, width: 100 }, { x: 0, y: 0, width: 2 }, { x: 57, y: 2, width: 100 }]
);

// 8. Bütçe Krizi
createLevel('Bütçe Krizi', 350,
    [{ x: -5, y: 0 }, { x: 5, y: 0 }],
    { x: -12, y: 1 }, 8, -6,
    [{ x: -55, y: 0, width: 100 }, { x: 55, y: 0, width: 100 }]
);

// 9. Merdivenler
createLevel('Merdivenler', 1800,
    [{ x: -15, y: -4 }, { x: -9, y: -1 }, { x: -7, y: -1 }, { x: -1, y: 2 }, { x: 1, y: 2 }, { x: 7, y: 5 }],
    { x: -22, y: -3 }, 15, -8,
    [{ x: -65, y: -4, width: 100 }, { x: -8, y: -1, width: 2 }, { x: 0, y: 2, width: 2 }, { x: 57, y: 5, width: 100 }]
);

// 10. Çelik İhtiyacı
createLevel('Çelik Şart', 1100,
    [{ x: -10, y: 0 }, { x: 10, y: 0 }],
    { x: -18, y: 1 }, 12, -8,
    [{ x: -60, y: 0, width: 100 }, { x: 60, y: 0, width: 100 }]
);

// -----------------------------------------------------
// FAZ 2: Mimari Mühendislik (11-20)
// -----------------------------------------------------

// Generate varying mechanical levels for phases 2-5
for (let i = 11; i <= 50; i++) {

    // As level goes up, span gets more crazy, or multiple islands
    const difficultyMultiplier = i / 10;

    const numIslands = Math.floor(Math.random() * 3); // 0, 1, or 2 islands

    const platforms = [];
    const anchors = [];

    let currentX = -15 - (difficultyMultiplier * 5); // start X
    const endXVal = 15 + (difficultyMultiplier * 5); // end X

    let currentY = (Math.random() * 4) - 2;

    // Start platform
    platforms.push({ x: currentX - 50, y: currentY, width: 100 });
    anchors.push({ x: currentX, y: currentY });

    const startCarX = currentX - 6;
    const startCarY = currentY + 1;

    let span = endXVal - currentX;

    // Islands
    for (let j = 0; j < numIslands; j++) {
        let islandX = currentX + (span / (numIslands + 1)) * (j + 1);
        let islandY = currentY + ((Math.random() * 8) - 4); // random height from previous

        let islandWidth = 2 + Math.random() * 4;

        platforms.push({ x: islandX, y: islandY, width: islandWidth });
        anchors.push({ x: islandX - islandWidth / 2 + 0.5, y: islandY });
        anchors.push({ x: islandX + islandWidth / 2 - 0.5, y: islandY });
    }

    // End platform
    let endY = currentY + ((Math.random() * 8) - 4);
    platforms.push({ x: endXVal + 50, y: endY, width: 100 });
    anchors.push({ x: endXVal, y: endY });

    let targetCar = endXVal + 4;

    let waterLevel = Math.min(...platforms.map(p => p.y)) - 5 - (Math.random() * 5);

    let bdg = 1000 + (difficultyMultiplier * 500) + (numIslands * 300);
    bdg = Math.floor(bdg / 100) * 100; // round

    // Specific Names for milestones
    let name = `Mühendislik Harikası ${i}`;
    if (i === 20) name = "Boss: Vadi Kralı";
    if (i === 30) name = "Ters Açı";
    if (i === 40) name = "Büyük Uçurum";
    if (i === 50) name = "Final: Golden Gate Challenge";

    createLevel(name, bdg, anchors, { x: startCarX, y: startCarY }, targetCar, waterLevel, platforms, 20);
}


const tsContent = `export interface LevelData {
    id: number;
    name: string;
    budget: number;
    anchors: Array<{ x: number; y: number }>;
    vehicleStart: { x: number; y: number };
    vehicleTarget: number;
    waterLevel: number;
    platforms: Array<{ x: number; y: number; width: number }>;
    timeLimit: number;
}

export const LEVELS: LevelData[] = ${JSON.stringify(levels, null, 4)};\n`;

fs.writeFileSync(path.join(process.cwd(), 'src/data/levels.ts'), tsContent, 'utf-8');
console.log('Successfully generated 50 levels.');
