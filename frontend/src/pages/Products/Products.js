import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productAPI } from '../../services/api';
import './Products.css';

const Products = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedFlavours, setSelectedFlavours] = useState([]);

  const priceRanges = {
    under5000: { label: 'Under LKR 5,000', matches: (price) => price < 5000 },
    range5000to10000: { label: 'LKR 5,000 - 10,000', matches: (price) => price >= 5000 && price <= 10000 },
    range10000to20000: { label: 'LKR 10,000 - 20,000', matches: (price) => price > 10000 && price <= 20000 },
    over20000: { label: 'Over LKR 20,000', matches: (price) => price > 20000 }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      const type = searchParams.get('type');
      if (type) queryParams.type = type;
      
      const response = await productAPI.getProductsByCategory(category, queryParams);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product) => Number(product.discountPrice) || Number(product.price) || 0;

  const handlePriceRangeChange = (rangeKey) => {
    setSelectedPriceRanges((currentRanges) => (
      currentRanges.includes(rangeKey)
        ? currentRanges.filter((key) => key !== rangeKey)
        : [...currentRanges, rangeKey]
    ));
  };

  const handleFlavourChange = (flavourKey) => {
    setSelectedFlavours((currentFlavours) => (
      currentFlavours.includes(flavourKey)
        ? currentFlavours.filter((key) => key !== flavourKey)
        : [...currentFlavours, flavourKey]
    ));
  };

  const getProductFlavours = (product) => {
    const rawFlavours = product.flavour || product.flavors || [];
    return rawFlavours.map((flavour) => String(flavour).toLowerCase());
  };

  const filteredProducts = products.filter((product) => {
    const productPrice = getProductPrice(product);
    const priceMatch =
      selectedPriceRanges.length === 0 ||
      selectedPriceRanges.some((rangeKey) => priceRanges[rangeKey].matches(productPrice));

    const flavourMatch = (() => {
      if (category !== 'supplements' || selectedFlavours.length === 0) {
        return true;
      }

      const productFlavours = getProductFlavours(product);
      return selectedFlavours.some((flavourKey) => productFlavours.includes(flavourKey));
    })();

    return priceMatch && flavourMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPrice(a);
    const priceB = getProductPrice(b);

    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getCategoryTitle = () => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1 className="page-title">{getCategoryTitle()}</h1>
          <p className="products-count">{filteredProducts.length} Products</p>
        </div>
      </div>

      <div className="container">
        <div className="products-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3 className="filter-title">Sort By</h3>
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">Price Range</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('under5000')}
                    onChange={() => handlePriceRangeChange('under5000')}
                  />
                  <span>Under LKR 5,000</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('range5000to10000')}
                    onChange={() => handlePriceRangeChange('range5000to10000')}
                  />
                  <span>LKR 5,000 - 10,000</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('range10000to20000')}
                    onChange={() => handlePriceRangeChange('range10000to20000')}
                  />
                  <span>LKR 10,000 - 20,000</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes('over20000')}
                    onChange={() => handlePriceRangeChange('over20000')}
                  />
                  <span>Over LKR 20,000</span>
                </label>
              </div>
            </div>

            {category === 'supplements' && (
              <div className="filter-section">
                <h3 className="filter-title">Flavour</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFlavours.includes('chocolate')}
                      onChange={() => handleFlavourChange('chocolate')}
                    />
                    <span>Chocolate</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFlavours.includes('vanilla')}
                      onChange={() => handleFlavourChange('vanilla')}
                    />
                    <span>Vanilla</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFlavours.includes('strawberry')}
                      onChange={() => handleFlavourChange('strawberry')}
                    />
                    <span>Strawberry</span>
                  </label>
                </div>
              </div>
            )}

            {category === 'clothing' && (
              <div className="filter-section">
                <h3 className="filter-title">Size</h3>
                <div className="filter-options">
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span>S</span>
                  </label>
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span>M</span>
                  </label>
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span>L</span>
                  </label>
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span>XL</span>
                  </label>
                </div>
              </div>
            )}
          </aside>

          <main className="products-main">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : sortedProducts.length === 0 ? (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            ) : (
              <div className="products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
