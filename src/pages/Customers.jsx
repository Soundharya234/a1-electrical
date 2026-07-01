import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Users, Plus, Search, Phone, MapPin, Trash2, Edit2, X, Check, ChevronDown, ChevronUp, Receipt } from 'lucide-react';

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, bills } = useStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData);
    }
    resetForm();
  };

  const startEdit = (customer) => {
    setFormData({ name: customer.name, phone: customer.phone, address: customer.address || '' });
    setEditingId(customer.id);
    setShowForm(true);
    setExpandedId(null);
  };

  const getCustomerBills = (customerId) =>
    bills.filter(b => b.customerId === customerId);

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} /> Customers
        </h2>
        <button
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-panel card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Customer' : 'New Customer'}</h3>
            <button className="btn btn-secondary btn-icon" onClick={resetForm}><X size={16} /></button>
          </div>
          <div className="input-group">
            <label>Name *</label>
            <input
              className="input-field"
              type="text"
              placeholder="Customer name"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="input-group">
            <label>Phone *</label>
            <input
              className="input-field"
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="input-group">
            <label>Address (Optional)</label>
            <input
              className="input-field"
              type="text"
              placeholder="Area / Street"
              value={formData.address}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.phone.trim()}
          >
            <Check size={16} /> {editingId ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          style={{ paddingLeft: '2.25rem', width: '100%' }}
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="glass-panel card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <p>{customers.length === 0 ? 'No customers yet. Add your first customer!' : 'No customers match your search.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(customer => {
            const customerBills = getCustomerBills(customer.id);
            const totalSpent = customerBills.reduce((sum, b) => sum + b.total, 0);
            const isExpanded = expandedId === customer.id;

            return (
              <div key={customer.id} className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {/* Customer Header */}
                <div
                  style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1rem', color: 'white', flexShrink: 0
                      }}>
                        {customer.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{customer.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <Phone size={12} /> {customer.phone}
                        </div>
                      </div>
                    </div>
                    {customer.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '44px' }}>
                        <MapPin size={11} /> {customer.address}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customerBills.length} bills</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.9rem' }}>₹{totalSpent.toFixed(0)}</div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--surface-border)', padding: '1rem' }}>
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                        onClick={() => startEdit(customer)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      {confirmDelete === customer.id ? (
                        <>
                          <button
                            className="btn btn-danger"
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                            onClick={() => { deleteCustomer(customer.id); setConfirmDelete(null); setExpandedId(null); }}
                          >
                            <Check size={14} /> Confirm Delete
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                            onClick={() => setConfirmDelete(null)}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                          onClick={() => setConfirmDelete(customer.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>

                    {/* Bill History */}
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Receipt size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                      Purchase History
                    </h4>
                    {customerBills.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>No bills yet for this customer.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {customerBills.map(bill => (
                          <div key={bill.id} style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.6rem 0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                #{bill.id.substring(0, 8).toUpperCase()}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {bill.items.length} item(s)
                              </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                              ₹{bill.total.toFixed(2)}
                            </div>
                          </div>
                        ))}
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--success-color)', marginTop: '0.25rem' }}>
                          Total Spent: ₹{totalSpent.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Customers;
