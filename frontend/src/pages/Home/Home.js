import React, { useState, useEffect } from 'react';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import LoginRegisterModal from '../../components/LoginRegisterModal/LoginRegisterModal';
import { productAPI } from '../../services/api';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      // Get first 8 products as featured
      setFeaturedProducts(response.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <Hero />
      
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-image">
                <img src="http://localhost:5000/uploads/supplimentsSection.png" alt="Supplements" />
              </div>
              <div className="category-overlay">
                <h3>Supplements</h3>
                <a href="/products/supplements" className="category-link">Shop Now</a>
              </div>
            </div>

            <div className="category-card">
              <div className="category-image">
                <img src="http://localhost:5000/uploads/clothingSection.jpg" alt="Clothing" />
              </div>
              <div className="category-overlay">
                <h3>Clothing</h3>
                <a href="/products/clothing" className="category-link">Shop Now</a>
              </div>
            </div>

            <div className="category-card">
              <div className="category-image">
                <img src="http://localhost:5000/uploads/Accessories.png" alt="Accessories" />
              </div>
              <div className="category-overlay">
                <h3>Accessories</h3>
                <a href="/products/accessories" className="category-link">Shop Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-section">
        <div className="container">
          <h2 className="section-title">Ready to Get Started?</h2>
          <div className="auth-buttons">
            <button 
              className="auth-btn primary" 
              onClick={() => setShowLoginModal(true)}
            >
              👤 Login / Register
            </button>
          </div>
          <div className="social-icons-section">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Facebook">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.6c-.77.3-1.417.72-2.05 1.35-.63.633-1.05 1.28-1.35 2.05-.27.712-.471 1.581-.531 2.859C.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.531 2.859.3.77.72 1.417 1.35 2.05.633.63 1.28 1.05 2.05 1.35.712.27 1.581.471 2.859.531C8.333 23.985 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.261 2.859-.531.77-.3 1.417-.72 2.05-1.35.63-.633 1.05-1.28 1.35-2.05.27-.712.471-1.581.531-2.859.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.531-2.859-.3-.77-.72-1.417-1.35-2.05-.633-.63-1.28-1.05-2.05-1.35-.712-.27-1.581-.471-2.859-.531C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.07 1.171.054 1.805.244 2.227.408.56.217.96.477 1.382.896.419.42.679.822.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.646.07 4.849s-.009 3.585-.07 4.849c-.054 1.171-.244 1.805-.408 2.227-.217.56-.477.96-.896 1.382-.42.419-.822.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.646.07-4.849.07s-3.585-.009-4.849-.07c-1.171-.054-1.805-.244-2.227-.408-.56-.217-.96-.477-1.382-.896-.419-.42-.679-.822-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.646-.07-4.849s.009-3.585.07-4.849c.054-1.171.244-1.805.408-2.227.217-.56.477-.96.896-1.382.42-.419.822-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.646-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
              </svg>
            </a>
            <a href="mailto:contact@fitzone.com" className="social-icon-link" title="Gmail">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="WhatsApp">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.226l-.341.194-3.52.361.367 3.415.194.309a9.866 9.866 0 001.461 4.061L5 23l4.029-1.053a9.848 9.848 0 004.199.539l.342-.011c5.337-.393 9.63-4.787 9.756-10.143.13-5.356-4.208-9.772-9.544-9.772"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <LoginRegisterModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Home;
