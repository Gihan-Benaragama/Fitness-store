import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" 
          alt="Fitness background"
          className="hero-bg-image"
        />
      </div>
      
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <div className="hero-logo">
          <img src="/logo.png" alt="FitZone" className="hero-logo-image" />
        </div>

        <h1 className="hero-title">FITZONE</h1>
        <p className="hero-subtitle">one stop destination for all your fitness needs</p>
        
        <div className="hero-cta">
          <Link to="/products/supplements" className="cta-button">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
