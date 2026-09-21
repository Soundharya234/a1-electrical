// ============================================================
//  PACKAGING AI — Food Properties Database
//  Each food item has properties that drive packaging decisions
// ============================================================

export const FOOD_ITEMS_PACKAGING = [
  // ── FRESH PRODUCE ──────────────────────────────────────────
  {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    category: 'fresh-produce',
    subcategory: 'vegetable',
    moistureContent: 94,          // %
    respirationRate: 'high',      // low | medium | high | very-high
    isLivingProduce: true,
    ethyleneProduction: 'medium', // low | medium | high
    oilContent: 0.2,              // %
    pH: 4.2,
    waterActivity: 0.99,
    mainRisks: ['moisture', 'respiration', 'microbial'],
    freshProduceMode: true,
    defaultShelfLifeDays: 7,
    description: 'High moisture, actively respires — needs gas exchange'
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    category: 'fresh-produce',
    subcategory: 'fruit',
    moistureContent: 75,
    respirationRate: 'high',
    isLivingProduce: true,
    ethyleneProduction: 'very-high',
    oilContent: 0.3,
    pH: 5.0,
    waterActivity: 0.98,
    mainRisks: ['ethylene', 'respiration', 'bruising'],
    freshProduceMode: true,
    defaultShelfLifeDays: 5,
    description: 'Very high ethylene — ripens fast, needs ethylene management'
  },
  {
    id: 'mango',
    name: 'Mango',
    emoji: '🥭',
    category: 'fresh-produce',
    subcategory: 'fruit',
    moistureContent: 83,
    respirationRate: 'medium',
    isLivingProduce: true,
    ethyleneProduction: 'high',
    oilContent: 0.4,
    pH: 3.9,
    waterActivity: 0.99,
    mainRisks: ['ethylene', 'moisture', 'microbial'],
    freshProduceMode: true,
    defaultShelfLifeDays: 7,
    description: 'High ethylene climacteric fruit — MAP packaging helps'
  },
  {
    id: 'spinach',
    name: 'Spinach / Palak',
    emoji: '🥬',
    category: 'fresh-produce',
    subcategory: 'leafy-vegetable',
    moistureContent: 91,
    respirationRate: 'very-high',
    isLivingProduce: true,
    ethyleneProduction: 'low',
    oilContent: 0.4,
    pH: 6.8,
    waterActivity: 0.99,
    mainRisks: ['moisture', 'respiration', 'wilting', 'microbial'],
    freshProduceMode: true,
    defaultShelfLifeDays: 3,
    description: 'Very high respiration leafy vegetable — perforated + cold chain needed'
  },
  {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    category: 'fresh-produce',
    subcategory: 'tuber',
    moistureContent: 78,
    respirationRate: 'low',
    isLivingProduce: true,
    ethyleneProduction: 'low',
    oilContent: 0.1,
    pH: 6.0,
    waterActivity: 0.99,
    mainRisks: ['moisture', 'light', 'sprout'],
    freshProduceMode: true,
    defaultShelfLifeDays: 30,
    description: 'Low respiration — needs light barrier to prevent greening'
  },

  // ── DRY / PROCESSED FOODS ───────────────────────────────────
  {
    id: 'biscuit',
    name: 'Biscuit / Crackers',
    emoji: '🍪',
    category: 'dry-processed',
    subcategory: 'bakery',
    moistureContent: 4,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 18,
    pH: 7.0,
    waterActivity: 0.30,
    mainRisks: ['moisture-ingress', 'oxidation', 'breakage'],
    freshProduceMode: false,
    defaultShelfLifeDays: 90,
    description: 'Low aw dry food — moisture ingress causes softening, crispness loss'
  },
  {
    id: 'chips',
    name: 'Potato Chips / Namkeen',
    emoji: '🥔',
    category: 'dry-processed',
    subcategory: 'snack',
    moistureContent: 3,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 35,
    pH: 6.5,
    waterActivity: 0.25,
    mainRisks: ['oxidation', 'moisture-ingress', 'light', 'breakage'],
    freshProduceMode: false,
    defaultShelfLifeDays: 90,
    description: 'High oil — oxidation causes rancidity; needs oxygen + light barrier'
  },
  {
    id: 'rice',
    name: 'Rice (Raw)',
    emoji: '🌾',
    category: 'grain',
    subcategory: 'cereal',
    moistureContent: 12,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 0.5,
    pH: 6.5,
    waterActivity: 0.65,
    mainRisks: ['moisture-ingress', 'insect', 'microbial'],
    freshProduceMode: false,
    defaultShelfLifeDays: 365,
    description: 'Intermediate aw grain — moisture + insect protection primary'
  },
  {
    id: 'milk-powder',
    name: 'Milk Powder',
    emoji: '🥛',
    category: 'dairy-processed',
    subcategory: 'powder',
    moistureContent: 3,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 26,
    pH: 6.8,
    waterActivity: 0.20,
    mainRisks: ['moisture-ingress', 'oxidation', 'caking'],
    freshProduceMode: false,
    defaultShelfLifeDays: 365,
    description: 'High fat powder — moisture + oxygen dual barrier critical'
  },
  {
    id: 'cooking-oil',
    name: 'Cooking Oil',
    emoji: '🫙',
    category: 'oil-fat',
    subcategory: 'liquid-oil',
    moistureContent: 0,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 100,
    pH: 7.0,
    waterActivity: 0.00,
    mainRisks: ['oxidation', 'light', 'leakage'],
    freshProduceMode: false,
    defaultShelfLifeDays: 180,
    description: 'Pure fat — oxidation (rancidity) + light degradation are main enemies'
  },
  {
    id: 'pickle',
    name: 'Mixed Pickle',
    emoji: '🫙',
    category: 'condiment',
    subcategory: 'acidic-preserve',
    moistureContent: 60,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 30,
    pH: 3.5,
    waterActivity: 0.85,
    mainRisks: ['oxidation', 'acid-corrosion', 'leakage', 'microbial'],
    freshProduceMode: false,
    defaultShelfLifeDays: 365,
    description: 'Acidic high-oil product — needs acid-resistant + oxygen barrier'
  },
  {
    id: 'bread',
    name: 'Bread / Roti',
    emoji: '🍞',
    category: 'bakery',
    subcategory: 'fresh-bakery',
    moistureContent: 38,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 3,
    pH: 5.5,
    waterActivity: 0.96,
    mainRisks: ['moisture-loss', 'microbial', 'staling'],
    freshProduceMode: false,
    defaultShelfLifeDays: 5,
    description: 'High aw bakery — moisture retention + mold prevention needed'
  },
  {
    id: 'fish',
    name: 'Fish (Fresh/Frozen)',
    emoji: '🐟',
    category: 'protein',
    subcategory: 'seafood',
    moistureContent: 76,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 5,
    pH: 6.5,
    waterActivity: 0.99,
    mainRisks: ['oxidation', 'moisture', 'microbial', 'odour'],
    freshProduceMode: false,
    defaultShelfLifeDays: 3,
    description: 'High moisture protein — odour containment + oxygen barrier critical'
  },
  {
    id: 'chicken',
    name: 'Chicken / Meat',
    emoji: '🍗',
    category: 'protein',
    subcategory: 'meat',
    moistureContent: 65,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 15,
    pH: 6.2,
    waterActivity: 0.99,
    mainRisks: ['oxidation', 'moisture', 'microbial', 'odour'],
    freshProduceMode: false,
    defaultShelfLifeDays: 3,
    description: 'Highly perishable protein — MAP + oxygen scavenging for retail'
  },
  {
    id: 'spices',
    name: 'Ground Spices',
    emoji: '🌶️',
    category: 'spice',
    subcategory: 'powder',
    moistureContent: 8,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 5,
    pH: 5.5,
    waterActivity: 0.50,
    mainRisks: ['moisture-ingress', 'aroma-loss', 'oxidation', 'light'],
    freshProduceMode: false,
    defaultShelfLifeDays: 365,
    description: 'Aromatic powders — aroma retention + moisture barrier essential'
  },
  {
    id: 'dairy-fresh',
    name: 'Fresh Dairy (Curd/Paneer)',
    emoji: '🧀',
    category: 'dairy-fresh',
    subcategory: 'fresh-dairy',
    moistureContent: 85,
    respirationRate: 'none',
    isLivingProduce: false,
    ethyleneProduction: 'none',
    oilContent: 8,
    pH: 4.5,
    waterActivity: 0.99,
    mainRisks: ['microbial', 'moisture', 'oxygen'],
    freshProduceMode: false,
    defaultShelfLifeDays: 7,
    description: 'High moisture dairy — modified atmosphere + cold chain needed'
  }
];

// ============================================================
//  PACKAGING MATERIALS DATABASE
//  Technical specifications for each material
// ============================================================

export const PACKAGING_MATERIALS = [
  {
    id: 'micro-perforated-pe',
    name: 'Micro-Perforated PE Film',
    shortName: 'Perforated PE',
    color: '#22C55E',
    emoji: '🌿',
    layers: [
      { name: 'Outer PE Layer', purpose: 'Structural support + printability', color: '#86EFAC' },
      { name: 'Micro-Perforation Zone', purpose: 'Gas exchange (O₂/CO₂)', color: '#FDE68A' },
      { name: 'Inner PE Layer', purpose: 'Food contact safety', color: '#86EFAC' }
    ],
    specs: {
      otr: '3000–15000 cc/m²/day',         // Oxygen Transmission Rate
      wvtr: '5–20 g/m²/day',                // Water Vapour Transmission Rate
      thickness: '20–50 µm',
      sealability: 'Good',
      mechanicalStrength: 'Medium',
      mapSuitability: true,
      lightBarrier: false,
      oxygenBarrier: false,
      moistureBarrier: 'Low',
      acidResistance: 'Good',
    },
    costPerSqm: 12,           // ₹
    sustainabilityScore: 60,  // 0–100
    recyclable: true,
    biodegradable: false,
    bestFor: ['fresh-produce', 'leafy-vegetable', 'fruit'],
    notSuitableFor: ['oil-fat', 'snack', 'dry-processed'],
    pros: ['Allows gas exchange', 'Prevents moisture build-up', 'Good for respiring produce'],
    cons: ['Low oxygen barrier', 'Not for dry crispy foods', 'Limited mechanical strength']
  },
  {
    id: 'pet-pe-laminate',
    name: 'PET / PE Laminate',
    shortName: 'PET/PE',
    color: '#3B82F6',
    emoji: '🔵',
    layers: [
      { name: 'PET Outer Layer (12 µm)', purpose: 'High strength + printability', color: '#BFDBFE' },
      { name: 'Adhesive Layer', purpose: 'Layer bonding', color: '#FDE68A' },
      { name: 'PE Inner Layer (50–80 µm)', purpose: 'Sealing + food contact', color: '#93C5FD' }
    ],
    specs: {
      otr: '50–150 cc/m²/day',
      wvtr: '2–8 g/m²/day',
      thickness: '62–100 µm',
      sealability: 'Excellent',
      mechanicalStrength: 'High',
      mapSuitability: true,
      lightBarrier: false,
      oxygenBarrier: 'Medium',
      moistureBarrier: 'High',
      acidResistance: 'Excellent',
    },
    costPerSqm: 22,
    sustainabilityScore: 45,
    recyclable: false,   // laminate = hard to recycle
    biodegradable: false,
    bestFor: ['bakery', 'dairy-fresh', 'dairy-processed', 'condiment'],
    notSuitableFor: ['fresh-produce', 'oil-fat'],
    pros: ['Excellent moisture barrier', 'Strong seal', 'Good clarity', 'Acid resistant'],
    cons: ['Not recyclable (laminate)', 'Moderate oxygen barrier only', 'Higher cost']
  },
  {
    id: 'metalized-bopp',
    name: 'Metalized BOPP Film',
    shortName: 'Met-BOPP',
    color: '#F59E0B',
    emoji: '✨',
    layers: [
      { name: 'BOPP Outer Layer (20 µm)', purpose: 'Base + printability', color: '#FDE68A' },
      { name: 'Aluminium Metallization (0.05 µm)', purpose: 'Oxygen + light + moisture barrier', color: '#9CA3AF' },
      { name: 'Heat-Seal Coating', purpose: 'Sealability', color: '#FCD34D' }
    ],
    specs: {
      otr: '2–10 cc/m²/day',
      wvtr: '0.1–0.5 g/m²/day',
      thickness: '20–30 µm',
      sealability: 'Good',
      mechanicalStrength: 'Medium',
      mapSuitability: false,
      lightBarrier: true,
      oxygenBarrier: 'High',
      moistureBarrier: 'Very High',
      acidResistance: 'Medium',
    },
    costPerSqm: 30,
    sustainabilityScore: 35,
    recyclable: false,
    biodegradable: false,
    bestFor: ['snack', 'dry-processed', 'spice', 'bakery'],
    notSuitableFor: ['fresh-produce', 'dairy-fresh'],
    pros: ['Excellent oxygen barrier', 'Very high moisture barrier', 'Light barrier', 'Good for long shelf life'],
    cons: ['Not transparent (metallic look)', 'Not recyclable', 'Moderate cost']
  },
  {
    id: 'alu-foil-laminate',
    name: 'Aluminium Foil Laminate',
    shortName: 'Alu-Foil',
    color: '#6B7280',
    emoji: '⬜',
    layers: [
      { name: 'PET / OPP Outer (12 µm)', purpose: 'Printability + strength', color: '#BFDBFE' },
      { name: 'Aluminium Foil (9–12 µm)', purpose: 'Total barrier: O₂, moisture, light, aroma', color: '#D1D5DB' },
      { name: 'PE / PP Inner (50 µm)', purpose: 'Sealing + food safe contact', color: '#86EFAC' }
    ],
    specs: {
      otr: '< 0.01 cc/m²/day',
      wvtr: '< 0.01 g/m²/day',
      thickness: '70–90 µm',
      sealability: 'Excellent',
      mechanicalStrength: 'High',
      mapSuitability: false,
      lightBarrier: true,
      oxygenBarrier: 'Absolute',
      moistureBarrier: 'Absolute',
      acidResistance: 'Good',
    },
    costPerSqm: 55,
    sustainabilityScore: 25,
    recyclable: false,
    biodegradable: false,
    bestFor: ['oil-fat', 'dairy-processed', 'spice', 'protein', 'snack'],
    notSuitableFor: ['fresh-produce'],
    pros: ['Total barrier (O₂, moisture, light)', 'Maximum shelf life', 'Aroma retention', 'Best for oily foods'],
    cons: ['Not recyclable', 'Opaque (no visual check)', 'Highest cost', 'Heavy']
  },
  {
    id: 'hdpe-rigid',
    name: 'HDPE Rigid Container',
    shortName: 'HDPE',
    color: '#8B5CF6',
    emoji: '📦',
    layers: [
      { name: 'HDPE Body (2–3 mm)', purpose: 'Structural rigidity + impact protection', color: '#DDD6FE' }
    ],
    specs: {
      otr: '200–500 cc/m²/day',
      wvtr: '1–5 g/m²/day',
      thickness: '2000–3000 µm',
      sealability: 'Good (with lid)',
      mechanicalStrength: 'Very High',
      mapSuitability: false,
      lightBarrier: false,
      oxygenBarrier: 'Low',
      moistureBarrier: 'Medium',
      acidResistance: 'Good',
    },
    costPerSqm: 40,
    sustainabilityScore: 70,
    recyclable: true,
    biodegradable: false,
    bestFor: ['dairy-fresh', 'condiment', 'grain', 'spice'],
    notSuitableFor: ['fresh-produce', 'chips', 'snack'],
    pros: ['Impact resistant', 'Reusable', 'Recyclable', 'Good acid resistance'],
    cons: ['Bulky + heavy', 'Moderate moisture barrier', 'Poor oxygen barrier']
  },
  {
    id: 'map-film',
    name: 'MAP Barrier Film (PA/PE)',
    shortName: 'MAP Film',
    color: '#06B6D4',
    emoji: '🌬️',
    layers: [
      { name: 'PA (Nylon) Outer (15 µm)', purpose: 'Oxygen barrier + strength', color: '#CFFAFE' },
      { name: 'Tie Layer', purpose: 'Adhesion between layers', color: '#FDE68A' },
      { name: 'PE Inner (60 µm)', purpose: 'Sealing + food contact', color: '#86EFAC' }
    ],
    specs: {
      otr: '15–60 cc/m²/day',
      wvtr: '3–10 g/m²/day',
      thickness: '75–100 µm',
      sealability: 'Excellent',
      mechanicalStrength: 'High',
      mapSuitability: true,
      lightBarrier: false,
      oxygenBarrier: 'Medium-High',
      moistureBarrier: 'High',
      acidResistance: 'Excellent',
    },
    costPerSqm: 35,
    sustainabilityScore: 40,
    recyclable: false,
    biodegradable: false,
    bestFor: ['protein', 'dairy-fresh', 'bakery'],
    notSuitableFor: ['fresh-produce', 'oil-fat'],
    pros: ['Designed for MAP gas flushing', 'High puncture resistance', 'Good oxygen barrier'],
    cons: ['Not recyclable', 'Opaque options only', 'Needs gas-flush equipment']
  },
  {
    id: 'bio-pla-film',
    name: 'Bio-based PLA Film',
    shortName: 'PLA Bio-film',
    color: '#84CC16',
    emoji: '🌱',
    layers: [
      { name: 'PLA Film (30–50 µm)', purpose: 'Structure + food contact, compostable', color: '#D9F99D' }
    ],
    specs: {
      otr: '500–2000 cc/m²/day',
      wvtr: '50–200 g/m²/day',
      thickness: '30–50 µm',
      sealability: 'Moderate',
      mechanicalStrength: 'Low-Medium',
      mapSuitability: false,
      lightBarrier: false,
      oxygenBarrier: 'Low',
      moistureBarrier: 'Low',
      acidResistance: 'Moderate',
    },
    costPerSqm: 45,
    sustainabilityScore: 90,
    recyclable: false,
    biodegradable: true,
    bestFor: ['fresh-produce', 'bakery'],
    notSuitableFor: ['oil-fat', 'dairy-processed', 'snack', 'spice'],
    pros: ['Compostable (industrially)', 'Renewable source', 'High sustainability', 'Clear film'],
    cons: ['Poor moisture & oxygen barrier', 'More expensive', 'Brittle in cold', 'Limited shelf life extension']
  },
  {
    id: 'pp-woven-bag',
    name: 'PP Woven Sack',
    shortName: 'PP Woven',
    color: '#D97706',
    emoji: '🪣',
    layers: [
      { name: 'Woven PP Fabric (100–150 gsm)', purpose: 'Strength + breathability', color: '#FDE68A' },
      { name: 'LDPE Liner (optional)', purpose: 'Moisture protection', color: '#BFDBFE' }
    ],
    specs: {
      otr: '> 50000 cc/m²/day',
      wvtr: '> 100 g/m²/day',
      thickness: '250–400 µm',
      sealability: 'Moderate (stitched)',
      mechanicalStrength: 'Very High',
      mapSuitability: false,
      lightBarrier: false,
      oxygenBarrier: 'Negligible',
      moistureBarrier: 'Low (without liner)',
      acidResistance: 'Good',
    },
    costPerSqm: 18,
    sustainabilityScore: 55,
    recyclable: true,
    biodegradable: false,
    bestFor: ['grain', 'tuber'],
    notSuitableFor: ['dairy-fresh', 'snack', 'protein', 'oil-fat'],
    pros: ['Extremely strong', 'High load capacity', 'Breathable for root vegetables', 'Low cost'],
    cons: ['No barrier properties', 'Not for moisture-sensitive foods', 'Basic only']
  }
];

// ============================================================
//  STORAGE CONDITIONS REFERENCE
// ============================================================

export const STORAGE_CONDITIONS = [
  {
    id: 'ambient',
    name: 'Ambient / Room Temperature',
    emoji: '🌡️',
    tempRange: '20–30°C',
    humidityRange: '50–70%',
    description: 'Normal room conditions, no refrigeration'
  },
  {
    id: 'chilled',
    name: 'Chilled / Refrigerated',
    emoji: '❄️',
    tempRange: '2–8°C',
    humidityRange: '80–95%',
    description: 'Cold storage or refrigerator'
  },
  {
    id: 'frozen',
    name: 'Frozen',
    emoji: '🧊',
    tempRange: '-18 to -25°C',
    humidityRange: '60–80%',
    description: 'Deep freeze storage'
  }
];

// ============================================================
//  TRANSPORT MODES
// ============================================================

export const TRANSPORT_MODES = [
  {
    id: 'local',
    name: 'Local Distribution',
    emoji: '🛺',
    description: 'Within city, < 50 km, 1–6 hours',
    mechanicalStressLevel: 'Low',
    durationHours: 6
  },
  {
    id: 'regional',
    name: 'Regional / Long Distance',
    emoji: '🚛',
    description: 'State-wide transport, > 200 km, 1–3 days',
    mechanicalStressLevel: 'High',
    durationHours: 48
  },
  {
    id: 'refrigerated',
    name: 'Refrigerated Transport',
    emoji: '❄️🚚',
    description: 'Cold chain maintained during transport',
    mechanicalStressLevel: 'Medium',
    durationHours: 24
  }
];

// ============================================================
//  MAP GAS COMPOSITIONS
// ============================================================

export const MAP_GAS_COMPOSITIONS = {
  'fresh-produce-leafy': {
    o2: '3–5%',
    co2: '5–10%',
    n2: 'Balance',
    description: 'Low O₂ + elevated CO₂ to slow respiration in leafy vegetables'
  },
  'fresh-produce-fruit': {
    o2: '2–5%',
    co2: '3–8%',
    n2: 'Balance',
    description: 'Modified atmosphere to delay ripening and ethylene effects'
  },
  'meat-fresh': {
    o2: '60–80%',
    co2: '20–40%',
    n2: 'Balance',
    description: 'High O₂ to maintain red colour; CO₂ for microbial control'
  },
  'meat-processed': {
    o2: '0%',
    co2: '30–60%',
    n2: 'Balance',
    description: 'Oxygen-free environment with CO₂ for extended shelf life'
  },
  'dairy-cheese': {
    o2: '0%',
    co2: '20–40%',
    n2: 'Balance',
    description: 'Nitrogen flush with CO₂ to prevent mold and rancidity'
  },
  'dry-snack': {
    o2: '0%',
    co2: '0%',
    n2: '100%',
    description: 'Pure nitrogen flush to prevent oxidation in snacks and chips'
  }
};
