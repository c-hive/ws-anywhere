const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");
const settingsSchema = require("../db/settings-model");

const save = (id, data) => {
  if (javaScriptUtils.isDefined(id)) {
    settingsSchema.findByIdAndUpdate(id, data);
  } else {
    const newSettings = new settingsSchema({
      onEvent: data.message
    });

    newSettings.save();
  }
};

// TODO: How about disabling the button so that avoid spamming DB calls?
class Settings {
  constructor() {
    this.id = null;

    this.onEvent = {
      message: null
    };

    this.periodic = {
      message: null,
      intervalInMilliseconds: 0
    };

    this.isPeriodicMessageSendingActive = false;
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setOnEventSettings(onEventSettings) {
    this.onEvent = {
      message: javaScriptUtils.deepCopyObject(onEventSettings.message)
    };

    save(this.id, { onEvent: onEventSettings.message });
  }

  setPeriodicSettings(periodicSettings) {
    this.periodic = {
      message: javaScriptUtils.deepCopyObject(periodicSettings.message),
      intervalInMilliseconds: this.convertSecondsToMilliseconds(
        Number(periodicSettings.periodInSeconds)
      )
    };
  }

  setIsPeriodicMessageSendingActive(value) {
    this.isPeriodicMessageSendingActive = value;
  }

  getCurrentSettings() {
    return {
      onEvent: javaScriptUtils.deepCopyObject(this.onEvent),
      periodic: javaScriptUtils.deepCopyObject(this.periodic),
      isPeriodicMessageSendingActive: this.isPeriodicMessageSendingActive
    };
  }

  loadValuesFromDb() {
    settingsSchema.find({}, (err, data) => {
      this.id = data[0]._id;

      this.onEvent = {
        message: data[0].onEvent
      };

      this.periodic = {
        message: data[0].periodic,
        intervalInMilliseconds: data[0].intervalInMilliseconds
      };
    });
  }
}

module.exports = Settings;
