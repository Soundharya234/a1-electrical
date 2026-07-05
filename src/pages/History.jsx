import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { Calendar, Trash2, Search, FileText, ChevronDown, ChevronUp, Package, RotateCcw, X, Plus, Minus, Printer } from 'lucide-react';

const History = () => {
  const { bills, deleteBill, returnItemsFromBill } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBillId, setExpandedBillId] = useState(null);

  const [returnModalBill, setReturnModalBill] = useState(null);
  const [returnQtys, setReturnQtys] = useState({});
  const [printBill, setPrintBill] = useState(null);

  const handlePrint = (bill) => {
    setPrintBill(bill);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const openReturnModal = (bill) => {
    setReturnModalBill(bill);
    setReturnQtys({});
  };

  const closeReturnModal = () => {
    setReturnModalBill(null);
    setReturnQtys({});
  };

  const handleReturnQtyChange = (itemId, delta, maxQty) => {
    setReturnQtys(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [itemId]: next };
    });
  };

  const submitPartialReturn = () => {
    const hasReturns = Object.values(returnQtys).some(q => q > 0);
    if (!hasReturns) {
      alert("Please select at least one item to return.");
      return;
    }
    
    returnItemsFromBill(returnModalBill.id, returnQtys);
    closeReturnModal();
    setExpandedBillId(null);
  };

  const handleDelete = (id, shouldRestock) => {
    const msg = shouldRestock 
      ? "Are you sure you want to delete this bill AND return items to stock?"
      : "Are you sure you want to remove this log WITHOUT returning items to stock?";
    if (window.confirm(msg)) {
      deleteBill(id, shouldRestock);
    }
  };

  const toggleBill = (id) => {
    setExpandedBillId(prev => prev === id ? null : id);
  };

  const filteredBills = bills.filter(bill => {
    const searchStr = searchTerm.toLowerCase();
    return (
      bill.customerName.toLowerCase().includes(searchStr) || 
      bill.id.toLowerCase().includes(searchStr)
    );
  });

  // Group bills by date (e.g. "6/30/2026")
  const groupedBills = filteredBills.reduce((acc, bill) => {
    const dateStr = new Date(bill.date).toLocaleDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(bill);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedBills).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="animate-slide-up">
      <div className="flex-row-between" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Sales History</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Calendar size={20} />
        </div>
      </div>

      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ width: '100%', paddingLeft: '40px' }} 
            placeholder="Search by Invoice ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sortedDates.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No sales history found.</p>
        ) : (
          sortedDates.map(date => {
            const dateTotal = groupedBills[date].reduce((sum, b) => sum + b.total, 0);
            
            return (
              <div key={date}>
                <div className="flex-row-between" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{date}</h3>
                  <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>Total: ₹{dateTotal.toFixed(2)}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupedBills[date].map(bill => (
                    <div key={bill.id} className="glass-panel card">
                      <div className="flex-row-between" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="var(--primary-color)" />
                          <span style={{ fontWeight: 'bold' }}>{bill.id.substring(0,8).toUpperCase()}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(bill.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <div className="flex-row-between" style={{ marginBottom: '1rem' }}>
                        <div>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Customer: {bill.customerName}</p>
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => toggleBill(bill.id)}
                          >
                            {bill.items.length} items purchased {expandedBillId === bill.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                        <h4 style={{ margin: 0, color: 'var(--accent-color)' }}>₹{bill.total.toFixed(2)}</h4>
                      </div>

                      {expandedBillId === bill.id && (
                        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item Details:</h5>
                          {bill.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: idx !== bill.items.length - 1 ? '1px dashed var(--surface-border)' : 'none', paddingBottom: idx !== bill.items.length - 1 ? '0.25rem' : '0', marginBottom: idx !== bill.items.length - 1 ? '0.25rem' : '0' }}>
                              <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>(x{item.quantity})</span></span>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handlePrint(bill)}
                        >
                          <Printer size={14} /> Print Bill
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => openReturnModal(bill)}
                        >
                          <RotateCcw size={14} /> Partial Return
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: 1, minWidth: '100px', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handleDelete(bill.id, false)}
                        >
                          <Trash2 size={14} /> Delete Log
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handleDelete(bill.id, true)}
                        >
                          <Package size={14} /> Delete & Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      {returnModalBill && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeReturnModal(); }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '1.25rem' }}
          >
            <div className="flex-row-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Return Items</h3>
              <button className="btn-icon btn-secondary" onClick={closeReturnModal}><X size={20} /></button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select the quantity to return for each item. Returned items will be added back to your stock.
            </p>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {returnModalBill.items.map(item => {
                const returningQty = returnQtys[item.itemId] || 0;
                return (
                  <div key={item.itemId} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-border)' }}>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0' }}>{item.name}</h5>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bought: {item.quantity} | ₹{item.price} each</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn-icon btn-secondary" onClick={() => handleReturnQtyChange(item.itemId, -1, item.quantity)} disabled={returningQty <= 0}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center', color: returningQty > 0 ? 'var(--accent-color)' : 'inherit' }}>
                        {returningQty}
                      </span>
                      <button className="btn-icon btn-secondary" onClick={() => handleReturnQtyChange(item.itemId, 1, item.quantity)} disabled={returningQty >= item.quantity}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={submitPartialReturn}>
              Confirm Return
            </button>
          </div>
        </div>
      ,
        document.body
      )}
      {printBill && (
        <div id="printable-receipt">
          <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px dashed #3b82f6', paddingBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}>⚡ A1 Electrical</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>123 Main Street, City</p>
            <p style={{ margin: '2px 0 10px 0', fontSize: '12px', color: '#64748b' }}>Ph: 9876543210</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', textAlign: 'left', background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{fontWeight: 'bold', color: '#0f172a'}}>Invoice:</div>
                <div style={{color: '#475569'}}>{printBill.id.substring(0,8).toUpperCase()}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 'bold', color: '#0f172a'}}>Date:</div>
                <div style={{color: '#475569'}}>{new Date(printBill.date).toLocaleDateString()}</div>
              </div>
            </div>
            {printBill.customerName !== 'Walk-in Customer' && (
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', textAlign: 'left', color: '#0f172a' }}><strong>Customer:</strong> {printBill.customerName}</p>
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
              {printBill.items.map((item, idx) => (
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
            <span style={{ color: '#f59e0b', fontSize: '20px' }}>₹{printBill.total.toFixed(2)}</span>
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

export default History;
