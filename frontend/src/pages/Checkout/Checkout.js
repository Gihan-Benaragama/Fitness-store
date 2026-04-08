import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cartAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const buyNowItems = location.state?.buyNowItems || null;
  const isBuyNowCheckout = Array.isArray(buyNowItems) && buyNowItems.length > 0;
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka',
    paymentMethod: 'Cash on Delivery'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isBuyNowCheckout) {
      const buyNowTotal = buyNowItems.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 1;
        return sum + (itemPrice * itemQuantity);
      }, 0);

      setCart({
        items: buyNowItems,
        totalPrice: buyNowTotal
      });
      setLoading(false);
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.street.trim()) return 'Street address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.country.trim()) return 'Country is required';
    return '';
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        items: cart.items,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        totalPrice: cart.totalPrice,
        shippingPrice: 500,
        // Include form data for guest checkout
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };

      const response = await orderAPI.createOrder(orderData);
      setOrderId(response.data.order._id);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    navigate('/products/Supplements');
  };

  if (loading) {
    return <div className="checkout-loading">Loading checkout...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }

  const subtotal = cart.totalPrice;
  const shipping = 500;
  const total = subtotal + shipping;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        {error && <div className="checkout-error">{error}</div>}
        {success && <div className="checkout-success">{success}</div>}

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="item-image">
                    <img 
                      src={
                        item.image && item.image.startsWith('/uploads/')
                          ? `http://localhost:5000${item.image}`
                          : item.image || 'https://via.placeholder.com/80x80?text=Product'
                      }
                      alt={item.name}
                    />
                  </div>
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-price">LKR {(Number(item.price) || 0).toLocaleString()}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    LKR {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <div className="total-row">
                <span>Subtotal</span>
                <span>LKR {Math.round(subtotal).toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>LKR {shipping.toLocaleString()}</span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <span>LKR {Math.round(total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Form */}
          <div className="delivery-form">
            <h2>Delivery Details</h2>
            
            <form onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state (optional)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zip/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter zip code (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={submitting}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <button 
                type="button"
                className="continue-shopping-btn"
                onClick={() => navigate(isBuyNowCheckout ? '/products/Supplements' : '/cart')}
              >
                {isBuyNowCheckout ? 'Continue Shopping' : 'Back to Cart'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-icon">✓</div>
            <h2>Thank You for Your Order!</h2>
            <p className="modal-subtitle">Your order has been placed successfully</p>
            
            <div className="order-details">
              <p><strong>Order ID:</strong> #{orderId.slice(-8)}</p>
              <p>We'll send you an email confirmation shortly with tracking details.</p>
            </div>

            <p className="modal-message">
              Thank you for shopping with us! We'll prepare your order and notify you when it's on its way.
            </p>

            <div className="modal-buttons">
              <button 
                className="btn-continue-shopping"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
              <button 
                className="btn-home"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
