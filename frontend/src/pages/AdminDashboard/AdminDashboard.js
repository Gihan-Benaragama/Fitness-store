import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, productAPI, orderAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Supplements',
    subCategory: 'Protein',
    price: '',
    discountPrice: '',
    stock: 0,
    images: '',
    brand: '',
    sizes: '',
    weight: '',
    flavour: ''
  });
  const [productImage, setProductImage] = useState(null);
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [orderSummaryRange, setOrderSummaryRange] = useState('week');

  // Check if admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate, showAllProducts]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        userAPI.getAllUsers().catch(() => ({ data: [] })),
        productAPI.getAllProducts({ showAll: showAllProducts }).catch(() => ({ data: [] })),
        orderAPI.getAllOrders().catch(() => ({ data: [] }))
      ]);

      const usersList = usersRes.data || [];
      const productsList = productsRes.data || [];
      const ordersList = ordersRes.data || [];

      setUsers(usersList);
      setProducts(productsList);
      setOrders(ordersList);
      setStats({
        totalUsers: usersList.length,
        totalProducts: productsList.length,
        totalOrders: ordersList.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => 
        prev.map((order) => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setProductImage(file);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');

    if (!productForm.name || !productForm.category || !productForm.price) {
      setProductError('Name, category, and price are required.');
      return;
    }

    const payload = new FormData();
    payload.append('name', productForm.name.trim());
    payload.append('description', productForm.description.trim());
    payload.append('category', productForm.category);
    if (productForm.subCategory) payload.append('subCategory', productForm.subCategory);
    payload.append('price', productForm.price);
    if (productForm.discountPrice) payload.append('discountPrice', productForm.discountPrice);
    payload.append('stock', productForm.stock ?? 0);
    if (productForm.brand.trim()) payload.append('brand', productForm.brand.trim());
    if (productForm.sizes.trim()) payload.append('sizes', productForm.sizes);
    if (productForm.weight.trim()) payload.append('weight', productForm.weight.trim());
    if (productForm.flavour.trim()) payload.append('flavour', productForm.flavour);
    if (productForm.images.trim()) payload.append('images', productForm.images);
    if (productImage) payload.append('image', productImage);

    try {
      const isEditing = Boolean(editingProductId);
      const response = isEditing
        ? await productAPI.updateProduct(editingProductId, payload)
        : await productAPI.createProduct(payload);
      const saved = response.data?.product;

      if (saved) {
        if (isEditing) {
          setProducts((prev) => prev.map((item) => (
            item._id === editingProductId ? saved : item
          )));
        } else {
          setProducts((prev) => [saved, ...prev]);
          setStats((prev) => ({
            ...prev,
            totalProducts: prev.totalProducts + 1
          }));
        }
      } else {
        await fetchDashboardData();
      }

      setProductSuccess(isEditing ? 'Product updated successfully.' : 'Product created successfully.');
      setProductForm({
        name: '',
        description: '',
        category: 'Supplements',
        subCategory: 'Protein',
        price: '',
        discountPrice: '',
        stock: 0,
        images: '',
        brand: '',
        sizes: '',
        weight: '',
        flavour: ''
      });
      setProductImage(null);
      setEditingProductId(null);
    } catch (error) {
      setProductError(error.response?.data?.message || 'Failed to create product.');
    }
  };

  const handleEditProduct = (product) => {
    setProductFormOpen(true);
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Supplements',
      subCategory: product.subCategory || 'Protein',
      price: product.price ?? '',
      discountPrice: product.discountPrice ?? '',
      stock: product.stock ?? 0,
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      brand: product.brand || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      weight: product.weight || '',
      flavour: Array.isArray(product.flavour) ? product.flavour.join(', ') : ''
    });
    setProductImage(null);
    setProductError('');
    setProductSuccess('');
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Delete this product? This cannot be undone.');
    if (!confirmed) return;

    try {
      await productAPI.deleteProduct(productId);
      setProducts((prev) => prev.filter((item) => item._id !== productId));
      setStats((prev) => ({
        ...prev,
        totalProducts: Math.max(prev.totalProducts - 1, 0)
      }));
      if (editingProductId === productId) {
        setEditingProductId(null);
        setProductFormOpen(false);
      }
    } catch (error) {
      setProductError(error.response?.data?.message || 'Failed to delete product.');
    }
  };

  const getOrdersTrendData = () => {
    const today = new Date();
    const currentPeriodDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (6 - index));
      return day;
    });

    const previousPeriodDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (13 - index));
      return day;
    });

    const toDayKey = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const currentKeys = currentPeriodDays.map(toDayKey);
    const previousKeys = previousPeriodDays.map(toDayKey);

    const currentCounts = Object.fromEntries(currentKeys.map((key) => [key, 0]));
    const previousCounts = Object.fromEntries(previousKeys.map((key) => [key, 0]));

    orders.forEach((order) => {
      if (!order?.createdAt) return;
      const createdDate = new Date(order.createdAt);
      if (Number.isNaN(createdDate.getTime())) return;
      const key = toDayKey(createdDate);
      if (currentCounts[key] !== undefined) currentCounts[key] += 1;
      if (previousCounts[key] !== undefined) previousCounts[key] += 1;
    });

    const chartData = currentPeriodDays.map((day, index) => {
      const key = currentKeys[index];
      return {
        label: day.toLocaleDateString(undefined, { weekday: 'short' }),
        count: currentCounts[key]
      };
    });

    const currentTotal = chartData.reduce((sum, item) => sum + item.count, 0);
    const previousTotal = Object.values(previousCounts).reduce((sum, value) => sum + value, 0);
    const diff = currentTotal - previousTotal;
    const percentChange = previousTotal > 0
      ? (diff / previousTotal) * 100
      : (currentTotal > 0 ? 100 : 0);

    return {
      chartData,
      currentTotal,
      previousTotal,
      percentChange,
      diff,
      maxCount: Math.max(...chartData.map((item) => item.count), 1)
    };
  };

  const getOrderSummaryData = (range) => {
    const now = new Date();
    const startDate = new Date(now);

    if (range === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 29);
    }

    const filteredOrders = orders.filter((order) => {
      if (!order?.createdAt) return false;
      const createdDate = new Date(order.createdAt);
      return !Number.isNaN(createdDate.getTime()) && createdDate >= startDate;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => {
      const total = Number(order?.totalPrice ?? order?.totalAmount ?? 0);
      const shipping = Number(order?.shippingPrice ?? 0);
      return sum + total + shipping;
    }, 0);

    return {
      totalOrders: filteredOrders.length,
      delivered: filteredOrders.filter((order) => order.status === 'Delivered').length,
      pending: filteredOrders.filter((order) => order.status === 'Pending').length,
      cancelled: filteredOrders.filter((order) => order.status === 'Cancelled').length,
      revenue: totalRevenue
    };
  };

  const ordersTrend = getOrdersTrendData();
  const outOfStockProducts = products.filter((product) => Number(product?.stock) <= 0);
  const orderSummary = getOrderSummaryData(orderSummaryRange);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="user-section">
            <span>Welcome, {user?.firstName} {user?.lastName}</span>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button 
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
              {orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="notification-badge">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <section className="tab-content">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                  <span className="stat-label">Registered users</span>
                </div>
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <p className="stat-number">{stats.totalProducts}</p>
                  <span className="stat-label">Active products</span>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="stat-number">{stats.totalOrders}</p>
                  <span className="stat-label">Total orders</span>
                </div>
              </div>

              <div className="orders-chart-card">
                <div className="order-summary-toolbar">
                  <h3>Order Summary</h3>
                  <select
                    className="order-summary-select"
                    value={orderSummaryRange}
                    onChange={(e) => setOrderSummaryRange(e.target.value)}
                  >
                    <option value="day">One Day</option>
                    <option value="week">One Week</option>
                    <option value="month">One Month</option>
                  </select>
                </div>
                <div className="order-summary-grid">
                  <div className="order-summary-item">
                    <span>Total Orders</span>
                    <strong>{orderSummary.totalOrders}</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Revenue</span>
                    <strong>LKR {orderSummary.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Delivered</span>
                    <strong>{orderSummary.delivered}</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Pending</span>
                    <strong>{orderSummary.pending}</strong>
                  </div>
                  <div className="order-summary-item">
                    <span>Cancelled</span>
                    <strong>{orderSummary.cancelled}</strong>
                  </div>
                </div>
              </div>

              <div className="orders-chart-card">
                <div className="orders-chart-header">
                  <h3>Orders Trend (Last 7 Days)</h3>
                  <div className="orders-trend-metrics">
                    <span className="orders-trend-total">{ordersTrend.currentTotal} orders</span>
                    <span className={`orders-trend-change ${ordersTrend.diff >= 0 ? 'up' : 'down'}`}>
                      {ordersTrend.diff >= 0 ? '▲' : '▼'} {Math.abs(ordersTrend.percentChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="orders-trend-subtitle">
                  Compared to previous 7 days: {ordersTrend.previousTotal} orders
                </p>

                <div className="orders-chart-bars">
                  {ordersTrend.chartData.map((point) => (
                    <div key={point.label} className="orders-chart-bar-item">
                      <span className="orders-chart-count">{point.count}</span>
                      <div className="orders-chart-bar-track">
                        <div
                          className="orders-chart-bar-fill"
                          style={{ height: `${(point.count / ordersTrend.maxCount) * 100}%` }}
                        ></div>
                      </div>
                      <span className="orders-chart-label">{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="welcome-section">
                <h3>Quick Stats</h3>
                <ul className="quick-stats">
                  <li>Total registered: <strong>{users.length}</strong></li>
                  <li>Admin users: <strong>{users.filter(u => u.isAdmin).length}</strong></li>
                  <li>Active products: <strong>{products.length}</strong></li>
                  <li>Out of stock: <strong>{outOfStockProducts.length}</strong></li>
                  <li>Blocked users: <strong>{users.filter(u => u.isBlocked).length}</strong></li>
                </ul>
              </div>
            </section>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section className="tab-content">
              <h2>Manage Users</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge ${user.isAdmin ? 'admin' : 'user'}`}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                              {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <section className="tab-content">
              <h2>Manage Products</h2>
              <div className="inventory-alert-card">
                <div className="inventory-alert-header">
                  <h3>Out-of-Stock Products ({outOfStockProducts.length})</h3>
                </div>
                {outOfStockProducts.length > 0 ? (
                  <ul className="inventory-alert-list">
                    {outOfStockProducts.map((product) => (
                      <li key={`out-${product._id}`}>
                        <span className="inventory-product-name">{product.name}</span>
                        <span className="inventory-product-meta">{product.category}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="inventory-alert-empty">All products currently have stock.</p>
                )}
              </div>
              <div className="product-actions">
                <label className="toggle-control">
                  <input
                    type="checkbox"
                    checked={showAllProducts}
                    onChange={(e) => setShowAllProducts(e.target.checked)}
                  />
                  <span>Show all products</span>
                </label>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => {
                    setProductFormOpen((prev) => !prev);
                    if (productFormOpen) {
                      setEditingProductId(null);
                    }
                    setProductError('');
                    setProductSuccess('');
                  }}
                >
                  {productFormOpen ? 'Close Add Product' : 'Add Product'}
                </button>
                {editingProductId && (
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        name: '',
                        description: '',
                        category: 'Supplements',
                        subCategory: 'Protein',
                        price: '',
                        discountPrice: '',
                        stock: 0,
                        images: '',
                        brand: '',
                        sizes: '',
                        weight: '',
                        flavour: ''
                      });
                      setProductImage(null);
                      setProductError('');
                      setProductSuccess('');
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {productFormOpen && (
                <div className="product-form-card">
                  <h3>Add New Product</h3>
                  {productError && <div className="error-message">{productError}</div>}
                  {productSuccess && <div className="success-message">{productSuccess}</div>}
                  <form className="product-form" onSubmit={handleCreateProduct}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productName">Name *</label>
                        <input
                          id="productName"
                          name="name"
                          type="text"
                          value={productForm.name}
                          onChange={handleProductChange}
                          placeholder="Product name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productBrand">Brand</label>
                        <input
                          id="productBrand"
                          name="brand"
                          type="text"
                          value={productForm.brand}
                          onChange={handleProductChange}
                          placeholder="Brand"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="productDescription">Description</label>
                      <textarea
                        id="productDescription"
                        name="description"
                        value={productForm.description}
                        onChange={handleProductChange}
                        placeholder="Short product description"
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productCategory">Category *</label>
                        <select
                          id="productCategory"
                          name="category"
                          value={productForm.category}
                          onChange={handleProductChange}
                          required
                        >
                          <option value="Supplements">Supplements</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Shaker Bottles">Shaker Bottles</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="productSubCategory">Sub-Category</label>
                        <select
                          id="productSubCategory"
                          name="subCategory"
                          value={productForm.subCategory}
                          onChange={handleProductChange}
                        >
                          <option value="Protein">Protein</option>
                          <option value="Vitamins">Vitamins</option>
                          <option value="Pre-workout">Pre-workout</option>
                          <option value="T-Shirt">T-Shirt</option>
                          <option value="Shorts">Shorts</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Bag">Bag</option>
                          <option value="Lifting Accessories">Lifting Accessories</option>
                          <option value="Shaker Bottles">Shaker Bottles</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productPrice">Price *</label>
                        <input
                          id="productPrice"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={handleProductChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productDiscount">Discount Price</label>
                        <input
                          id="productDiscount"
                          name="discountPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.discountPrice}
                          onChange={handleProductChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productStock">Stock</label>
                        <input
                          id="productStock"
                          name="stock"
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.stock}
                          onChange={handleProductChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productImages">Image URLs (optional)</label>
                        <input
                          id="productImages"
                          name="images"
                          type="text"
                          value={productForm.images}
                          onChange={handleProductChange}
                          placeholder="https://... , https://..."
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productSizes">Sizes (Clothing)</label>
                        <input
                          id="productSizes"
                          name="sizes"
                          type="text"
                          value={productForm.sizes}
                          onChange={handleProductChange}
                          placeholder="XS, S, M, L"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productImageFile">Upload Image</label>
                        <input
                          id="productImageFile"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleProductFileChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="productWeight">Weight (Supplements)</label>
                        <input
                          id="productWeight"
                          name="weight"
                          type="text"
                          value={productForm.weight}
                          onChange={handleProductChange}
                          placeholder="1kg"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="productFlavour">Flavours</label>
                        <input
                          id="productFlavour"
                          name="flavour"
                          type="text"
                          value={productForm.flavour}
                          onChange={handleProductChange}
                          placeholder="Chocolate, Vanilla"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="primary-btn" type="submit">Create Product</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product._id} className={Number(product.stock) <= 0 ? 'out-of-stock-row' : ''}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>${product.price}</td>
                          <td>
                            <span className={Number(product.stock) <= 0 ? 'stock-pill out' : 'stock-pill in'}>
                              {product.stock ?? 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="rating">
                              ⭐ {product.rating ? product.rating.toFixed(1) : 'N/A'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn"
                              type="button"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn danger-btn"
                              type="button"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <section className="tab-content">
              <h2>Manage Orders</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-data">No orders found</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <React.Fragment key={order._id}>
                          <tr 
                            className={`${order.status === 'Pending' ? 'new-order' : ''} order-row`}
                            onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="expand-icon">
                              <span className={expandedOrderId === order._id ? '▼' : '▶'}></span>
                            </td>
                            <td>#{order._id.slice(-8)}</td>
                            <td>
                              {order.user ? (
                                <>
                                  {order.user.firstName} {order.user.lastName}
                                  <br />
                                  <small>{order.user.email}</small>
                                </>
                              ) : order.guestInfo ? (
                                <>
                                  {order.guestInfo.name}
                                  <br />
                                  <small>{order.guestInfo.email}</small>
                                </>
                              ) : (
                                'Guest'
                              )}
                            </td>
                            <td>LKR {(order.totalPrice + (order.shippingPrice || 0)).toLocaleString()}</td>
                            <td>
                              <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                          {expandedOrderId === order._id && (
                            <tr className="order-details-row">
                              <td colSpan="6">
                                <div className="order-items-container">
                                  <h4>Order Items</h4>
                                  {order.items && order.items.length > 0 ? (
                                    <table className="items-table">
                                      <thead>
                                        <tr>
                                          <th>Product Name</th>
                                          <th>Quantity</th>
                                          <th>Price</th>
                                          <th>Subtotal</th>
                                          <th>Size/Flavour</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items.map((item, idx) => (
                                          <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>LKR {item.price.toLocaleString()}</td>
                                            <td>LKR {(item.quantity * item.price).toLocaleString()}</td>
                                            <td>
                                              {item.size && <span>{item.size}</span>}
                                              {item.size && item.flavour && <span> - </span>}
                                              {item.flavour && <span>{item.flavour}</span>}
                                              {!item.size && !item.flavour && <span>-</span>}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p>No items in this order</p>
                                  )}
                                  <div className="order-summary">
                                    <h4>Shipping Address</h4>
                                    <p>
                                      {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                    </p>
                                    <h4>Order Summary</h4>
                                    <p>Subtotal: LKR {order.totalPrice.toLocaleString()}</p>
                                    <p>Shipping: LKR {(order.shippingPrice || 0).toLocaleString()}</p>
                                    <p><strong>Total: LKR {(order.totalPrice + (order.shippingPrice || 0)).toLocaleString()}</strong></p>
                                    
                                    <h4>Change Order Status</h4>
                                    <div className="status-buttons">
                                      {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                        <>
                                          {order.status === 'Pending' && (
                                            <button 
                                              className="status-btn btn-processing"
                                              onClick={() => handleStatusUpdate(order._id, 'Processing')}
                                            >
                                              → Processing
                                            </button>
                                          )}
                                          {order.status === 'Processing' && (
                                            <button 
                                              className="status-btn btn-shipped"
                                              onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                            >
                                              → Shipped
                                            </button>
                                          )}
                                          {order.status === 'Shipped' && (
                                            <button 
                                              className="status-btn btn-delivered"
                                              onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                            >
                                              → Delivered
                                            </button>
                                          )}
                                          {(order.status === 'Pending' || order.status === 'Processing') && (
                                            <button 
                                              className="status-btn btn-cancel"
                                              onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                            >
                                              Cancel Order
                                            </button>
                                          )}
                                        </>
                                      )}
                                      {order.status === 'Completed' && (
                                        <span className="completed-badge">✓ Order Completed</span>
                                      )}
                                      {order.status === 'Cancelled' && (
                                        <span className="cancelled-badge">✗ Order Cancelled</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
