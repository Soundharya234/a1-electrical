require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Item, Bill, Customer, Settings } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- ITEMS ---
app.get('/api/items', async (req, res) => {
  const items = await Item.find({});
  res.send(items);
});

app.post('/api/items', async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.send(item);
});

app.put('/api/items/:id', async (req, res) => {
  const item = await Item.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.send(item);
});

app.delete('/api/items/:id', async (req, res) => {
  await Item.findOneAndDelete({ id: req.params.id });
  res.send({ success: true });
});

// --- BILLS ---
app.get('/api/bills', async (req, res) => {
  const bills = await Bill.find({}).sort({ date: -1 });
  res.send(bills);
});

app.post('/api/bills', async (req, res) => {
  const bill = new Bill(req.body);
  await bill.save();
  
  // Deduct stock for each item in the bill
  for (let cartItem of req.body.items) {
    const item = await Item.findOne({ id: cartItem.itemId });
    if (item) {
      item.stockQuantity = Math.max(0, item.stockQuantity - cartItem.quantity);
      await item.save();
    }
  }
  
  res.send(bill);
});

app.delete('/api/bills/:id', async (req, res) => {
  const bill = await Bill.findOne({ id: req.params.id });
  const shouldRestock = req.query.restock === 'true';

  if (bill && shouldRestock) {
    for (let cartItem of bill.items) {
      const item = await Item.findOne({ id: cartItem.itemId });
      if (item) {
        item.stockQuantity += cartItem.quantity;
        await item.save();
      }
    }
  }

  await Bill.findOneAndDelete({ id: req.params.id });
  res.send({ success: true });
});

app.post('/api/bills/:id/return', async (req, res) => {
  const billId = req.params.id;
  const returnedItemsMap = req.body; // { itemId: quantityToReturn }
  
  const bill = await Bill.findOne({ id: billId });
  if (!bill) return res.status(404).send("Bill not found");

  const updatedItems = [];
  let newTotal = 0;

  for (let cartItem of bill.items) {
    const returnQty = returnedItemsMap[cartItem.itemId] || 0;
    const remainingQty = cartItem.quantity - returnQty;

    if (returnQty > 0) {
      const invItem = await Item.findOne({ id: cartItem.itemId });
      if (invItem) {
        invItem.stockQuantity += returnQty;
        await invItem.save();
      }
    }

    if (remainingQty > 0) {
      updatedItems.push({ ...cartItem._doc, quantity: remainingQty });
      newTotal += remainingQty * cartItem.price;
    }
  }

  if (updatedItems.length === 0) {
    await Bill.findOneAndDelete({ id: billId });
    res.send({ deleted: true });
  } else {
    bill.items = updatedItems;
    bill.total = newTotal;
    await bill.save();
    res.send(bill);
  }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  const customers = await Customer.find({});
  res.send(customers);
});

app.post('/api/customers', async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();
  res.send(customer);
});

app.put('/api/customers/:id', async (req, res) => {
  const customer = await Customer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.send(customer);
});

app.delete('/api/customers/:id', async (req, res) => {
  await Customer.findOneAndDelete({ id: req.params.id });
  res.send({ success: true });
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  let settings = await Settings.findOne({ key: 'auth' });
  if (!settings) {
    settings = new Settings({ key: 'auth', username: 'thiru', password: 'admin' });
    await settings.save();
  }
  res.send({ username: settings.username, password: settings.password });
});

app.put('/api/settings', async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: 'auth' }, 
    { username: req.body.username, password: req.body.password },
    { new: true, upsert: true }
  );
  res.send({ username: settings.username, password: settings.password });
});

// Setup Data - Seeds 200 items
app.get('/api/setup', async (req, res) => {
  try {
    await Item.deleteMany({});
    
    const { v4: uuidv4 } = require('uuid');
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

    await Item.insertMany(items);
    res.send({ success: true, message: `Successfully seeded ${items.length} items to database!` });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
