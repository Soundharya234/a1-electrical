import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [authConfig, setAuthConfig] = useState({ username: 'thiru', password: 'admin' });
  const [loading, setLoading] = useState(true);

  // Helper to load from local storage
  const loadLocalState = (key) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeItems, unsubscribeBills, unsubscribeCustomers, unsubscribeAuth;

    const setupListeners = async () => {
      // 1. Setup real-time listeners
      unsubscribeItems = onSnapshot(collection(db, 'items'), (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      unsubscribeBills = onSnapshot(collection(db, 'bills'), (snapshot) => {
        // Sort bills by date descending
        const fetchedBills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedBills.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBills(fetchedBills);
      });

      unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
        setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      unsubscribeAuth = onSnapshot(doc(db, 'settings', 'authConfig'), (docSnap) => {
        if (docSnap.exists()) {
          setAuthConfig(docSnap.data());
        }
      });

      // 2. Migration logic: If Firestore is empty, migrate local data
      try {
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        if (itemsSnapshot.empty) {
          console.log("Firestore empty, running migration...");
          const localItems = loadLocalState('a1_inventory');
          const localBills = loadLocalState('a1_invoices');
          const localCustomers = loadLocalState('a1_customers');
          const localAuth = loadLocalState('a1_auth_config');

          if (localItems && localItems.length > 0) {
            const batch = writeBatch(db);
            
            localItems.forEach(item => {
              batch.set(doc(collection(db, 'items'), item.id), item);
            });

            if (localBills) {
              localBills.forEach(bill => {
                batch.set(doc(collection(db, 'bills'), bill.id), bill);
              });
            }

            if (localCustomers) {
              localCustomers.forEach(customer => {
                batch.set(doc(collection(db, 'customers'), customer.id), customer);
              });
            }

            if (localAuth) {
              batch.set(doc(db, 'settings', 'authConfig'), localAuth);
            } else {
              batch.set(doc(db, 'settings', 'authConfig'), { username: 'thiru', password: 'admin' });
            }

            await batch.commit();
            console.log("Migration complete!");
          } else {
             // No local data, initialize with default items
             const defaultItems = [
              { id: uuidv4(), name: 'Finolex 1.5 sq mm Wire Coil', price: 1200, stockQuantity: 20, alertThreshold: 5 },
              { id: uuidv4(), name: 'Anchor Roma Switch 6A', price: 45, stockQuantity: 100, alertThreshold: 20 },
              { id: uuidv4(), name: 'Crompton Ceiling Fan 1200mm', price: 1850, stockQuantity: 15, alertThreshold: 3 },
              { id: uuidv4(), name: 'Havells MCB 32A Double Pole', price: 450, stockQuantity: 30, alertThreshold: 10 },
              { id: uuidv4(), name: 'Philips LED Bulb 9W', price: 110, stockQuantity: 50, alertThreshold: 15 },
              { id: uuidv4(), name: 'PVC Conduit Pipe 1 inch', price: 65, stockQuantity: 200, alertThreshold: 50 },
              { id: uuidv4(), name: 'Anchor Insulation Tape', price: 15, stockQuantity: 150, alertThreshold: 20 },
            ];
            const batch = writeBatch(db);
            defaultItems.forEach(item => {
              batch.set(doc(collection(db, 'items'), item.id), item);
            });
            batch.set(doc(db, 'settings', 'authConfig'), { username: 'thiru', password: 'admin' });
            await batch.commit();
          }
        }
      } catch (error) {
        console.error("Firebase migration error:", error);
      } finally {
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeItems) unsubscribeItems();
      if (unsubscribeBills) unsubscribeBills();
      if (unsubscribeCustomers) unsubscribeCustomers();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Actions
  const addItem = async (itemData) => {
    const id = uuidv4();
    await setDoc(doc(db, 'items', id), { ...itemData, id });
  };

  const updateItem = async (id, updatedData) => {
    await setDoc(doc(db, 'items', id), updatedData, { merge: true });
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const createBill = async (billData, cartItems) => {
    const id = uuidv4();
    const newBill = {
      ...billData,
      id,
      date: new Date().toISOString(),
      items: cartItems
    };
    
    // Create bill
    await setDoc(doc(db, 'bills', id), newBill);

    // Deduct stock
    const batch = writeBatch(db);
    cartItems.forEach(cartItem => {
      const item = items.find(i => i.id === cartItem.itemId);
      if (item) {
        batch.set(doc(db, 'items', item.id), { stockQuantity: Math.max(0, item.stockQuantity - cartItem.quantity) }, { merge: true });
      }
    });
    await batch.commit();
    
    return newBill;
  };

  const getLowStockItems = () => {
    return items.filter(item => item.stockQuantity <= item.alertThreshold);
  };

  const updateAuth = async (username, password) => {
    await setDoc(doc(db, 'settings', 'authConfig'), { username, password });
  };

  const addCustomer = async (customerData) => {
    const id = uuidv4();
    const newCustomer = { ...customerData, id, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'customers', id), newCustomer);
    return newCustomer;
  };

  const updateCustomer = async (id, updatedData) => {
    await setDoc(doc(db, 'customers', id), updatedData, { merge: true });
  };

  const deleteCustomer = async (id) => {
    await deleteDoc(doc(db, 'customers', id));
  };

  const deleteBill = async (id, shouldRestock = true) => {
    const billToDelete = bills.find(b => b.id === id);
    if (!billToDelete) return;
    
    if (shouldRestock) {
      const batch = writeBatch(db);
      billToDelete.items.forEach(cartItem => {
        const item = items.find(i => i.id === cartItem.itemId);
        if (item) {
          batch.set(doc(db, 'items', item.id), { stockQuantity: item.stockQuantity + cartItem.quantity }, { merge: true });
        }
      });
      await batch.commit();
    }

    await deleteDoc(doc(db, 'bills', id));
  };

  const returnItemsFromBill = async (billId, returnedItemsMap) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const updatedItems = [];
    let newTotal = 0;
    const batch = writeBatch(db);

    // Restore stock for returned items
    bill.items.forEach(cartItem => {
      const returnQty = returnedItemsMap[cartItem.itemId] || 0;
      const remainingQty = cartItem.quantity - returnQty;
      
      if (returnQty > 0) {
        const invItem = items.find(i => i.id === cartItem.itemId);
        if (invItem) {
          batch.set(doc(db, 'items', invItem.id), { stockQuantity: invItem.stockQuantity + returnQty }, { merge: true });
        }
      }

      if (remainingQty > 0) {
        updatedItems.push({ ...cartItem, quantity: remainingQty });
        newTotal += remainingQty * cartItem.price;
      }
    });

    if (updatedItems.length === 0) {
      await deleteDoc(doc(db, 'bills', billId));
    } else {
      batch.set(doc(db, 'bills', billId), { items: updatedItems, total: newTotal }, { merge: true });
    }
    
    await batch.commit();
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
          <h2>Loading A1 Electrical...</h2>
        </div>
      )}
    </StoreContext.Provider>
  );
};
