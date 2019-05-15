const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");
const settingsSchema = require("../db/settings-model");

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
  }

  setPeriodicSettings(periodicSettings) {
    const intervalInMilliseconds = this.convertSecondsToMilliseconds(
      Number(periodicSettings.periodInSeconds)
    );

    this.periodic = {
      message: javaScriptUtils.deepCopyObject(periodicSettings.message),
      intervalInMilliseconds
    };
  }

  setIsPeriodicMessageSendingActive(value) {
    this.isPeriodicMessageSendingActive = value;
  }

  getCurrentSettings() {
    return {
      id: this.id,
      onEvent: javaScriptUtils.deepCopyObject(this.onEvent),
      periodic: javaScriptUtils.deepCopyObject(this.periodic),
      isPeriodicMessageSendingActive: this.isPeriodicMessageSendingActive
    };
  }

  loadValuesFromDb() {
    settingsSchema.find({}, (err, data) => {
      // `find` returns an array by default.
      if (javaScriptUtils.isDefined(data[0])) {
        this.id = data[0]._id;

        this.onEvent = {
          message: data[0].onEvent
        };

        this.periodic = {
          message: data[0].periodic,
          intervalInMilliseconds: data[0].intervalInMilliseconds
        };
      }
    });
  }
}

module.exports = Settings;
