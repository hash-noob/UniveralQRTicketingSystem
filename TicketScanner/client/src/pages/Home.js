import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <>
      <div className="home-container">
        <h1>Welcome to EventPass</h1>
        <p>
          Access and manage your event passes with ease.
        </p>
        
        <div className="action-buttons">
          <Link to="/view-instructions" className="btn btn-primary">
            View Your Pass
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-secondary">
              Admin Login
            </Link>
          )}
        </div>
        
        <div className="event-banner">
          <h2>
            <a 
              href="https://cybernauts-cvr.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="event-title-link"
            >
              CYPHER 2k25
            </a>
          </h2>
          <p>CVR's flagship tech extravaganza featuring hackathons, coding competitions, workshops, and cultural events. Join us for an unforgettable experience of innovation, learning, and fun!</p>
        </div>
        
        <div className="features">
          <div className="feature">
            <h3>QR Code Access</h3>
            <p>Simply scan the QR code on your physical pass to view your pass details instantly.</p>
          </div>
          <div className="feature">
            <h3>Event Tracking</h3>
            <p>Check which events you've attended and which ones you still need to visit.</p>
          </div>
          <div className="feature">
            <h3>Bundle Benefits</h3>
            <p>Bundle pass holders (Solo, Duo, Trio, Quadro) get special perks including lunch!</p>
          </div>
        </div>
        
        <div className="home-note">
          <p>Lost your pass? Visit the registration desk at the event venue for assistance.</p>
        </div>
        
        <div className="main-site-link-container">
          <h3>Explore More About CYPHER 2k25</h3>
          <p>
            Visit our main website to discover all the exciting events being conducted, 
            detailed schedule information, and how to participate in various competitions.
            Get support services, find venue details, and learn more about Cybernauts, 
            the team behind this amazing tech fest!
          </p>
          <a 
            href="https://cybernauts-cvr.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="main-site-link"
          >
            Visit Official Website
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home; 