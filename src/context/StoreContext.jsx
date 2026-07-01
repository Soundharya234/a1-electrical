import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  // Try to load from local storage
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const defaultItems = [
    { id: uuidv4(), name: 'Finolex 1.5 sq mm Wire Coil', price: 1200, stockQuantity: 20, alertThreshold: 5 },
    { id: uuidv4(), name: 'Anchor Roma Switch 6A', price: 45, stockQuantity: 100, alertThreshold: 20 },
    { id: uuidv4(), name: 'Crompton Ceiling Fan 1200mm', price: 1850, stockQuantity: 15, alertThreshold: 3 },
    { id: uuidv4(), name: 'Havells MCB 32A Double Pole', price: 450, stockQuantity: 30, alertThreshold: 10 },
    { id: uuidv4(), name: 'Philips LED Bulb 9W', price: 110, stockQuantity: 50, alertThreshold: 15 },
    { id: uuidv4(), name: 'PVC Conduit Pipe 1 inch', price: 65, stockQuantity: 200, alertThreshold: 50 },
    { id: uuidv4(), name: 'Anchor Insulation Tape', price: 15, stockQuantity: 150, alertThreshold: 20 },
  ];

  const [items, setItems] = useState(() => loadState('a1_inventory', defaultItems));
  const [bills, setBills] = useState(() => loadState('a1_invoices', []));
  const [authConfig, setAuthConfig] = useState(() => loadState('a1_auth_config', { username: 'thiru', password: 'admin' }));
  const [customers, setCustomers] = useState(() => loadState('a1_customers', []));

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('a1_inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('a1_invoices', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('a1_auth_config', JSON.stringify(authConfig));
  }, [authConfig]);

  useEffect(() => {
    localStorage.setItem('a1_customers', JSON.stringify(customers));
  }, [customers]);

  // Actions
  const addItem = (itemData) => {
    setItems(prev => [...prev, { ...itemData, id: uuidv4() }]);
  };

  const updateItem = (id, updatedData) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const createBill = (billData, cartItems) => {
    const newBill = {
      ...billData,
      id: uuidv4(),
      date: new Date().toISOString(),
      items: cartItems
    };
    
    setBills(prev => [newBill, ...prev]);

    // Deduct stock
    setItems(prev => prev.map(item => {
      const cartItem = cartItems.find(ci => ci.itemId === item.id);
      if (cartItem) {
        return { ...item, stockQuantity: Math.max(0, item.stockQuantity - cartItem.quantity) };
      }
      return item;
    }));
    
    return newBill;
  };

  const getLowStockItems = () => {
    return items.filter(item => item.stockQuantity <= item.alertThreshold);
  };

  const updateAuth = (username, password) => {
    setAuthConfig({ username, password });
  };

  const addCustomer = (customerData) => {
    const newCustomer = { ...customerData, id: uuidv4(), createdAt: new Date().toISOString() };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const deleteBill = (id, shouldRestock = true) => {
    setBills(prev => {
      const billToDelete = prev.find(b => b.id === id);
      if (!billToDelete) return prev;
      
      if (shouldRestock) {
        // Restore stock
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

      return prev.filter(b => b.id !== id);
    });
  };

  const returnItemsFromBill = (billId, returnedItemsMap) => {
    setBills(prev => {
      const billIndex = prev.findIndex(b => b.id === billId);
      if (billIndex === -1) return prev;

      const bill = { ...prev[billIndex] };
      const updatedItems = [];
      let newTotal = 0;

      // Restore stock for returned items
      setItems(currentItems => {
        return currentItems.map(invItem => {
          if (returnedItemsMap[invItem.id]) {
            return { ...invItem, stockQuantity: invItem.stockQuantity + returnedItemsMap[invItem.id] };
          }
          return invItem;
        });
      });

      // Update bill items and total
      bill.items.forEach(cartItem => {
        const returnQty = returnedItemsMap[cartItem.itemId] || 0;
        const remainingQty = cartItem.quantity - returnQty;
        
        if (remainingQty > 0) {
          updatedItems.push({ ...cartItem, quantity: remainingQty });
          newTotal += remainingQty * cartItem.price;
        }
      });

      if (updatedItems.length === 0) {
        // All items returned, delete bill
        return prev.filter(b => b.id !== billId);
      }

      bill.items = updatedItems;
      bill.total = newTotal;

      const newBills = [...prev];
      newBills[billIndex] = bill;
      return newBills;
    });
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
      {children}
    </StoreContext.Provider>
  );
};
