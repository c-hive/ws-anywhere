const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");

class Settings {
  constructor() {
    this.onEvent = {
      dummyResponseMessage: {}
    };

    this.periodic = {
      dummyResponseMessage: {},
      intervalInMilliseconds: 0
    };
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setOnEventSettings(onEventResponseMessage) {
    this.onEvent = {
      dummyResponseMessage: javaScriptUtils.deepCopyObject(
        onEventResponseMessage
      )
    };
  }

  setPeriodicSettings(periodicSettings) {
    this.periodic = {
      dummyResponseMessage: javaScriptUtils.deepCopyObject(
        periodicSettings.responseMessage
      ),
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
