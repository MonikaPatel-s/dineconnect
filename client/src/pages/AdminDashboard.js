import { useEffect, useState } from "react";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import config from "../config";
import "../App.css";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', categoryId: '', imageUrl: '', availability: true
  });
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");

  // Calculate today's revenue from orders
  const todayRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  useEffect(() => {
    fetchData();
    fetchPendingStaff();
  }, []);

  const fetchPendingStaff = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/pending-staff`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingStaff(data);
      }
    } catch (err) {}
  };

  const handleStaffApproval = async (staffId, approve) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/approve-staff/${staffId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve })
      });
      if (res.ok) {
        alert(approve ? '✅ Staff approved!' : '❌ Staff rejected!');
        fetchPendingStaff();
      }
    } catch (err) {}
  };

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes, tablesRes, ordersRes, statsRes] = await Promise.all([
        fetch(`${config.API_BASE_URL}/menu/categories`),
        fetch(`${config.API_BASE_URL}/menu/items?limit=100`),
        fetch(`${config.API_BASE_URL}/tables`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${config.API_BASE_URL}/orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${config.API_BASE_URL}/orders/stats/dashboard`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const cats = await catsRes.json();
      const items = await itemsRes.json();
      const tables = await tablesRes.json();
      const orders = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const stats = statsRes.ok ? await statsRes.json() : {};

      setCategories(cats);
      setItems(items.items || []);
      setTables(tables);
      setOrders(orders.orders || []);
      setStats(stats);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (tableId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/tables/${tableId}/qr`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();

      // Create download link
      const link = document.createElement('a');
      link.href = data.qrCode;
      link.download = `table-${data.tableNumber}-qr.png`;
      link.click();
    } catch (error) {
      console.error("Error generating QR:", error);
      alert("Error generating QR code");
    }
  };

  const createTable = async () => {
    const number = prompt("Enter table number:");
    const capacity = prompt("Enter table capacity:", "4");

    if (!number) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          number: parseInt(number),
          capacity: parseInt(capacity) || 4
        })
      });

      if (response.ok) {
        fetchData();
        alert("Table created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating table:", error);
      alert("Error creating table");
    }
  };

  const deleteTable = async (tableId, tableNumber) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/tables/${tableId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchData();
        alert("Table deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Error deleting table");
    }
  };

  const toggleItemAvailability = async (itemId, currentAvailability) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/menu/items/${itemId}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ availability: !currentAvailability })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const fetchOrdersByStatus = async (status) => {
    try {
      const url = status === 'all' 
        ? `${config.API_BASE_URL}/orders` 
        : `${config.API_BASE_URL}/orders?status=${status}`;
        
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh orders to show updated status
        fetchData();
        alert(`Order status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        alert(`Error updating status: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ name: '', description: '', price: '', categoryId: categories[0]?._id || '', imageUrl: '', availability: true });
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId?._id || '',
      imageUrl: item.imageUrl || '',
      availability: item.availability
    });
    setShowItemModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) {
        setItemForm(f => ({ ...f, imageUrl: data.imageUrl }));
        alert('✅ Image upload ho gayi!');
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (e) {
      alert('Upload error: ' + e.message);
    }
  };

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('Name aur Price zaroori hai!');
      return;
    }
    try {
      const url = editingItem
        ? `${config.API_BASE_URL}/menu/items/${editingItem._id}`
        : `${config.API_BASE_URL}/menu/items`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...itemForm, price: parseFloat(itemForm.price) })
      });

      if (res.ok) {
        alert(editingItem ? '✅ Item updated!' : '✅ Item added!');
        setShowItemModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (e) {
      alert('Server error');
    }
  };

  const deleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Delete "${itemName}"?`)) return;
    try {
      const res = await fetch(`${config.API_BASE_URL}/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { fetchData(); }
    } catch (e) {}
  };

  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', icon: '🍽️' });

  // Coupon management state
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxUses: '100', expiryDate: ''
  });
  const [showCouponModal, setShowCouponModal] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {}
  };

  // Load coupons on mount
  useEffect(() => { fetchCoupons(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue) {
      alert('Code aur Discount Value zaroori hai!');
      return;
    }
    try {
      const body = {
        code: couponForm.code.toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minOrderAmount: parseFloat(couponForm.minOrderAmount) || 0,
        maxUses: parseInt(couponForm.maxUses) || 100,
        expiryDate: couponForm.expiryDate || undefined
      };
      const res = await fetch(`${config.API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('✅ Coupon create ho gaya!');
        setShowCouponModal(false);
        setCouponForm({ code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxUses: '100', expiryDate: '' });
        fetchCoupons();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (e) { alert('Server error'); }
  };

  const deleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await fetch(`${config.API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCoupons();
    } catch (e) {}
  };

  const toggleCoupon = async (id) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/coupons/${id}/toggle`, {
        method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCoupons();
    } catch (e) {}
  };

  const saveCategory = async () => {
    if (!catForm.name) { alert('Category name zaroori hai!'); return; }
    try {
      const res = await fetch(`${config.API_BASE_URL}/menu/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(catForm)
      });
      if (res.ok) {
        alert('✅ Category add ho gayi!');
        setShowCatModal(false);
        setCatForm({ name: '', icon: '🍽️' });
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (e) { alert('Server error'); }
  };

  const deleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await fetch(`${config.API_BASE_URL}/menu/categories/${catId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div>
            <h1>👑 DineConnect Admin</h1>
            <p>Welcome back, {user.name}!</p>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <ThemeToggle />
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="admin-nav">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'orders', label: '📋 Orders' },
          { key: 'menu', label: '🍽️ Menu Items' },
          { key: 'categories', label: '📂 Categories' },
          { key: 'tables', label: '🪑 Tables' },
          { key: 'coupons', label: '🎟️ Coupons' },
          { key: 'staff', label: `👨‍🍳 Staff Approvals ${pendingStaff.length > 0 ? `(${pendingStaff.length})` : ''}` }
        ].map(tab => (
          <button
            key={tab.key}
            className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={tab.key === 'staff' && pendingStaff.length > 0 ? {background: '#e74c3c', color: 'white'} : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>📈 Today's Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <div className="stat-number">{orders.length}</div>
              </div>
              <div className="stat-card">
                <h3>Revenue Today</h3>
                <div className="stat-number">₹{todayRevenue.toFixed(0)}</div>
              </div>
              <div className="stat-card">
                <h3>Menu Items</h3>
                <div className="stat-number">{items.length}</div>
              </div>
              <div className="stat-card">
                <h3>Active Tables</h3>
                <div className="stat-number">{tables.length}</div>
              </div>
            </div>
            
            {orders.length > 0 && (
              <div className="order-summary">
                <h3>📋 Order Status Summary</h3>
                <div className="status-summary">
                  <div className="status-item">
                    <span className="status-label">Placed:</span>
                    <span className="status-count">{orders.filter(o => o.status === 'placed').length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Preparing:</span>
                    <span className="status-count">{orders.filter(o => o.status === 'preparing').length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Ready:</span>
                    <span className="status-count">{orders.filter(o => o.status === 'ready').length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Served:</span>
                    <span className="status-count">{orders.filter(o => o.status === 'served').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>📋 Order Management</h2>
              <div className="order-filters">
                <select onChange={(e) => fetchOrdersByStatus(e.target.value)}>
                  <option value="all">All Orders</option>
                  <option value="placed">Placed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                </select>
              </div>
            </div>
            
            <div className="orders-grid">
              {orders.length === 0 ? (
                <div className="no-items">
                  <p>No orders found.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="admin-order-card">
                    <div className="order-header">
                      <div className="order-number">#{order.orderNumber}</div>
                      <div className={`order-status status-${order.status}`}>
                        {order.status === 'placed' ? '🕐 PLACED' :
                         order.status === 'preparing' ? '👨‍🍳 PREPARING' :
                         order.status === 'ready' ? '🔔 READY' :
                         order.status === 'served' ? '✅ COMPLETED' :
                         order.status === 'canceled' ? '❌ CANCELED' :
                         order.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="order-details">
                      <div className="order-info">
                        <div className="order-customer">
                          👤 {order.customerId?.name || 'Guest Customer'}
                        </div>
                        <div className="order-table">
                          📍 Table {order.tableId?.number || 'N/A'}
                        </div>
                        <div className="order-time">
                          🕒 {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="order-items">
                        <h4>Items:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span>{item.menuItemId?.name || 'Unknown Item'}</span>
                            <span>x{item.qty}</span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-total">
                        <strong>Total: ₹{order.total}</strong>
                      </div>
                      
                      <div className="order-actions">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="placed">Placed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                        </select>
                        <button 
                          className="view-receipt-btn"
                          onClick={() => alert(`Receipt for Order #${order.orderNumber}`)}
                        >
                          📄 Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="menu-section">
            <div className="section-header">
              <h2>🍽️ Menu Items</h2>
              <button className="add-btn" onClick={openAddItem}>+ Add Item</button>
            </div>
            <div className="items-grid">
              {items.map(item => (
                <div key={item._id} className="admin-item-card">
                  <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="item-price">₹{item.price}</div>
                    <div className="item-actions" style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'8px'}}>
                      <button
                        className={`availability-btn ${item.availability ? 'available' : 'unavailable'}`}
                        onClick={() => toggleItemAvailability(item._id, item.availability)}
                      >
                        {item.availability ? '✅ Available' : '❌ Unavailable'}
                      </button>
                      <button
                        onClick={() => openEditItem(item)}
                        style={{background:'#3498db', color:'white', border:'none', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item._id, item.name)}
                        style={{background:'#e74c3c', color:'white', border:'none', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {showItemModal && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'30px',width:'90%',maxWidth:'500px',maxHeight:'90vh',overflowY:'auto'}}>
              <h2 style={{color:'#1a1a2e',marginBottom:'20px'}}>{editingItem ? '✏️ Edit Item' : '➕ Add New Item'}</h2>

              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Item Name *</label>
                  <input value={itemForm.name} onChange={e => setItemForm(f=>({...f,name:e.target.value}))}
                    placeholder="e.g. Chicken Biryani"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}} />
                </div>

                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Description</label>
                  <textarea value={itemForm.description} onChange={e => setItemForm(f=>({...f,description:e.target.value}))}
                    placeholder="Item description..."
                    rows={3}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',resize:'vertical',boxSizing:'border-box'}} />
                </div>

                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Price (₹) *</label>
                  <input type="number" value={itemForm.price} onChange={e => setItemForm(f=>({...f,price:e.target.value}))}
                    placeholder="e.g. 299"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}} />
                </div>

                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Category</label>
                  <select value={itemForm.categoryId} onChange={e => setItemForm(f=>({...f,categoryId:e.target.value}))}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>📸 Photo Upload</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}} />
                  {itemForm.imageUrl && (
                    <img src={itemForm.imageUrl} alt="preview"
                      style={{width:'100%',height:'150px',objectFit:'cover',borderRadius:'8px',marginTop:'8px'}} />
                  )}
                  <div style={{marginTop:'8px'}}>
                    <label style={{fontWeight:'bold',color:'#333',fontSize:'13px'}}>Ya Image URL paste karo:</label>
                    <input value={itemForm.imageUrl} onChange={e => setItemForm(f=>({...f,imageUrl:e.target.value}))}
                      placeholder="https://..."
                      style={{width:'100%',padding:'8px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box',fontSize:'13px'}} />
                  </div>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <input type="checkbox" checked={itemForm.availability}
                    onChange={e => setItemForm(f=>({...f,availability:e.target.checked}))} id="avail" />
                  <label htmlFor="avail" style={{fontWeight:'bold',color:'#333'}}>Available for ordering</label>
                </div>

                <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                  <button onClick={saveItem}
                    style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    {editingItem ? '✅ Update Item' : '➕ Add Item'}
                  </button>
                  <button onClick={() => setShowItemModal(false)}
                    style={{flex:1,padding:'12px',background:'#e74c3c',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h2>📂 Categories</h2>
              <button className="add-btn" onClick={() => setShowCatModal(true)}>
                + Add Category
              </button>
            </div>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category._id} className="category-item">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                  <span className="category-status">
                    {category.active ? '✅ Active' : '❌ Inactive'}
                  </span>
                  <button onClick={() => deleteCategory(category._id, category.name)}
                    style={{marginLeft:'auto', background:'#e74c3c', color:'white', border:'none', padding:'4px 12px', borderRadius:'6px', cursor:'pointer'}}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCatModal && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'30px',width:'90%',maxWidth:'400px'}}>
              <h2 style={{color:'#1a1a2e',marginBottom:'20px'}}>➕ Add Category</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Category Name *</label>
                  <input value={catForm.name} onChange={e => setCatForm(f=>({...f,name:e.target.value}))}
                    placeholder="e.g. Soups"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}} />
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Icon (Emoji)</label>
                  <input value={catForm.icon} onChange={e => setCatForm(f=>({...f,icon:e.target.value}))}
                    placeholder="e.g. 🍜"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}} />
                </div>
                <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                  <button onClick={saveCategory}
                    style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    ➕ Add
                  </button>
                  <button onClick={() => setShowCatModal(false)}
                    style={{flex:1,padding:'12px',background:'#e74c3c',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="categories-section">
            <div className="section-header">
              <h2>🎟️ Coupon Management</h2>
              <button className="add-btn" onClick={() => setShowCouponModal(true)}>+ Create Coupon</button>
            </div>

            {coupons.length === 0 ? (
              <div className="no-items" style={{textAlign:'center', padding:'40px', color:'#666'}}>
                <p style={{fontSize:'48px'}}>🎟️</p>
                <p>No coupons yet. Create one!</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'16px'}}>
                {coupons.map(coupon => (
                  <div key={coupon._id} style={{
                    background:'white', borderRadius:'12px', padding:'18px 20px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    border:`2px solid ${coupon.isActive ? '#27ae60' : '#bdc3c7'}`
                  }}>
                    <div>
                      <div style={{fontWeight:'bold', fontSize:'18px', letterSpacing:'1px'}}>
                        🎟️ {coupon.code}
                        <span style={{
                          marginLeft:'10px', fontSize:'12px', padding:'2px 8px',
                          borderRadius:'20px', background: coupon.isActive ? '#d5f5e3' : '#f0f0f0',
                          color: coupon.isActive ? '#27ae60' : '#999'
                        }}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{color:'#555', fontSize:'14px', marginTop:'4px'}}>
                        {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        {coupon.minOrderAmount > 0 && ` · Min order ₹${coupon.minOrderAmount}`}
                        {` · Used ${coupon.usedCount}/${coupon.maxUses}`}
                        {coupon.expiryDate && ` · Expires ${new Date(coupon.expiryDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button
                        onClick={() => toggleCoupon(coupon._id)}
                        style={{
                          background: coupon.isActive ? '#f39c12' : '#27ae60',
                          color:'white', border:'none', padding:'6px 14px', borderRadius:'8px',
                          cursor:'pointer', fontWeight:'bold', fontSize:'13px'
                        }}
                      >
                        {coupon.isActive ? '⏸ Disable' : '▶ Enable'}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon._id, coupon.code)}
                        style={{background:'#e74c3c', color:'white', border:'none', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'13px'}}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Coupon Modal */}
        {showCouponModal && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'30px',width:'90%',maxWidth:'460px',maxHeight:'90vh',overflowY:'auto'}}>
              <h2 style={{color:'#1a1a2e',marginBottom:'20px'}}>🎟️ Create Coupon</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Coupon Code *</label>
                  <input
                    value={couponForm.code}
                    onChange={e => setCouponForm(f=>({...f, code: e.target.value.toUpperCase()}))}
                    placeholder="e.g. SAVE20"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box',textTransform:'uppercase',fontWeight:'bold',letterSpacing:'2px'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={e => setCouponForm(f=>({...f, discountType: e.target.value}))}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}
                  >
                    <option value="percent">Percentage (e.g. 20%)</option>
                    <option value="flat">Flat Amount (e.g. ₹50)</option>
                  </select>
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>
                    {couponForm.discountType === 'percent' ? 'Discount % *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={e => setCouponForm(f=>({...f, discountValue: e.target.value}))}
                    placeholder={couponForm.discountType === 'percent' ? 'e.g. 20' : 'e.g. 100'}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={e => setCouponForm(f=>({...f, minOrderAmount: e.target.value}))}
                    placeholder="e.g. 300 (leave blank for no minimum)"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Max Uses</label>
                  <input
                    type="number"
                    value={couponForm.maxUses}
                    onChange={e => setCouponForm(f=>({...f, maxUses: e.target.value}))}
                    placeholder="e.g. 100"
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:'bold',color:'#333'}}>Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={e => setCouponForm(f=>({...f, expiryDate: e.target.value}))}
                    style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #ddd',marginTop:'4px',boxSizing:'border-box'}}
                  />
                </div>
                <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                  <button onClick={saveCoupon}
                    style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    🎟️ Create Coupon
                  </button>
                  <button onClick={() => setShowCouponModal(false)}
                    style={{flex:1,padding:'12px',background:'#e74c3c',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'bold',fontSize:'16px'}}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="staff-approvals-section">
            <h2>👨‍🍳 Staff Approval Requests</h2>
            {pendingStaff.length === 0 ? (
              <div className="no-items" style={{textAlign:'center', padding:'40px', color:'#666'}}>
                <p style={{fontSize:'48px'}}>✅</p>
                <p>No pending approval requests!</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'16px', marginTop:'20px'}}>
                {pendingStaff.map(staff => (
                  <div key={staff._id} style={{
                    background:'white', borderRadius:'12px', padding:'20px',
                    boxShadow:'0 2px 10px rgba(0,0,0,0.1)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    border:'2px solid #f39c12'
                  }}>
                    <div>
                      <div style={{fontWeight:'bold', fontSize:'18px'}}>👨‍🍳 {staff.name}</div>
                      <div style={{color:'#666', fontSize:'14px'}}>📧 {staff.email}</div>
                      <div style={{color:'#999', fontSize:'12px'}}>
                        🕒 Requested: {new Date(staff.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button
                        onClick={() => handleStaffApproval(staff._id, true)}
                        style={{
                          background:'#27ae60', color:'white', border:'none',
                          padding:'10px 20px', borderRadius:'8px', cursor:'pointer',
                          fontWeight:'bold', fontSize:'14px'
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleStaffApproval(staff._id, false)}
                        style={{
                          background:'#e74c3c', color:'white', border:'none',
                          padding:'10px 20px', borderRadius:'8px', cursor:'pointer',
                          fontWeight:'bold', fontSize:'14px'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="tables-section">
            <div className="section-header">
              <h2>🪑 Tables</h2>
              <button className="add-btn" onClick={createTable}>
                + Add Table
              </button>
            </div>
            <div className="tables-grid">
              {tables.map(table => (
                <div key={table._id} className="table-card">
                  <div className="table-header">
                    <div className="table-number">Table {table.number}</div>
                    <div className="table-capacity">Capacity: {table.capacity}</div>
                  </div>
                  
                  <div className="table-qr-preview">
                    <QRCodeDisplay 
                      value={`http://${window.location.hostname === 'localhost' ? '100.102.244.77' : window.location.hostname}:3001/m/${table.qrSlug}`}
                      size={120}
                    />
                  </div>
                  
                  <div className="table-actions">
                    <button
                      className="qr-btn"
                      onClick={() => generateQR(table._id)}
                    >
                      📱 Download QR
                    </button>
                    <button
                      className="view-menu-btn"
                      onClick={() => window.open(`http://${window.location.hostname === 'localhost' ? '100.102.244.77' : window.location.hostname}:3001/m/${table.qrSlug}`, '_blank')}
                    >
                      🍽️ Test Menu
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTable(table._id, table.number)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
