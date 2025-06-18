const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  location: {
    name: { type: String, required: false, trim: true },
    lat: { type: String, required: false },
    lng: { type: String, required: false }
  },
  mediaPath: {
    type: Schema.Types.Mixed, // allows object, string, array, etc.
    default: null
  },
  reason: {
    type: String,
    required: false,
    trim: true
  },
  additionalInfo: {
    type: String,
    required: false,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'other'],
    required: false
  },
  reportedBy: {
    type: String,
    required: false,
    trim: true
  },
  comments: [
    {
      author: { type: String, required: true, trim: true }, // could be userId or name
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
