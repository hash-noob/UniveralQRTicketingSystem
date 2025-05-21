const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isVisited: {
    type: Boolean,
    default: false
  }
});

const passSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[A-Za-z0-9]+$/
  },
  attendeeName: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
    maxLength: 100
  },
  passType: {
    type: String,
    required: true,
    enum: ['regular', 'Solo', 'Duo', 'Trio', 'Quadro'],
    default: 'regular'
  },
  events: [eventSchema],
  totalPrice: {
    type: Number,
    min: 0
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  phone: {
    type: String,
    trim: true,
    match: /^[0-9+\s-()]+$/
  },
  isScanned: {
    type: Boolean,
    default: false
  },
  scanTime: {
    type: Date
  },
  isSold: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate total price
passSchema.pre('save', function(next) {
  try {
    if (this.passType === 'regular') {
      // For regular passes, sum up the prices of selected events
      this.totalPrice = this.events.reduce((total, event) => total + event.price, 0);
    } else {
      // For special passes, use the fixed price
      const prices = {
        Solo: 410,
        Duo: 775,
        Trio: 1165,
        Quadro: 1550
      };
      this.totalPrice = prices[this.passType] || 0;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add indexes for faster queries
passSchema.index({ barcode: 1 });
passSchema.index({ passType: 1 });
passSchema.index({ isScanned: 1 });
passSchema.index({ 'events.name': 1 });

const Pass = mongoose.model('passes', passSchema);

module.exports = Pass; 