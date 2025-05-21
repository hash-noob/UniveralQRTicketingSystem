import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPassById } from '../utils/api';
import { PASS_TYPES } from '../constants';
import Footer from '../components/Footer';

const ViewPass = () => {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPass = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(id);
        const response = await fetchPassById(id);
        console.log(response);
        if (response.data.success) {
          setPass(response.data.data);
        } else {
          setError('Failed to fetch pass details');
        }
      } catch (err) {
        console.error('Error fetching pass:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching pass details');
      } finally {
        setLoading(false);
      }
    };

    getPass();
  }, [id]);

  if (loading) {
    return (
      <div className="view-pass-container">
        <div className="loading">Loading pass details...</div>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="view-pass-container">
        <div className="error-message">{error || 'Pass not found'}</div>
        <Link to="/manage" className="btn btn-primary">Back to Manage Passes</Link>
      </div>
    );
  }

  return (
    <>
      <div className="view-pass-container">
        <div className="view-pass-card">
          <div className="view-pass-header">
            <h2>Pass Details</h2>
            <div className="action-buttons">
              <Link to="/manage" className="btn btn-secondary">Back</Link>
            </div>
          </div>

          <div className="barcode-section">
            <div className="barcode-display">{pass.barcode}</div>
            <div className={`status-badge ${pass.isScanned ? 'scanned' : 'active'}`}>
              {pass.isScanned ? 'Scanned' : 'Active'}
            </div>
          </div>

          <div className="pass-info-section">
            <div className="info-row">
              <div className="info-item">
                <label>Attendee Name</label>
                <span>{pass.attendeeName}</span>
              </div>
              <div className="info-item">
                <label>Pass Type</label>
                <span>{PASS_TYPES[pass.passType]?.name || pass.passType}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <label>Total Price</label>
                <span className="price">₹{pass.totalPrice}</span>
              </div>
              {pass.email && (
                <div className="info-item">
                  <label>Email</label>
                  <span>{pass.email}</span>
                </div>
              )}
            </div>

            {pass.phone && (
              <div className="info-row">
                <div className="info-item">
                  <label>Phone</label>
                  <span>{pass.phone}</span>
                </div>
              </div>
            )}

            {pass.isScanned && (
              <div className="info-row">
                <div className="info-item">
                  <label>Scanned On</label>
                  <span>{new Date(pass.scanTime).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="events-section">
            <h3>Events Included</h3>
            <div className="events-grid">
              {pass.events.map((event, index) => (
                <div key={index} className={`event-card ${event.isVisited ? 'visited' : ''}`}>
                  <div className="event-header">
                    <span className="event-name">{event.name}</span>
                    <span className="event-price">₹{event.price}</span>
                  </div>
                  <div className="event-status">
                    <div className={`status-indicator ${event.isVisited ? 'visited' : 'not-visited'}`}>
                      {event.isVisited ? 'Visited' : 'Not Visited'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewPass; 