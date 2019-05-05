const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");

class Settings {
  constructor() {
    this.onEvent = {
      message: null
    };

    this.periodic = {
      message: null,
      intervalInMilliseconds: 0
    };
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setOnEventSettings(onEventResponseMessage) {
    this.onEvent = {
      message: javaScriptUtils.deepCopyObject(onEventResponseMessage)
    };
  }

  setPeriodicSettings(periodicSettings) {
    this.periodic = {
      message: javaScriptUtils.deepCopyObject(periodicSettings.message),
      intervalInMilliseconds: this.convertSecondsToMilliseconds(
        Number(periodicSettings.periodInSeconds)
      )
    };
  }

  getCurrentSettings() {
    return {
      onEvent: javaScriptUtils.deepCopyObject(this.onEvent),
      periodic: javaScriptUtils.deepCopyObject(this.periodic)
    };
  }
}

module.exports = Settings;
