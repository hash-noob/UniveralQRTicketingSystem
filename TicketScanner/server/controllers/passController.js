const Pass = require('../models/Pass');

// Get all passes
exports.getAllPasses = async (req, res) => {
  try {
    const passes = await Pass.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: passes
    });
  } catch (error) {
    console.error('Error fetching passes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch passes',
      error: error.message
    });
  }
};

// Get a single pass by barcode
exports.getPassByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const pass = await Pass.findOne({ barcode });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pass
    });
  } catch (error) {
    console.error('Error fetching pass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pass',
      error: error.message
    });
  }
};

// Create a new pass
exports.createPass = async (req, res) => {
  try {
    const { barcode, attendeeName, passType, events, email, phone, isSold } = req.body;

    // Basic validation
    if (!barcode || !passType) {
      return res.status(400).json({
        success: false,
        message: 'Barcode and pass type are required'
      });
    }

    // Validate pass type
    const validPassTypes = ['regular', 'Solo', 'Duo', 'Trio', 'Quadro'];
    if (!validPassTypes.includes(passType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pass type'
      });
    }

    // For regular passes, validate events
    if (passType === 'regular' && (!events || events.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one event must be selected for regular passes'
      });
    }

    // Check for duplicate barcode
    const existingPass = await Pass.findOne({ barcode });
    if (existingPass) {
      return res.status(400).json({
        success: false,
        message: 'A pass with this barcode already exists'
      });
    }

    // For special passes, include all events
    let finalEvents = events;
    if (passType !== 'regular') {
      finalEvents = [
        { name: 'Blind Typing', price: 30 },
        { name: 'Code & Chaos', price: 50 },
        { name: 'Fandom Quiz', price: 30 },
        { name: 'Frontend Blitz', price: 50 },
        { name: 'Game Development Battles', price: 100 },
        { name: 'Hackathon', price: 100 },
        { name: 'Paper Presentation', price: 50 },
        { name: 'Poster Presentation', price: 100 },
        { name: 'Prompt Craft', price: 50 },
        { name: 'Treasure Hunt', price: 50 },
        { name: 'Dedicate a Song', price: 30 },
        { name: 'Game Arcade', price: 50 },
        { name: 'Ipl Auction', price: 50 },
        { name: 'Meme Contest', price: 50 },
        { name: 'Tug of War', price: 20 },
        { name: 'Open Mic', price: 0 }
      ];
    }

    // Create the pass
    const pass = new Pass({
      barcode,
      attendeeName,
      passType,
      events: finalEvents,
      email,
      phone,
      isSold: isSold || false // Default to false if not provided
    });

    await pass.save();
    
    res.status(201).json({
      success: true,
      data: pass
    });
  } catch (error) {
    console.error('Error creating pass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pass',
      error: error.message
    });
  }
};

// Scan a pass
exports.scanPass = async (req, res) => {
  try {
    const { barcode } = req.params;
    const pass = await Pass.findOne({ barcode });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    if (pass.isScanned) {
      return res.status(400).json({
        success: false,
        message: 'Pass has already been scanned',
        scanTime: pass.scanTime
      });
    }

    pass.isScanned = true;
    pass.scanTime = new Date();
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Pass scanned successfully',
      data: pass
    });
  } catch (error) {
    console.error('Error scanning pass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan pass',
      error: error.message
    });
  }
};

// Update a pass
exports.updatePass = async (req, res) => {
  try {
    console.log(req.body);
    const { id, events, attendeeName, email, phone, isSold, passType } = req.body;

    // Find the pass by ID
    const pass = await Pass.findById(id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Update pass fields if provided
    if (events !== undefined) {
      // Only update passType if it's provided, otherwise keep the existing one
      if (passType !== undefined) {
        pass.passType = passType;
      }
      
      pass.events = events;
      
      // Check if all events have been visited
      const allEventsVisited = events.every(event => event.isVisited);
      
      // If all events are visited, mark the pass as used (scanned)
      if (allEventsVisited && !pass.isScanned) {
        pass.isScanned = true;
        pass.scanTime = new Date();
      }
    }

    // Update attendee details if provided
    if (attendeeName !== undefined) pass.attendeeName = attendeeName;
    if (email !== undefined) pass.email = email;
    if (phone !== undefined) pass.phone = phone;
    if (isSold !== undefined) pass.isSold = isSold;
    if (passType !== undefined) pass.passType = passType;

    // Save the updated pass
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Pass updated successfully',
      data: pass
    });
  } catch (error) {
    console.error('Error updating pass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pass',
      error: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id, events } = req.body;

    const pass = await Pass.findById(id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    pass.events = events;
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Pass updated successfully',
      data: pass
    });
  } catch (error) {
    console.error('Error updating pass:', error);
    res.status(500).json({
      success: false, 
      message: 'Failed to update pass',
      error: error.message
    });
  }
};

// Delete pass
exports.deletePass = async (req, res) => {
  try {
    const { barcode } = req.params;
    const pass = await Pass.findOneAndDelete({ barcode });

    if (!pass) {
      return res.status(404).json({
        message: 'Pass not found'
      });
    }

    res.json({
      message: 'Pass deleted successfully',
      pass
    });
  } catch (error) {
    console.error('Error deleting pass:', error);
    res.status(500).json({
      message: 'Failed to delete pass',
      error: error.message
    });
  }
};

// Get pass by ID
exports.getPassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pass = await Pass.findById(id);
    
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: pass
    });
  } catch (error) {
    console.error('Error fetching pass by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pass',
      error: error.message
    });
  }
}; 