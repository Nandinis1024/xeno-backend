const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    default: 'pending',
  }
});

const communicationSchema = new mongoose.Schema({
  customers: [customerSchema],
}, { timestamps: true });

const Communication = mongoose.model('Communication', communicationSchema);
module.exports = Communication;
