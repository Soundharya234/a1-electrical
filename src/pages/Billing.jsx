import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Printer } from 'lucide-react';

const Billing = () => {
  const { items, createBill } = useStore();
  const [cart, setCart] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [lastBill, setLastBill] = useState(null);

  const availableItems = items.filter(item => item.stockQuantity > 0);

  const addToCart = () => {
    if (!selectedItemId) return;
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        if (existing.quantity >= item.stockQuantity) return prev; // max stock reached
        return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, quantity: 1, maxStock: item.stockQuantity }];
    });
    setSelectedItemId('');
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const newQ = item.quantity + delta;
        if (newQ > 0 && newQ <= item.maxStock) {
          return { ...item, quantity: newQ };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.itemId !== itemId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newBill = createBill({
      customerName: customerName || 'Walk-in Customer',
      total: totalAmount
    }, cart);

    setLastBill(newBill);
    setCart([]);
    setCustomerName('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  return (
    <div className="animate-slide-up">
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Billing & POS</h2>

      {successMsg && (
        <div className="glass-panel" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <span>Bill generated successfully! Stock deducted.</span>
          </div>
          <button className="btn" onClick={() => window.print()} style={{ alignSelf: 'flex-start', backgroundColor: '#10b981', color: '#fff', border: 'none' }}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      )}

      <div className="glass-panel card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add Items to Bill</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            className="input-field" 
            style={{ flex: 1 }}
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            <option value="">Select an Item...</option>
            {availableItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} - ₹{item.price} ({item.stockQuantity} in stock)
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={addToCart} disabled={!selectedItemId}>
            Add
          </button>
        </div>
      </div>

      <div className="glass-panel card">
        <div className="flex-row-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ShoppingCart size={20} /> Current Cart
          </h3>
          <span className="badge badge-success">₹{totalAmount.toFixed(2)}</span>
        </div>

        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem 0' }}>Cart is empty.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {cart.map(item => (
                <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>₹{item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn-icon btn-secondary" onClick={() => updateQuantity(item.itemId, -1)} disabled={item.quantity <= 1}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button className="btn-icon btn-secondary" onClick={() => updateQuantity(item.itemId, 1)} disabled={item.quantity >= item.maxStock}>
                      <Plus size={14} />
                    </button>
                    <button className="btn-icon btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => removeFromCart(item.itemId)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="input-group">
              <label>Customer Name (Optional)</label>
              <input 
                className="input-field" 
                type="text" 
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
              onClick={handleCheckout}
            >
              Checkout (₹{totalAmount.toFixed(2)})
            </button>
          </>
        )}
      </div>
      
      {lastBill && (
        <div id="printable-receipt">
          <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px dashed #3b82f6', paddingBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}>⚡ A1 Electrical</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>123 Main Street, City</p>
            <p style={{ margin: '2px 0 10px 0', fontSize: '12px', color: '#64748b' }}>Ph: 9876543210</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', textAlign: 'left', background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{fontWeight: 'bold', color: '#0f172a'}}>Invoice:</div>
                <div style={{color: '#475569'}}>{lastBill.id.substring(0,8).toUpperCase()}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 'bold', color: '#0f172a'}}>Date:</div>
                <div style={{color: '#475569'}}>{new Date(lastBill.date).toLocaleDateString()}</div>
              </div>
            </div>
            {lastBill.customerName !== 'Walk-in Customer' && (
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', textAlign: 'left', color: '#0f172a' }}><strong>Customer:</strong> {lastBill.customerName}</p>
            )}
          </div>

          <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#0f172a' }}>
                <th style={{ textAlign: 'left', padding: '5px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '5px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '5px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {lastBill.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 0', paddingRight: '5px', color: '#334155' }}>
                    {item.name} <br/>
                    <span style={{fontSize: '10px', color: '#94a3b8'}}>@ ₹{item.price.toFixed(2)}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 0', verticalAlign: 'top', color: '#334155' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0', verticalAlign: 'top', fontWeight: '600', color: '#0f172a' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 'bold', borderTop: '2px dashed #3b82f6', borderBottom: '2px dashed #3b82f6', padding: '10px 0', marginBottom: '20px', color: '#0f172a' }}>
            <span>Total Amount:</span>
            <span style={{ color: '#f59e0b', fontSize: '20px' }}>₹{lastBill.total.toFixed(2)}</span>
          </div>

          <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '12px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#3b82f6' }}>Thank you for shopping!</p>
            <p style={{ margin: 0, color: '#94a3b8' }}>Goods once sold will not be taken back.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
