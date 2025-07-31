const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: String,
  message: String,
  recipients: [String],
  scheduledTime: Date,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  logs: [
    {
      recipient: String,
      status: String,
      error: String
    }
  ]
});

module.exports = mongoose.model('Campaign', campaignSchema);
