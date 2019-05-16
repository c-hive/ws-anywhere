const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const setting = new Schema({
  onEventMessage: {
    type: String,
    default: null
  },
  periodicMessage: {
    type: String,
    default: null
  },
  intervalInMilliseconds: {
    type: Number,
    default: 0
  },
  isPeriodicMessageSendingActive: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Setting", setting);
