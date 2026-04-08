import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
      
      // Set default selections
      if (response.data.sizes && response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.flavours && response.data.flavours.length > 0) {
        setSelectedFlavour(response.data.flavours[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setShowCartAnimation(true);
    
    try {
      const options = {};
      if (selectedSize) options.size = selectedSize;
      if (selectedFlavour) options.flavour = selectedFlavour;
      
      await cartAPI.addToCart(id, quantity, options);
      
      // Wait for animation to complete
      setTimeout(() => {
        setShowCartAnimation(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setShowCartAnimation(false);
      const message = error.response?.data?.message || 'Failed to add to cart. Please try again.';
      alert(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const buyNowItem = {
      product: id,
      name: product.name,
      image: product.images?.[0] || product.image || '',
      price: Number(product.price) || 0,
      quantity,
      size: selectedSize || '',
      flavour: selectedFlavour || ''
    };

    navigate('/checkout', { state: { buyNowItems: [buyNowItem] } });
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!product) {
    return <div className="error-page">Product not found</div>;
  }

  return (
    <div className="product-detail-page">
      {showCartAnimation && (
        <div className="cart-animation">
          <img 
            src={product.images && product.images.length > 0
              ? product.images[0].startsWith('/uploads/')
                ? `http://localhost:5000${product.images[0]}`
                : product.images[0]
              : 'https://via.placeholder.com/100x100?text=Product'
            }
            alt="Flying to cart"
            className="flying-product"
          />
        </div>
      )}
      {showToast && (
        <div className="toast-notification">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>Product added to cart!</span>
        </div>
      )}
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Products
        </button>

        <div className="product-detail">
          <div className="product-image-section">
            <img 
              src={
                product.images && product.images.length > 0
                  ? product.images[0].startsWith('/uploads/')
                    ? `http://localhost:5000${product.images[0]}`
                    : product.images[0]
                  : product.image
                  ? product.image.startsWith('/uploads/')
                    ? `http://localhost:5000${product.image}`
                    : product.image
                  : 'https://via.placeholder.com/600x600?text=Product'
              }
              alt={product.name} 
              className="product-main-image"
            />
          </div>

          <div className="product-info-section">
            <div className="product-category-badge">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            
            {product.rating && (
              <div className="product-rating-section">
                <div className="stars">
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className={index < Math.floor(product.rating) ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">({product.rating}) - {reviews.length} reviews</span>
              </div>
            )}

            <div className="product-price-section">
              <span className="price">LKR {product.price.toLocaleString()}</span>
              {product.stock > 0 ? (
                <span className="stock in-stock">In Stock</span>
              ) : (
                <span className="stock out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description || 'No description available.'}</p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="product-option">
                <label className="option-label">Size:</label>
                <div className="option-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.flavours && product.flavours.length > 0 && (
              <div className="product-option">
                <label className="option-label">Flavour:</label>
                <div className="option-buttons">
                  {product.flavours.map((flavour) => (
                    <button
                      key={flavour}
                      className={`option-btn ${selectedFlavour === flavour ? 'selected' : ''}`}
                      onClick={() => setSelectedFlavour(flavour)}
                    >
                      {flavour}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-quantity">
              <label className="option-label">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button 
                className="buy-now-button"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || addingToCart}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h2 className="section-title">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">{review.user?.name || 'Anonymous'}</div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, index) => (
                        <span key={index} className={index < review.rating ? 'star filled' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
