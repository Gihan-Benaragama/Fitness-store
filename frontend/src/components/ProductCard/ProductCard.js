import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { _id, name, price, image, images, category, rating, stock } = product;
  const displayImage = images && images.length > 0 ? images[0] : image;
  const resolvedImage = displayImage && displayImage.startsWith('/uploads/')
    ? `http://localhost:5000${displayImage}`
    : displayImage;
  const [showAnimation, setShowAnimation] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock === 0 || addingToCart) return;
    
    setAddingToCart(true);
    setShowAnimation(true);
    
    try {
      await cartAPI.addToCart(_id, 1, {});
      
      setTimeout(() => {
        setShowAnimation(false);
        setAddingToCart(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setShowAnimation(false);
      setAddingToCart(false);
      const message = error.response?.data?.message || 'Failed to add to cart. Please try again.';
      alert(message);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock === 0 || addingToCart) return;

    const buyNowItem = {
      product: _id,
      name,
      image: displayImage || '',
      price: Number(price) || 0,
      quantity: 1,
      size: '',
      flavour: ''
    };

    navigate('/checkout', { state: { buyNowItems: [buyNowItem] } });
  };

  return (
    <div className="product-card">
      {showAnimation && (
        <div className="card-animation">
          <img 
            src={resolvedImage || 'https://via.placeholder.com/100x100?text=Product'}
            alt="Flying to cart"
            className="flying-card-product"
          />
        </div>
      )}
      {showToast && (
        <div className="toast-notification">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>Added to cart!</span>
        </div>
      )}
      <Link to={`/product/${_id}`} className="product-card-link">
        <div className="product-image">
          <img src={resolvedImage || 'https://via.placeholder.com/300x300?text=Product'} alt={name} />
          {stock === 0 && <div className="out-of-stock">Out of Stock</div>}
        </div>
        
        <div className="product-info">
          <div className="product-category">{category}</div>
          <h3 className="product-name">{name}</h3>
          
          {rating && (
            <div className="product-rating">
              {[...Array(5)].map((_, index) => (
                <span key={index} className={index < Math.floor(rating) ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
              <span className="rating-value">({rating})</span>
            </div>
          )}
          
          <div className="product-price">LKR {price.toLocaleString()}</div>
        </div>
      </Link>
      
      <button 
        className="add-to-cart-btn"
        disabled={stock === 0 || addingToCart}
        onClick={handleAddToCart}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {addingToCart ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
      
      <button 
        className="buy-now-btn"
        disabled={stock === 0 || addingToCart}
        onClick={handleBuyNow}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Buy Now
      </button>
    </div>
  );
};

export default ProductCard;
