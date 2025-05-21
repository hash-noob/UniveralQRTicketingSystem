import React, { useState } from 'react';
import { PASS_TYPES } from '../constants';
import { updatePass, updateEvent } from '../utils/api';

const PassDetailsModal = ({ pass, onClose, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedPass, setUpdatedPass] = useState(pass);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  if (!pass) return null;

  const handleEventStatusUpdate = (eventName, isVisited) => {
    const updatedEvents = updatedPass.events.map(event => {
      if (event.name === eventName) {
        return { ...event, isVisited: isVisited };
      }
      return event;
    });

    setUpdatedPass({
      ...updatedPass,
      events: updatedEvents
    });
  };

  const handleSoldStatusChange = (isSold) => {
    setUpdatedPass({
      ...updatedPass,
      isSold
    });
  };

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      const updateData = {
        id: pass._id,
        events: updatedPass.events
      };
      
      // Only include isSold in update if it's different from original
      if (updatedPass.isSold !== pass.isSold) {
        updateData.isSold = updatedPass.isSold;
      }
      
      const response = await updateEvent(updateData);
      
      if (response.data.success) {
        onUpdate(response.data.data);
        setUpdateSuccess(true);
        
        // Check if all events are visited
        const allEventsVisited = updatedPass.events.every(event => event.isVisited);
        
        if (allEventsVisited) {
          // Close the modal immediately if all events are visited
          onClose();
        } else {
          // Otherwise just show success message temporarily
          setTimeout(() => setUpdateSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error('Failed to update pass:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = 
    JSON.stringify(pass.events) !== JSON.stringify(updatedPass.events) ||
    pass.isSold !== updatedPass.isSold;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pass Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="pass-info-grid">
            <div className="info-group">
              <label>Barcode</label>
              <span>{updatedPass.barcode}</span>
            </div>
            
            <div className="info-group">
              <label>Attendee Name</label>
              <span>{updatedPass.attendeeName || <span className="empty-value">Not set</span>}</span>
            </div>
            
            <div className="info-group">
              <label>Pass Type</label>
              <span>{PASS_TYPES[updatedPass.passType]?.name || updatedPass.passType}</span>
            </div>
            
            <div className="info-group">
              <label>Total Price</label>
              <span className="price">₹{updatedPass.totalPrice}</span>
            </div>
            
            <div className="info-group">
              <label>Status</label>
              <span className={`status ${updatedPass.isScanned ? 'scanned' : 'active'}`}>
                {updatedPass.isScanned ? 'Scanned' : 'Active'}
              </span>
            </div>
            
            <div className="info-group">
              <label>Sold Status</label>
              <div className="sold-status-toggle">
                <label className="checkbox-container">
                  Mark as Sold
                  <input
                    type="checkbox"
                    checked={updatedPass.isSold}
                    onChange={(e) => handleSoldStatusChange(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
            </div>
            
            {updatedPass.isScanned && (
              <div className="info-group">
                <label>Scan Time</label>
                <span>{new Date(updatedPass.scanTime).toLocaleString()}</span>
              </div>
            )}
            
            {updatedPass.email && (
              <div className="info-group">
                <label>Email</label>
                <span>{updatedPass.email}</span>
              </div>
            )}
            
            {updatedPass.phone && (
              <div className="info-group">
                <label>Phone</label>
                <span>{updatedPass.phone}</span>
              </div>
            )}
          </div>
          
          <div className="events-section">
            <h3>Events</h3>
            <div className="events-grid">
              {updatedPass.events.map((event, index) => (
                <div key={index} className="event-card">
                  <div className="event-header">
                    <span className="event-name">{event.name}</span>
                    <span className="event-price">₹{event.price}</span>
                  </div>
                  <label className="event-status-toggle">
                    <input
                      type="checkbox"
                      checked={event.isVisited}
                      onChange={(e) => handleEventStatusUpdate(event.name, e.target.checked)}
                    />
                    <span className="status-label">
                      {event.isVisited ? 'Visited' : 'Not Visited'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            {updateSuccess && (
              <div className="update-success">Changes saved successfully!</div>
            )}
            <button 
              className={`update-btn ${hasChanges ? 'active' : 'disabled'}`}
              onClick={handleSaveChanges}
              disabled={!hasChanges || isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassDetailsModal; 