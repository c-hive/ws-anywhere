const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
  onEvent: {
    type: String,
    default: null
  },
  periodic: {
    type: String,
    default: null
  },
  intervalInMilliseconds: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Settings", settingsSchema);
