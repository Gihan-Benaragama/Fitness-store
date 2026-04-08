import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import SearchResults from './pages/SearchResults/SearchResults';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import './App.css';

const HomeRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <Home />;
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Home />;
};

const AdminDashboardRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin-dashboard" element={<AdminDashboardRoute />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
