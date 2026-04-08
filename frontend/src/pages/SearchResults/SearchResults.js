import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await productAPI.searchProducts(query);
      setProducts(response.data);
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err.response?.data?.message || 'No products found');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1>Search Results for: <span className="search-query">"{query}"</span></h1>
        <p className="results-count">
          {loading ? 'Searching...' : `Found ${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching for products...</p>
        </div>
      ) : error ? (
        <div className="no-results">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h2>No Products Found</h2>
          <p>{error}</p>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="search-results-container">
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
