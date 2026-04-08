import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateCartItem(productId, newQuantity);
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    
    try {
      await cartAPI.removeFromCart(productId);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await cartAPI.clearCart();
      fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <div className="loading-page">Loading cart...</div>;
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 1;
    return sum + (itemPrice * itemQuantity);
  }, 0);
  const shipping = subtotal > 0 ? 500 : 0; // Free shipping over certain amount
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#666">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={
                        item.image && item.image.startsWith('/uploads/')
                          ? `http://localhost:5000${item.image}`
                          : item.image || 'https://via.placeholder.com/150x150?text=Product'
                      }
                      alt={item.name} 
                    />
                  </div>

                  <div className="item-details">
                    <Link to={`/product/${item.product?._id}`} className="item-name">
                      {item.name}
                    </Link>
                    <div className="item-options">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.flavour && <span>Flavour: {item.flavour}</span>}
                    </div>
                    <div className="item-price">LKR {(Number(item.price) || 0).toLocaleString()}</div>
                  </div>

                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    LKR {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                  </div>

                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.product?._id || item.product)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>LKR {Math.round(subtotal).toLocaleString()}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `LKR ${shipping.toLocaleString()}`}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>LKR {Math.round(total).toLocaleString()}</span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <Link to="/" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
