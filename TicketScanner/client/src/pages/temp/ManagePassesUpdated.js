import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPasses, createPass, updatePass } from '../utils/api';
import { EVENTS, PASS_TYPES } from '../constants';
import PassDetailsModal from '../components/PassDetailsModal';

const ManagePasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftWidth, setLeftWidth] = useState(35); // Initial width percentage
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [activeTab, setActiveTab] = useState('update'); // 'update' or 'create'
  const [updateFormData, setUpdateFormData] = useState({
    passId: '',
    passType: 'Solo',
    barcode: '',
    attendeeName: '',
    email: '',
    phone: '',
    isSold: true
  });
  const [formData, setFormData] = useState({
    barcode: '',
    attendeeName: '',
    passType: 'Solo',
    events: [],
    email: '',
    phone: '',
    isSold: false
  });
  const [filterText, setFilterText] = useState('');
  const [soldFilter, setSoldFilter] = useState('all'); // 'all', 'sold', 'unsold'
  
  // Fetch passes on component mount
  useEffect(() => {
    fetchPassesData();
  }, []);

  // Auto-generate next CYP ID when switching to create tab
  useEffect(() => {
    if (activeTab === 'create') {
      generateNextCypId();
    }
  }, [activeTab, passes]);
  
  // Function to generate next CYP ID
  const generateNextCypId = () => {
    // Get existing CYP IDs
    const cypIds = passes
      .filter(pass => pass.barcode.startsWith('CYP'))
      .map(pass => pass.barcode);
    
    // Find the highest numeric suffix
    let maxNumericSuffix = -1;
    cypIds.forEach(id => {
      const numericPart = id.substring(3); // Extract numeric part after 'CYP'
      if (/^\d+$/.test(numericPart)) { // Check if it's a valid number
        const numericValue = parseInt(numericPart, 10);
        if (numericValue > maxNumericSuffix) {
          maxNumericSuffix = numericValue;
        }
      }
    });
    
    // Create next ID (CYP + 4-digit number)
    const nextNumericValue = maxNumericSuffix + 1;
    const paddedNumber = String(nextNumericValue).padStart(4, '0');
    
    // Update form data with the new barcode (numeric part only)
    setFormData(prev => ({
      ...prev,
      barcode: paddedNumber
    }));
  };

  // Handle barcode input for create form
  const handleBarcodeInput = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    const formattedValue = numericValue.slice(0, 4).padStart(4, '0');
    setFormData(prev => ({
      ...prev,
      barcode: formattedValue
    }));
  };

  // Handle barcode input for update form
  const handleUpdateBarcodeInput = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    const formattedValue = numericValue.slice(0, 4).padStart(4, '0');
    setUpdateFormData(prev => ({
      ...prev,
      barcode: formattedValue
    }));
  };
  
  // Function to find lowest non-sold pass of a specific type
  const findLowestNonSoldPass = (passType) => {
    const availablePasses = passes.filter(
      pass => pass.passType === passType && !pass.isSold
    );
    
    if (availablePasses.length === 0) {
      setError(`No unsold ${PASS_TYPES[passType]?.name || passType} passes available.`);
      return null;
    }
    
    // Sort by barcode (assuming CYP IDs have numeric endings)
    availablePasses.sort((a, b) => {
      if (a.barcode.startsWith('CYP') && b.barcode.startsWith('CYP')) {
        const aNum = parseInt(a.barcode.substring(3), 10);
        const bNum = parseInt(b.barcode.substring(3), 10);
        return aNum - bNum;
      }
      return a.barcode.localeCompare(b.barcode);
    });
    
    return availablePasses[0];
  };
  
  // Handle update pass type selection
  const handleUpdatePassTypeChange = (e) => {
    const passType = e.target.value;
    setUpdateFormData(prev => ({
      ...prev,
      passType
    }));
    
    const selectedPass = findLowestNonSoldPass(passType);
    if (selectedPass) {
      setUpdateFormData({
        passId: selectedPass._id,
        passType,
        barcode: selectedPass.barcode.substring(3), // Remove CYP prefix
        attendeeName: '',
        email: '',
        phone: '',
        isSold: true
      });
    }
  };
  
  // Handle barcode search
  const handleBarcodeSearch = (e) => {
    e.preventDefault();
    const barcode = `CYP${updateFormData.barcode}`;
    
    if (!updateFormData.barcode) {
      setError('Please enter a barcode to search');
      return;
    }
    
    // Find pass with matching barcode
    const foundPass = passes.find(pass => pass.barcode === barcode);
    
    if (!foundPass) {
      setError(`No pass found with barcode: ${barcode}`);
      return;
    }
    
    // Set form data with found pass
    setUpdateFormData({
      passId: foundPass._id,
      passType: foundPass.passType,
      barcode: foundPass.barcode.substring(3), // Remove CYP prefix
      attendeeName: foundPass.attendeeName || '',
      email: foundPass.email || '',
      phone: foundPass.phone || '',
      isSold: foundPass.isSold || false
    });
  };
  
  // Toggle sold filter
  const handleSoldFilterChange = (filterValue) => {
    setSoldFilter(filterValue);
  };
  
  // Add function to clear error
  const clearError = () => {
    setError(null);
  };
  
  // Fetch all passes
  const fetchPassesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPasses();
      if (response.data.success) {
        setPasses(response.data.data || []);
      } else {
        setError(response?.data?.message || 'Failed to fetch passes');
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
      setError(err.response?.data?.message || 'Failed to fetch passes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total price for all selected events
  const calculateTotalPrice = () => {
    if (formData.passType === 'regular') {
      return formData.events.reduce((total, event) => total + event.price, 0);
    }
    return PASS_TYPES[formData.passType]?.price || 0;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset events when switching to non-regular pass type
      ...(name === 'passType' && value !== 'regular' && { events: [] })
    }));
  };
  
  // Handle update form input changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle event selection
  const handleEventSelect = (eventName) => {
    if (formData.passType !== 'regular') return;
    
    setFormData(prev => {
      const existingEventIndex = prev.events.findIndex(e => e.name === eventName);
      const eventData = EVENTS.find(e => e.name === eventName);
      
      if (existingEventIndex >= 0) {
        return {
          ...prev,
          events: prev.events.filter(e => e.name !== eventName)
        };
      } else if (eventData) {
        return {
          ...prev,
          events: [...prev.events, { name: eventData.name, price: eventData.price }]
        };
      }
      return prev;
    });
  };
  
  // Handle form submission to create a new pass
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.passType === 'regular' && formData.events.length === 0) {
      setError('Please select at least one event for regular pass type');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add CYP prefix to barcode
      const submissionData = {
        ...formData,
        barcode: `CYP${formData.barcode}`
      };
      
      const response = await createPass(submissionData);
      
      if (response.data.success) {
        setPasses(prevPasses => [response.data.data, ...prevPasses]);
        
        // Reset form and generate new ID
        setFormData({
          barcode: '',
          attendeeName: '',
          passType: 'Solo',
          events: [],
          email: '',
          phone: '',
          isSold: false
        });
        
        // Generate next CYP ID after a short delay to ensure the pass list is updated
        setTimeout(() => generateNextCypId(), 300);
      } else {
        setError(response.data.message || 'Failed to create pass');
      }
    } catch (err) {
      console.error('Error creating pass:', err);
      setError(err.response?.data?.message || 'Failed to create pass');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle submission to update an existing pass
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        attendeeName: updateFormData.attendeeName,
        email: updateFormData.email,
        phone: updateFormData.phone,
        isSold: updateFormData.isSold
      };
      
      const response = await updatePass(updateFormData.passId, updateData);
      
      if (response.data.success) {
        // Update passes list
        setPasses(prevPasses => 
          prevPasses.map(pass => 
            pass._id === updateFormData.passId
              ? { ...pass, ...updateData }
              : pass
          )
        );
        
        // Reset form
        setUpdateFormData({
          passId: '',
          passType: 'Solo',
          barcode: '',
          attendeeName: '',
          email: '',
          phone: '',
          isSold: true
        });
        
        setError('Pass updated successfully!');
      } else {
        setError(response.data.message || 'Failed to update pass');
      }
    } catch (err) {
      console.error('Error updating pass:', err);
      setError(err.response?.data?.message || 'Failed to update pass');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      if (!isDragging) return;
      
      const container = document.querySelector('.passes-grid');
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit the minimum and maximum widths
      if (newWidth >= 25 && newWidth <= 60) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add new function to handle opening the modal
  const handlePassClick = (pass) => {
    setSelectedPass(pass);
  };

  // Add new function to handle closing the modal
  const handleCloseModal = () => {
    setSelectedPass(null);
  };

  // Add filter function
  const filteredPasses = passes.filter(pass => {
    const searchText = filterText.toLowerCase();
    const matchesSearch = 
      pass.barcode.toLowerCase().includes(searchText) ||
      (pass.attendeeName && pass.attendeeName.toLowerCase().includes(searchText)) ||
      pass.passType.toLowerCase().includes(searchText);
    
    // Apply sold/unsold filter
    const matchesSoldFilter = 
      soldFilter === 'all' || 
      (soldFilter === 'sold' && pass.isSold) || 
      (soldFilter === 'unsold' && !pass.isSold);
    
    return matchesSearch && matchesSoldFilter;
  });

  // Add event status update function
  const handleEventStatusUpdate = async (pass, eventName, isVisited) => {
    try {
      const updatedEvents = pass.events.map(event => {
        if (event.name === eventName) {
          return { ...event, isVisited };
        }
        return event;
      });

      const response = await updatePass(pass._id, { events: updatedEvents });
      if (response.data.success) {
        setPasses(prevPasses => 
          prevPasses.map(p => 
            p._id === pass._id ? { ...p, events: updatedEvents } : p
          )
        );
      }
    } catch (err) {
      setError('Failed to update event status');
    }
  };

  // Add function to handle pass updates
  const handlePassUpdate = (updatedPass) => {
    setPasses(prevPasses =>
      prevPasses.map(p =>
        p._id === updatedPass._id ? updatedPass : p
      )
    );
  };

  // Function to switch between tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear any error messages when switching tabs
    clearError();
  };

  return (
    <div className="manage-passes-container">
      <h2>Manage Event Passes</h2>
      
      {error && (
        <div className={`message-banner ${error.includes('successfully') ? 'success-message' : 'error-message'}`}>
          {error}
          <button className="message-close-btn" onClick={clearError}>&times;</button>
        </div>
      )}
      
      <div className="pass-management-tabs">
        <button
          className={`tab-button ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => handleTabChange('update')}
        >
          Update Existing Pass
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          Create New Pass
        </button>
      </div>
      
      <div className="passes-grid">
        {activeTab === 'update' && (
          <div 
            className="update-pass-card"
            style={{ width: `${leftWidth}%` }}
          >
            <h3>Update Existing Pass</h3>
            
            <div className="search-pass-form">
              <div className="form-group">
                <label htmlFor="updateBarcode">Enter Pass Barcode</label>
                <div className="search-barcode-input">
                  <div className="prefix-input-container">
                    <span className="input-prefix">CYP</span>
                    <input
                      type="text"
                      id="updateBarcode"
                      name="barcode"
                      value={updateFormData.barcode}
                      onChange={handleUpdateBarcodeInput}
                      placeholder="0000"
                      maxLength="4"
                    />
                  </div>
                  <button 
                    type="button" 
                    className="search-btn"
                    onClick={handleBarcodeSearch}
                  >
                    Find
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="updatePassType">Select Pass Type</label>
                <select
                  id="updatePassType"
                  name="passType"
                  value={updateFormData.passType}
                  onChange={handleUpdatePassTypeChange}
                  required
                >
                  {Object.entries(PASS_TYPES)
                    .filter(([type]) => type !== 'regular') // Only show special pass types
                    .map(([type, info]) => (
                      <option key={type} value={type}>
                        {info.name} - ₹{info.price} per person
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            {updateFormData.passId && (
              <form onSubmit={handleUpdateSubmit}>
                <div className="form-group">
                  <label htmlFor="updateAttendeeName">Attendee Name</label>
                  <input
                    type="text"
                    id="updateAttendeeName"
                    name="attendeeName"
                    value={updateFormData.attendeeName}
                    onChange={handleUpdateChange}
                    required
                    minLength="2"
                    maxLength="100"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="updateEmail">Email</label>
                  <input
                    type="email"
                    id="updateEmail"
                    name="email"
                    value={updateFormData.email}
                    onChange={handleUpdateChange}
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="updatePhone">Phone</label>
                  <input
                    type="tel"
                    id="updatePhone"
                    name="phone"
                    value={updateFormData.phone}
                    onChange={handleUpdateChange}
                    pattern="[0-9+\s-()]+"
                    title="Please enter a valid phone number"
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    Mark as Sold
                    <input
                      type="checkbox"
                      name="isSold"
                      checked={updateFormData.isSold}
                      onChange={(e) => setUpdateFormData(prev => ({
                        ...prev,
                        isSold: e.target.checked
                      }))}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Total Price</label>
                  <div className="price-display">₹{PASS_TYPES[updateFormData.passType]?.price || 0}</div>
                </div>
                
                <div className="update-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Pass'}
                  </button>
                  
                  <Link to={`/pass/${updateFormData.passId}`} className="view-pass-btn">
                    <span className="view-icon">🔍</span>
                    View Pass
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
        
        {activeTab === 'create' && (
          <div 
            className="create-pass-card"
            style={{ width: `${leftWidth}%` }}
          >
            <h3>Create New Pass</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="barcode">Barcode</label>
                <div className="prefix-input-container">
                  <span className="input-prefix">CYP</span>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleBarcodeInput}
                    required
                    placeholder="0000"
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="attendeeName">Attendee Name</label>
                <input
                  type="text"
                  id="attendeeName"
                  name="attendeeName"
                  value={formData.attendeeName}
                  onChange={handleChange}
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="passType">Pass Type</label>
                <select
                  id="passType"
                  name="passType"
                  value={formData.passType}
                  onChange={handleChange}
                  required
                >
                  {Object.entries(PASS_TYPES).map(([type, info]) => (
                    <option key={type} value={type}>
                      {info.name} - {type === 'regular' ? info.description : `₹${info.price} per person`}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.passType === 'regular' && (
                <div className="form-group events-selection">
                  <label>Select Events</label>
                  <div className="events-grid">
                    {EVENTS.map(event => (
                      <div 
                        key={event.name}
                        className={`event-box ${formData.events.find(e => e.name === event.name) ? 'selected' : ''}`}
                        onClick={() => handleEventSelect(event.name)}
                      >
                        <div className="event-name">{event.name}</div>
                        <div className="event-price">₹{event.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9+\s-()]+"
                  title="Please enter a valid phone number"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  Mark as Sold
                  <input
                    type="checkbox"
                    name="isSold"
                    checked={formData.isSold}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isSold: e.target.checked
                    }))}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              
              <div className="form-group">
                <label>Total Price</label>
                <div className="price-display">₹{calculateTotalPrice()}</div>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Pass'}
              </button>
            </form>
          </div>
        )}
        
        <div 
          className={`passes-list ${activeTab === 'update' && !updateFormData.passId ? 'full-width' : 'with-form'}`}
          style={{ 
            flex: (activeTab === 'create' || (activeTab === 'update' && updateFormData.passId)) ? 1 : 'auto', 
            width: (activeTab === 'update' && !updateFormData.passId) ? '100%' : 'auto' 
          }}
        >
          {(activeTab === 'create' || (activeTab === 'update' && updateFormData.passId)) && (
            <div className="resize-divider" onMouseDown={handleMouseDown}></div>
          )}
          
          <div className="list-header">
            <h3>Existing Passes</h3>
            <div className="filter-controls">
              <div className="sold-filter">
                <button 
                  className={`filter-btn ${soldFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleSoldFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${soldFilter === 'sold' ? 'active' : ''}`}
                  onClick={() => handleSoldFilterChange('sold')}
                >
                  Sold
                </button>
                <button 
                  className={`filter-btn ${soldFilter === 'unsold' ? 'active' : ''}`}
                  onClick={() => handleSoldFilterChange('unsold')}
                >
                  Unsold
                </button>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search passes..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading passes...</div>
          ) : filteredPasses.length === 0 ? (
            <div className="no-records">No passes found</div>
          ) : (
            <div className="passes-table-container">
              <table className="passes-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Attendee Name</th>
                    <th>Pass Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Sold</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map(pass => (
                    <tr key={pass._id} onClick={() => handlePassClick(pass)}>
                      <td>{pass.barcode}</td>
                      <td>{pass.attendeeName || <span className="empty-value">-</span>}</td>
                      <td>{PASS_TYPES[pass.passType]?.name || pass.passType}</td>
                      <td>₹{pass.totalPrice}</td>
                      <td>
                        <span className={`status ${pass.isScanned ? 'scanned' : 'active'}`}>
                          {pass.isScanned ? 'Scanned' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <span className={`sold-status ${pass.isSold ? 'sold' : 'available'}`}>
                          {pass.isSold ? 'Sold' : 'Available'}
                        </span>
                      </td>
                      <td>
                        <div className="pass-actions">
                          <Link 
                            to={`/pass/${pass._id}`} 
                            className="view-pass-link"
                            title="View Pass Details"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="view-icon">🔍</i>
                          </Link>
                          <button 
                            className="action-btn view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePassClick(pass);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="action-btn update-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpdateFormData({
                                passId: pass._id,
                                passType: pass.passType,
                                barcode: pass.barcode.substring(3), // Remove CYP prefix
                                attendeeName: pass.attendeeName || '',
                                email: pass.email || '',
                                phone: pass.phone || '',
                                isSold: pass.isSold || false
                              });
                              handleTabChange('update');
                            }}
                          >
                            Select
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {selectedPass && (
        <PassDetailsModal
          pass={selectedPass}
          onClose={handleCloseModal}
          onUpdate={handlePassUpdate}
        />
      )}
    </div>
  );
};

export default ManagePasses; 