import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import LoginRegisterModal from '../LoginRegisterModal/LoginRegisterModal';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const userMenuRef = useRef(null);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { label: 'Supplements', path: '/products/supplements' },
    { label: 'Accessories', path: '/products/accessories' },
    { label: 'Shaker Bottles', path: '/products/shaker-bottles' },
    { label: 'Clothing', path: '/products/clothing' }
  ];

  const isCategoryActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowProfileDetails(false);
    setShowOrdersPanel(false);
    setUserOrders([]);
    setOrdersError('');
    navigate('/');
  };

  const fetchUserOrders = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setOrdersError('User id not available');
      setUserOrders([]);
      return;
    }

    setOrdersLoading(true);
    setOrdersError('');

    try {
      const response = await orderAPI.getOrdersByUser(userId);
      setUserOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setUserOrders([]);
        setOrdersError('');
      } else {
        setOrdersError('Failed to load orders');
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleToggleOrders = () => {
    const nextState = !showOrdersPanel;
    setShowOrdersPanel(nextState);
    setShowProfileDetails(false);

    if (nextState) {
      fetchUserOrders();
    }
  };

  const formatOrderDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString();
  };

  const handleAdminDashboard = () => {
    navigate('/admin-dashboard');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-top">
          <div className="navbar-container">
            <div className="navbar-search">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-input"
                />
              </form>
            </div>
            
            <div className="navbar-logo">
              <Link to="/" className="logo-link">
                <img src="/logo.png" alt="FitZone" className="logo-image" />
                <span className="logo-text">FITZONE</span>
              </Link>
            </div>

            <div className="navbar-actions">
              {isAuthenticated ? (
                <div className="user-menu">
                  {isAdmin && (
                    <button 
                      className="admin-link"
                      onClick={handleAdminDashboard}
                      title="Admin Dashboard"
                    >
                      ⚙️ Admin
                    </button>
                  )}
                  <div className={`user-dropdown ${showUserMenu ? 'open' : ''}`} ref={userMenuRef}>
                    <button
                      type="button"
                      className="user-button"
                      onClick={() => {
                        setShowUserMenu((current) => !current);
                        setShowProfileDetails(false);
                        setShowOrdersPanel(false);
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{user?.firstName}</span>
                    </button>
                    <div className="user-dropdown-menu">
                      <span className="user-name">{user?.firstName} {user?.lastName}</span>
                      <button
                        type="button"
                        className="dropdown-link-button"
                        onClick={() => setShowProfileDetails((current) => !current)}
                      >
                        My Profile
                      </button>
                      {showProfileDetails && (
                        <div className="profile-details-panel">
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Name</span>
                            <span className="profile-detail-value">{user?.firstName} {user?.lastName}</span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Email</span>
                            <span className="profile-detail-value">{user?.email || 'Not available'}</span>
                          </div>
                          <div className="profile-detail-row">
                            <span className="profile-detail-label">Role</span>
                            <span className="profile-detail-value">{user?.isAdmin ? 'Admin' : 'Customer'}</span>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        className="dropdown-link-button"
                        onClick={handleToggleOrders}
                      >
                        My Orders
                      </button>
                      {showOrdersPanel && (
                        <div className="orders-panel">
                          {ordersLoading ? (
                            <p className="orders-info-text">Loading orders...</p>
                          ) : ordersError ? (
                            <p className="orders-error-text">{ordersError}</p>
                          ) : userOrders.length === 0 ? (
                            <p className="orders-info-text">No orders yet</p>
                          ) : (
                            <div className="orders-list-scroll">
                              {userOrders.map((order) => (
                                <div key={order._id} className="order-card-mini">
                                  <div className="order-card-row">
                                    <span className="order-card-label">Order</span>
                                    <span className="order-card-value">#{String(order._id).slice(-6).toUpperCase()}</span>
                                  </div>
                                  <div className="order-card-row">
                                    <span className="order-card-label">Date</span>
                                    <span className="order-card-value">{formatOrderDate(order.createdAt)}</span>
                                  </div>
                                  <div className="order-card-row">
                                    <span className="order-card-label">Status</span>
                                    <span className="order-card-value">{order.status}</span>
                                  </div>
                                  <div className="order-card-row">
                                    <span className="order-card-label">Total</span>
                                    <span className="order-card-value">LKR {Math.round(Number(order.totalPrice) || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="login-button"
                  onClick={() => setShowLoginModal(true)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Login
                </button>
              )}
              
              <Link to="/cart" className="icon-button cart-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        <div className="navbar-categories">
          <div className="navbar-container navbar-categories-container">
            <Link to="/" className="category-chip home-chip">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className={`category-chip ${isCategoryActive(category.path) ? 'active' : ''}`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>

      </nav>

      <LoginRegisterModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Navbar;
