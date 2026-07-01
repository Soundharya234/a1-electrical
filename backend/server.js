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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// Setup Default Data if empty
app.post('/api/setup', async (req, res) => {
  const count = await Item.countDocuments();
  if (count === 0) {
    const { v4: uuidv4 } = require('uuid');
    const defaultItems = [
      { id: uuidv4(), name: 'Finolex 1.5 sq mm Wire Coil', price: 1200, stockQuantity: 20, alertThreshold: 5 },
      { id: uuidv4(), name: 'Anchor Roma Switch 6A', price: 45, stockQuantity: 100, alertThreshold: 20 },
      { id: uuidv4(), name: 'Crompton Ceiling Fan 1200mm', price: 1850, stockQuantity: 15, alertThreshold: 3 },
      { id: uuidv4(), name: 'Havells MCB 32A Double Pole', price: 450, stockQuantity: 30, alertThreshold: 10 },
      { id: uuidv4(), name: 'Philips LED Bulb 9W', price: 110, stockQuantity: 50, alertThreshold: 15 },
      { id: uuidv4(), name: 'PVC Conduit Pipe 1 inch', price: 65, stockQuantity: 200, alertThreshold: 50 },
      { id: uuidv4(), name: 'Anchor Insulation Tape', price: 15, stockQuantity: 150, alertThreshold: 20 },
    ];
    await Item.insertMany(defaultItems);
    res.send({ success: true, message: "Default items created" });
  } else {
    res.send({ success: true, message: "Items already exist" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
