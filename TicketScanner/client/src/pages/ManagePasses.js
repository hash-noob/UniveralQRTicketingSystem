import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPasses, createPass, updatePass } from '../utils/api';
import { EVENTS, PASS_TYPES } from '../constants';
import PassDetailsModal from '../components/PassDetailsModal';
import Footer from '../components/Footer';

const ManagePasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftWidth, setLeftWidth] = useState(35);
  const [formData, setFormData] = useState({
    barcode: '',
    attendeeName: '',
    email: '',
    phone: '',
    passType: 'vip',
    isSold: false
  });
  const [updateFormData, setUpdateFormData] = useState({
    passId: '',
    barcode: '',
    attendeeName: '',
    email: '',
    phone: '',
    passType: 'vip',
    isSold: false,
    events: []
  });
  const [filterText, setFilterText] = useState('');
  const [soldFilter, setSoldFilter] = useState('all');
  const [passTypeFilter, setPassTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('update');
  const [selectedPass, setSelectedPass] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // New states for event selection modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [tempEvents, setTempEvents] = useState([]);
  
  // Add a state to keep track of all events including visited ones in the original pass
  const [originalPassEvents, setOriginalPassEvents] = useState([]);
  
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
    
    // Create next ID (numeric part only)
    const nextNumericValue = maxNumericSuffix + 1;
    
    // Update form data with the new barcode (numeric part only, without padding)
    setFormData(prev => ({
      ...prev,
      barcode: String(nextNumericValue)
    }));
  };

  // Handle barcode input for create form
  const handleBarcodeInput = (e) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Keep only digits
    const formattedValue = numericValue.slice(0, 4); // Limit to 4 digits
    setFormData(prev => ({
      ...prev,
      barcode: formattedValue
    }));
  };

  // Handle barcode input for update form
  const handleUpdateBarcodeInput = (e) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Keep only digits
    const formattedValue = numericValue.slice(0, 4); // Limit to 4 digits
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
  
  // Function to handle barcode search
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
    
    // Filter out visited events if it's a regular pass
    let unvisitedEvents = [];
    if (foundPass.passType === 'regular' && foundPass.events && foundPass.events.length > 0) {
      unvisitedEvents = foundPass.events.filter(event => !event.isVisited);
      
      // Store original events for reference (including visited ones)
      setOriginalPassEvents(foundPass.events);
    } else {
      setOriginalPassEvents([]);
    }
    
    // Set form data with found pass
    setUpdateFormData({
      passId: foundPass._id,
      passType: foundPass.passType,
      barcode: foundPass.barcode.substring(3), // Remove CYP prefix
      attendeeName: foundPass.attendeeName || '',
      email: foundPass.email || '',
      phone: foundPass.phone || '',
      isSold: foundPass.isSold || false,
      events: unvisitedEvents // Include unvisited events
    });
  };
  
  // Toggle sold filter
  const handleSoldFilterChange = (filterValue) => {
    setSoldFilter(filterValue);
  };
  
  // Toggle pass type filter
  const handlePassTypeFilterChange = (filterValue) => {
    setPassTypeFilter(filterValue);
  };
  
  // Update the event handlers to work with select elements
  const handleSoldFilterSelectChange = (e) => {
    setSoldFilter(e.target.value);
  };
  
  const handlePassTypeFilterSelectChange = (e) => {
    setPassTypeFilter(e.target.value);
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
      return (formData.events || []).reduce((total, event) => total + event.price, 0);
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
      [name]: value,
      // Reset events when switching to non-regular pass type
      ...(name === 'passType' && value !== 'regular' && { events: [] })
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
  
  // Handle update event selection
  const handleUpdateEventSelect = (eventName) => {
    if (updateFormData.passType !== 'regular') return;
    
    setUpdateFormData(prev => {
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
      
      // Add CYP prefix to barcode and pad with zeros
      const paddedBarcode = formData.barcode.padStart(4, '0');
      const submissionData = {
        ...formData,
        barcode: `CYP${paddedBarcode}`
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
      
      // Create the base pass data
      const passData = {
        id: updateFormData.passId,
        passType: updateFormData.passType,
        attendeeName: updateFormData.attendeeName,
        email: updateFormData.email,
        phone: updateFormData.phone,
        isSold: updateFormData.isSold
      };
      
      // For regular pass type, preserve visited events
      if (updateFormData.passType === 'regular') {
        // Get all events including visited ones
        const visitedEvents = originalPassEvents.filter(event => event.isVisited);
        const currentEvents = updateFormData.events || [];
        
        // Combine visited events with current events, avoiding duplicates
        const allEvents = [...visitedEvents];
        
        // Add current unvisited events if they're not already in the list
        currentEvents.forEach(event => {
          if (!allEvents.some(e => e.name === event.name)) {
            allEvents.push(event);
          }
        });
        
        // Add events to pass data
        passData.events = allEvents;
      }
      
      const response = await updatePass(passData);
      
      if (response.data.success) {
        await fetchPassesData(); // Refresh passes list
        
        // Clear form
        setUpdateFormData({
          passId: '',
          barcode: '',
          attendeeName: '',
          email: '',
          phone: '',
          passType: 'vip',
          isSold: false,
          events: []
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
  
  // Add new function to handle opening the modal
  const handlePassClick = (e, pass) => {
    e.stopPropagation(); // Prevent triggering the row click
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
    
    // Apply pass type filter
    const matchesPassTypeFilter = 
      passTypeFilter === 'all' || 
      pass.passType === passTypeFilter;
    
    return matchesSearch && matchesSoldFilter && matchesPassTypeFilter;
  }).sort((a, b) => {
    // Sort by barcode ID (numeric part)
    if (a.barcode.startsWith('CYP') && b.barcode.startsWith('CYP')) {
      const aNum = parseInt(a.barcode.substring(3), 10);
      const bNum = parseInt(b.barcode.substring(3), 10);
      return aNum - bNum;
    }
    return a.barcode.localeCompare(b.barcode);
  });

  // Get current passes for pagination
  const indexOfLastPass = currentPage * itemsPerPage;
  const indexOfFirstPass = indexOfLastPass - itemsPerPage;
  const currentPasses = filteredPasses.slice(indexOfFirstPass, indexOfLastPass);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredPasses.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, soldFilter, passTypeFilter]);

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

  // Change items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate total price for all selected events (for update form too)
  const calculateUpdateTotalPrice = () => {
    if (updateFormData.passType === 'regular') {
      return (updateFormData.events || []).reduce((total, event) => total + event.price, 0);
    }
    return PASS_TYPES[updateFormData.passType]?.price || 0;
  };

  // Handle opening the event modal
  const handleOpenEventModal = () => {
    setTempEvents(updateFormData.events || []);
    
    // Get the full pass data for reference
    const currentPass = passes.find(p => p._id === updateFormData.passId);
    if (currentPass && currentPass.events) {
      setOriginalPassEvents(currentPass.events);
    } else {
      setOriginalPassEvents([]);
    }
    
    setShowEventModal(true);
  };

  // Add function to handle saving events from the modal
  const handleSaveEvents = () => {
    setUpdateFormData(prev => ({
      ...prev,
      events: tempEvents
    }));
    setShowEventModal(false);
  };

  // Add function to handle event toggling in the modal
  const handleEventToggle = (eventName) => {
    const eventData = EVENTS.find(e => e.name === eventName);
    if (!eventData) return;
    
    setTempEvents(prev => {
      const existingEventIndex = prev.findIndex(e => e.name === eventName);
      
      if (existingEventIndex >= 0) {
        // Remove event if already selected
        return prev.filter(e => e.name !== eventName);
      } else {
        // Add event if not selected
        return [...prev, { name: eventData.name, price: eventData.price }];
      }
    });
  };

  // Add a function to remove a single event
  const handleRemoveSingleEvent = (eventName) => {
    setUpdateFormData(prev => ({
      ...prev,
      events: (prev.events || []).filter(event => event.name !== eventName)
    }));
  };

  // Event Modal component to include checks for visited events
  const EventSelectionModal = () => {
    if (!showEventModal) return null;
    
    const events = tempEvents || [];
    
    return (
      <div className="modal-overlay">
        <div className="modal-content event-modal">
          <div className="modal-header">
            <h3>Select Events</h3>
            <button className="close-button" onClick={() => setShowEventModal(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="events-grid">
              {EVENTS.map(event => {
                // Check if this event has been visited in the original pass
                const isVisited = originalPassEvents.find(e => 
                  e.name === event.name && e.isVisited === true
                );
                
                return (
                  <div 
                    key={event.name}
                    className={`event-box ${isVisited ? 'visited' : events.find(e => e.name === event.name) ? 'selected' : ''}`}
                    onClick={() => !isVisited && handleEventToggle(event.name)}
                    style={isVisited ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                  >
                    <div className="event-name">{event.name}</div>
                    <div className="event-price">₹{event.price}</div>
                    {isVisited && <div className="visited-badge">Visited</div>}
                  </div>
                );
              })}
            </div>
            <div className="event-total">
              <span>Total Price: ₹{events.reduce((total, event) => total + event.price, 0)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handleSaveEvents}>Save Events</button>
            <button className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // Fix row click handler to also store original pass events for reference
  const handleRowClick = (pass) => {
    // Filter out visited events if it's a regular pass
    let unvisitedEvents = [];
    if (pass.passType === 'regular' && pass.events && pass.events.length > 0) {
      unvisitedEvents = pass.events.filter(event => !event.isVisited);
      
      // Store the original pass events for reference
      setOriginalPassEvents(pass.events);
    } else {
      setOriginalPassEvents([]);
    }
    
    setUpdateFormData({
      passId: pass._id,
      passType: pass.passType,
      barcode: pass.barcode.substring(3), // Remove CYP prefix
      attendeeName: pass.attendeeName || '',
      email: pass.email || '',
      phone: pass.phone || '',
      isSold: pass.isSold || false,
      events: unvisitedEvents // Include unvisited events
    });
    
    handleTabChange('update');
  };

  return (
    <>
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
            <div className="update-pass-card">
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
                        placeholder="Enter ID"
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
                    onChange={handleUpdateChange}
                    required
                  >
                    {Object.entries(PASS_TYPES).map(([type, info]) => (
                      <option key={type} value={type}>
                        {info.name} - {type === 'regular' ? info.description : `₹${info.price} per person`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {updateFormData.passType === 'regular' && (
                  <div className="form-group">
                    <div className="events-header">
                      <label>Selected Events</label>
                      <button 
                        type="button" 
                        className="add-events-btn"
                        onClick={handleOpenEventModal}
                      >
                        Add Events
                      </button>
                    </div>
                    {(updateFormData.events || []).length > 0 ? (
                      <div className="selected-events">
                        {(updateFormData.events || []).map(event => (
                          <div key={event.name} className="selected-event">
                            <span className="event-name">{event.name}</span>
                            <span className="event-price">₹{event.price}</span>
                            <div 
                              className="remove-event" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSingleEvent(event.name);
                              }}
                            >
                              ×
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-events">No events selected</div>
                    )}
                  </div>
                )}
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
                    <div className="price-display">
                      ₹{updateFormData.passType === 'regular' 
                        ? calculateUpdateTotalPrice() 
                        : PASS_TYPES[updateFormData.passType]?.price || 0}
                    </div>
                  </div>
                  
                  <div className="update-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={handleUpdateSubmit}
                      disabled={loading}
                    >
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
            <div className="create-pass-card">
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
                      placeholder="Enter ID"
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
          
          <div className="passes-list" style={{ width: `${100 - leftWidth}%` }}>
            <div className="list-header">
              <div className="header-top">
                <h3>Existing Passes</h3>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search passes..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </div>
              <div className="filters-row">
                <div className="filters-left">
                  {/* Empty space for alignment */}
                </div>
                <div className="filters-right">
                  <div className="filter-dropdown">
                    <label htmlFor="soldFilter">Sale Status:</label>
                    <select 
                      id="soldFilter" 
                      value={soldFilter}
                      onChange={handleSoldFilterSelectChange}
                      className="filter-select"
                    >
                      <option value="all">All Passes</option>
                      <option value="sold">Sold</option>
                      <option value="unsold">Unsold</option>
                    </select>
                  </div>
                  <div className="filter-dropdown">
                    <label htmlFor="passTypeFilter">Pass Type:</label>
                    <select 
                      id="passTypeFilter" 
                      value={passTypeFilter}
                      onChange={handlePassTypeFilterSelectChange}
                      className="filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="Solo">Solo</option>
                      <option value="Duo">Duo</option>
                      <option value="Trio">Trio</option>
                      <option value="Quadro">Quadro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="loading">Loading passes...</div>
            ) : filteredPasses.length === 0 ? (
              <div className="no-records">No passes found</div>
            ) : (
              <>
                <div className="table-wrapper">
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
                        {currentPasses.map(pass => (
                          <tr key={pass._id} onClick={() => handleRowClick(pass)}>
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
                                    handlePassClick(e, pass);
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="action-btn update-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(pass);
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
                </div>
                
                {/* Pagination Controls */}
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {indexOfFirstPass + 1} to {Math.min(indexOfLastPass, filteredPasses.length)} of {filteredPasses.length} passes
                  </div>
                  <div className="pagination-container">
                    <div className="pagination-controls">
                      <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        &laquo; Prev
                      </button>
                      {[...Array(Math.min(5, Math.ceil(filteredPasses.length / itemsPerPage)))].map((_, i) => {
                        const pageNum = i + 1;
                        // Show current page and 2 pages before and after
                        let displayPageNum = pageNum;
                        const totalPages = Math.ceil(filteredPasses.length / itemsPerPage);
                        
                        // If there are more than 5 pages, show something like 1, 2, 3, ... 10
                        if (totalPages > 5) {
                          if (currentPage <= 3) {
                            // Near the start
                            displayPageNum = pageNum;
                          } else if (currentPage >= totalPages - 2) {
                            // Near the end
                            displayPageNum = totalPages - (4 - pageNum);
                          } else {
                            // In the middle
                            displayPageNum = currentPage - 2 + pageNum;
                          }
                        }
                        
                        return (
                          <button
                            key={displayPageNum}
                            onClick={() => paginate(displayPageNum)}
                            className={`pagination-btn ${currentPage === displayPageNum ? 'active' : ''}`}
                          >
                            {displayPageNum}
                          </button>
                        );
                      })}
                      {Math.ceil(filteredPasses.length / itemsPerPage) > 5 && (
                        <span className="pagination-ellipsis">...</span>
                      )}
                      {Math.ceil(filteredPasses.length / itemsPerPage) > 5 && (
                        <button
                          onClick={() => paginate(Math.ceil(filteredPasses.length / itemsPerPage))}
                          className={`pagination-btn ${currentPage === Math.ceil(filteredPasses.length / itemsPerPage) ? 'active' : ''}`}
                        >
                          {Math.ceil(filteredPasses.length / itemsPerPage)}
                        </button>
                      )}
                      <button 
                        onClick={nextPage} 
                        disabled={currentPage === Math.ceil(filteredPasses.length / itemsPerPage)}
                        className="pagination-btn"
                      >
                        Next &raquo;
                      </button>
                    </div>
                    <div className="pagination-per-page">
                      <label htmlFor="itemsPerPage">Show per page: </label>
                      <select 
                        id="itemsPerPage" 
                        value={itemsPerPage} 
                        onChange={handleItemsPerPageChange}
                        className="items-per-page-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
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
      <Footer />
      {showEventModal && <EventSelectionModal />}
    </>
  );
};

export default ManagePasses; 