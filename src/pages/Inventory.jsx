import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

const Inventory = () => {
  const { items, addItem, updateItem, deleteItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stockQuantity: '',
    alertThreshold: '',
    image: ''
  });

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price,
        stockQuantity: item.stockQuantity,
        alertThreshold: item.alertThreshold,
        image: item.image || ''
      });
      setEditingId(item.id);
    } else {
      setFormData({ name: '', price: '', stockQuantity: '', alertThreshold: '', image: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      alertThreshold: parseInt(formData.alertThreshold) || 0,
      image: formData.image
    };

    if (editingId) {
      updateItem(editingId, data);
    } else {
      addItem(data);
    }
    closeModal();
  };

  return (
    <div className="animate-slide-up">
      <div className="flex-row-between" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Inventory</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>No items in inventory. Add some to get started.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="glass-panel card">
              <div className="flex-row-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Price: ₹{item.price.toFixed(2)} | Threshold: {item.alertThreshold}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${item.stockQuantity <= item.alertThreshold ? 'badge-danger' : 'badge-success'}`}>
                    Stock: {item.stockQuantity}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openModal(item)}>
                  <Edit2 size={16} /> Edit
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => deleteItem(item.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
            <div className="flex-row-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'Edit Item' : 'New Item'}</h3>
              <button className="btn-icon btn-secondary" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Product Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({...formData, image: reader.result});
                      reader.readAsDataURL(file);
                    }
                  }} style={{ flex: 1, fontSize: '0.85rem' }} />
                </div>
                <input
                  className="input-field"
                  type="url"
                  placeholder="Or paste image link (https://...)"
                  value={typeof formData.image === 'string' && formData.image.startsWith('http') ? formData.image : ''}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  style={{ fontSize: '0.85rem' }}
                />
                {formData.image && (
                  <button type="button" onClick={() => setFormData({...formData, image: ''})}
                    style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    ✕ Remove Image
                  </button>
                )}
              </div>

              <div className="input-group">
                <label>Item Name</label>
                <input required className="input-field" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wire 1.5mm" />
              </div>
              <div className="input-group">
                <label>Price (₹)</label>
                <input required className="input-field" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Current Stock Quantity</label>
                <input required className="input-field" type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Low Stock Alert Threshold</label>
                <input required className="input-field" type="number" value={formData.alertThreshold} onChange={e => setFormData({...formData, alertThreshold: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {editingId ? 'Save Changes' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
