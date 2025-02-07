const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
  UserID: {
    type: String,
    required: true,
  },
  WarnedBy: {
    type: String,
    required: true,
  },
  Reason: {
    type: String,
    required: true,
  },
  Date: {
    type: Number,
    required: true,
  },
});

const Warns = mongoose.model('Warns', warnSchema);

module.exports = Warns;
