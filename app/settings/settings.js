const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");

class Settings {
  constructor() {
    this.perRequest = {
      dummyData: {}
    };

    this.periodic = {
      dummyData: {},
      intervalInMilliseconds: 0
    };
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setPerRequestSettings(perRequestDummyData) {
    this.perRequest = {
      dummyData: javaScriptUtils.deepCopyObject(perRequestDummyData)
    };
  }

  setPeriodicSettings(periodicSettings) {
    this.periodic = {
      dummyData: javaScriptUtils.deepCopyObject(periodicSettings.dummyData),
      intervalInMilliseconds: this.convertSecondsToMilliseconds(
        Number(periodicSettings.periodInSeconds)
      )
    };
  }

  getCurrentSettings() {
    return {
      perRequest: javaScriptUtils.deepCopyObject(this.perRequest),
      periodic: javaScriptUtils.deepCopyObject(this.periodic)
    };
  }
}

module.exports = Settings;
