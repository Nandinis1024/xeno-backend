const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  totalSpents: {
    type: Number,
    default: 0,
  },
  lastVisit: {
    type: Date,
    default: Date.now,
  },
  totalVisits: {
    type: Number,
    default: 0,
  },
}, { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
