const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settings = new Schema({
  onEventMessage: {
    type: String,
    default: null
  },
  periodicMessage: {
    type: String,
    default: null
  },
  interval: {
    type: Number,
    default: 10
  },
  isPeriodicMessageSendingActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Settings", settings);
