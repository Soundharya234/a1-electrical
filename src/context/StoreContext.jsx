import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

// Use relative URL so Vite proxy handles it locally, and Render handles it in production
// If deployed separately, set this to the backend URL (e.g. 'https://backend.onrender.com')
// But for now, let's assume we run them together or set a fallback.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const StoreProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [authConfig, setAuthConfig] = useState({ username: 'thiru', password: 'admin' });
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, billsRes, customersRes, authRes] = await Promise.all([
          fetch(`${API_URL}/api/items`).catch(() => null),
          fetch(`${API_URL}/api/bills`).catch(() => null),
          fetch(`${API_URL}/api/customers`).catch(() => null),
          fetch(`${API_URL}/api/settings`).catch(() => null)
        ]);

        if (itemsRes && itemsRes.ok) setItems(await itemsRes.json());
        else throw new Error("Backend not available");
        
        if (billsRes && billsRes.ok) setBills(await billsRes.json());
        if (customersRes && customersRes.ok) setCustomers(await customersRes.json());
        if (authRes && authRes.ok) setAuthConfig(await authRes.json());

      } catch (error) {
        console.warn("Backend unavailable, falling back to local storage...", error);
        const load = (key, def) => {
          const val = localStorage.getItem(key);
          return val ? JSON.parse(val) : def;
        };
        setItems(load('a1_inventory', []));
        setBills(load('a1_invoices', []));
        setCustomers(load('a1_customers', []));
        setAuthConfig(load('a1_auth_config', { username: 'thiru', password: 'admin' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Actions
  const addItem = async (itemData) => {
    const id = uuidv4();
    const newItem = { ...itemData, id };
    
    // Optimistic update
    setItems(prev => [...prev, newItem]);
    
    try {
      await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateItem = async (id, updatedData) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    
    try {
      await fetch(`${API_URL}/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const createBill = async (billData, cartItems) => {
    const id = uuidv4();
    const newBill = {
      ...billData,
      id,
      date: new Date().toISOString(),
      items: cartItems
    };
    
    // Optimistic update
    setBills(prev => [newBill, ...prev]);
    setItems(prev => prev.map(item => {
      const cartItem = cartItems.find(ci => ci.itemId === item.id);
      if (cartItem) {
        return { ...item, stockQuantity: Math.max(0, item.stockQuantity - cartItem.quantity) };
      }
      return item;
    }));

    try {
      await fetch(`${API_URL}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBill)
      });
    } catch (e) {
      console.error(e);
    }
    
    return newBill;
  };

  const getLowStockItems = () => {
    return items.filter(item => item.stockQuantity <= item.alertThreshold);
  };

  const updateAuth = async (username, password) => {
    setAuthConfig({ username, password });
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addCustomer = async (customerData) => {
    const id = uuidv4();
    const newCustomer = { ...customerData, id, createdAt: new Date().toISOString() };
    
    setCustomers(prev => [...prev, newCustomer]);
    
    try {
      await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
    } catch (e) {
      console.error(e);
    }
    return newCustomer;
  };

  const updateCustomer = async (id, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    
    try {
      await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustomer = async (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`${API_URL}/api/customers/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBill = async (id, shouldRestock = true) => {
    const billToDelete = bills.find(b => b.id === id);
    if (!billToDelete) return;
    
    // Optimistic
    setBills(prev => prev.filter(b => b.id !== id));
    if (shouldRestock) {
      setItems(currentItems => {
        return currentItems.map(item => {
          const cartItem = billToDelete.items.find(ci => ci.itemId === item.id);
          if (cartItem) {
            return { ...item, stockQuantity: item.stockQuantity + cartItem.quantity };
          }
          return item;
        });
      });
    }

    try {
      await fetch(`${API_URL}/api/bills/${id}?restock=${shouldRestock}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const returnItemsFromBill = async (billId, returnedItemsMap) => {
    const billIndex = bills.findIndex(b => b.id === billId);
    if (billIndex === -1) return;

    // We rely on backend response to update state to avoid complex optimistic logic for returns, 
    // or we can implement optimistic logic
    const bill = { ...bills[billIndex] };
    const updatedItems = [];
    let newTotal = 0;

    setItems(currentItems => {
      return currentItems.map(invItem => {
        if (returnedItemsMap[invItem.id]) {
          return { ...invItem, stockQuantity: invItem.stockQuantity + returnedItemsMap[invItem.id] };
        }
        return invItem;
      });
    });

    bill.items.forEach(cartItem => {
      const returnQty = returnedItemsMap[cartItem.itemId] || 0;
      const remainingQty = cartItem.quantity - returnQty;
      if (remainingQty > 0) {
        updatedItems.push({ ...cartItem, quantity: remainingQty });
        newTotal += remainingQty * cartItem.price;
      }
    });

    if (updatedItems.length === 0) {
      setBills(prev => prev.filter(b => b.id !== billId));
    } else {
      bill.items = updatedItems;
      bill.total = newTotal;
      const newBills = [...bills];
      newBills[billIndex] = bill;
      setBills(newBills);
    }

    try {
      await fetch(`${API_URL}/api/bills/${billId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnedItemsMap)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const value = {
    items,
    bills,
    authConfig,
    customers,
    addItem,
    updateItem,
    deleteItem,
    createBill,
    deleteBill,
    returnItemsFromBill,
    getLowStockItems,
    updateAuth,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };

  return (
    <StoreContext.Provider value={value}>
      {!loading ? children : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--primary-color)' }}>
          <h2>Connecting to Cloud Database...</h2>
        </div>
      )}
    </StoreContext.Provider>
  );
};
