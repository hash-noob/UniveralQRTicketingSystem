import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const ViewPassInstructions = () => {
  return (
    <>
      <div className="instructions-container">
        <div className="instructions-card">
          <h2>How to View Your Pass</h2>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Take out your pass</h3>
                <p>Take out the physical pass you received when you registered. Don't have one yet? <span className="highlight">BUY</span> one at the counter! 😄</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Scan the QR code</h3>
                <p>Open your phone's camera app and scan the QR code printed on your pass. Make sure the entire code is visible and well-lit.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>View your pass details</h3>
                <p>The QR code will automatically redirect you to this website with your unique pass information displayed. No login required!</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Check event attendance</h3>
                <p>You can see which events you've attended and which ones you still need to visit. Keep track of your event journey!</p>
              </div>
            </div>
          </div>
          
          <div className="instructions-note">
            <h3>Important Note:</h3>
            <p>If you have a Bundle Pass (Solo, Duo, Trio, or Quadro), don't forget to collect your lunch!</p>
            <p>Bundle passes include lunch and access to all activities. Regular passes require separate registration for each event.</p>
          </div>
          
          <div className="instructions-help">
            <h3>Need Help?</h3>
            <p>If you're having trouble viewing your pass information or if the QR code isn't working, please visit the help desk at the event entrance.</p>
            <p>Our staff will be happy to assist you with accessing your pass details or addressing any other concerns.</p>
          </div>
          
          <div className="instructions-actions">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewPassInstructions; 