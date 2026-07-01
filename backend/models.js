const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  alertThreshold: { type: Number, required: true },
  image: { type: String }
});

const cartItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const billSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: String,
  customerId: String,
  customerPhone: String,
  total: Number,
  date: String,
  items: [cartItemSchema]
});

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  createdAt: String
});

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String }
});

const Item = mongoose.model('Item', itemSchema);
const Bill = mongoose.model('Bill', billSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { Item, Bill, Customer, Settings };
