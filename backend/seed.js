const { v4: uuidv4 } = require('uuid');

const API_URL = "https://a1-backend-pkbs.onrender.com";

const generateItems = () => {
  const categories = [
    { prefix: 'Finolex Wire', prices: [800, 1200, 1600, 2500, 3200], suffixes: ['1.0 sq mm', '1.5 sq mm', '2.5 sq mm', '4.0 sq mm', '6.0 sq mm'] },
    { prefix: 'Polycab Wire', prices: [750, 1100, 1500, 2400, 3000], suffixes: ['1.0 sq mm', '1.5 sq mm', '2.5 sq mm', '4.0 sq mm', '6.0 sq mm'] },
    { prefix: 'Anchor Roma Switch', prices: [45, 65, 85, 120, 200], suffixes: ['6A 1-way', '6A 2-way', '16A 1-way', '16A 2-way', '32A DP'] },
    { prefix: 'Havells Switch', prices: [50, 70, 90, 130, 210], suffixes: ['6A', '16A', 'Bell Push', 'Indicator', 'Blank Plate'] },
    { prefix: 'Anchor Socket', prices: [65, 85, 120, 150, 250], suffixes: ['6A 2-pin', '6A 3-pin', '16A 3-pin', '6A/16A Combi', 'Universal'] },
    { prefix: 'Legrand MCB', prices: [150, 200, 450, 600, 1200], suffixes: ['10A SP', '16A SP', '32A DP', '40A DP', '63A FP'] },
    { prefix: 'Havells MCB', prices: [140, 190, 400, 550, 1100], suffixes: ['10A SP', '16A SP', '32A DP', '40A DP', '63A FP'] },
    { prefix: 'Philips LED Bulb', prices: [90, 120, 250, 400, 800], suffixes: ['7W', '9W', '12W', '20W', '40W'] },
    { prefix: 'Crompton Ceiling Fan', prices: [1200, 1500, 1850, 2200, 3500], suffixes: ['600mm', '900mm', '1200mm', '1400mm', 'Decorative'] },
    { prefix: 'Usha Table Fan', prices: [1500, 1800, 2200, 2500, 3000], suffixes: ['Small', 'Medium', 'Large', 'High Speed', 'Pedestal'] },
    { prefix: 'PVC Conduit Pipe', prices: [45, 65, 90, 120, 200], suffixes: ['20mm', '25mm', '32mm', '40mm', '50mm'] },
    { prefix: 'Casing Capping', prices: [30, 50, 80, 100, 150], suffixes: ['1/2 inch', '3/4 inch', '1 inch', '1.5 inch', '2 inch'] },
    { prefix: 'Anchor Insulation Tape', prices: [10, 15, 20, 30, 50], suffixes: ['Red', 'Yellow', 'Blue', 'Black', 'Green'] },
    { prefix: 'V-Guard Stabilizer', prices: [1200, 1800, 2500, 3500, 5000], suffixes: ['AC 1 Ton', 'AC 1.5 Ton', 'Fridge', 'TV', 'Mainline'] },
    { prefix: 'Bajaj Water Heater', prices: [2500, 3500, 4500, 6000, 8000], suffixes: ['3L Instant', '10L Storage', '15L Storage', '25L Storage', 'Immersion Rod'] },
    { prefix: 'GM Modular Plate', prices: [50, 80, 120, 180, 300], suffixes: ['1 Module', '2 Module', '4 Module', '6 Module', '8 Module'] },
    { prefix: 'Distribution Board', prices: [400, 600, 900, 1500, 2500], suffixes: ['4 Way', '6 Way', '8 Way', '12 Way', '16 Way'] },
    { prefix: 'Exhaust Fan', prices: [600, 900, 1200, 1800, 2500], suffixes: ['4 inch', '6 inch', '8 inch', '10 inch', '12 inch'] },
    { prefix: 'LED Tube Light', prices: [200, 350, 500, 800, 1200], suffixes: ['10W', '20W', 'T5 Batten', 'T8 Tube', 'Color'] },
    { prefix: 'Extension Box', prices: [150, 250, 400, 600, 1000], suffixes: ['2 Socket', '3 Socket', '4 Socket', 'Spike Guard', 'Heavy Duty'] }
  ];

  const items = [];
  
  categories.forEach(cat => {
    cat.suffixes.forEach((suffix, index) => {
      items.push({
        id: uuidv4(),
        name: `${cat.prefix} ${suffix}`,
        price: cat.prices[index],
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        alertThreshold: Math.floor(Math.random() * 5) + 5,
        image: ''
      });
    });
  });

  const randomPrefixes = ['Cona', 'Hi-Fi', 'Simon', 'L&T', 'Schneider', 'Syska', 'Wipro'];
  const randomProducts = ['Switch', 'Socket', 'MCB', 'RCCB', 'LED Bulb', 'Wire Coil', 'Regulator'];
  const randomSpecs = ['Standard', 'Premium', 'Gold', 'Silver', 'Heavy Duty'];
  
  for (let i = 0; i < 100; i++) {
    const pref = randomPrefixes[Math.floor(Math.random() * randomPrefixes.length)];
    const prod = randomProducts[Math.floor(Math.random() * randomProducts.length)];
    const spec = randomSpecs[Math.floor(Math.random() * randomSpecs.length)];
    
    items.push({
      id: uuidv4(),
      name: `${pref} ${prod} ${spec}`,
      price: Math.floor(Math.random() * 2000) + 50,
      stockQuantity: Math.floor(Math.random() * 100) + 5,
      alertThreshold: Math.floor(Math.random() * 10) + 2,
      image: ''
    });
  }

  return items;
};

const runSeed = async () => {
  try {
    const items = generateItems();
    console.log(`Sending ${items.length} items to ${API_URL}...`);
    
    let successCount = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const res = await fetch(`${API_URL}/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error('Error posting item:', err);
      }
      if (i % 20 === 0) console.log(`Processed ${i} items...`);
    }
    
    console.log(`Seeding complete! Successfully added ${successCount} electrical products.`);
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

runSeed();
