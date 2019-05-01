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

  setPerRequestData(data) {
    this.perRequest = {
      dummyData: javaScriptUtils.deepCopyObject(data)
    };
  }

  setPeriodicData(data) {
    this.periodic = {
      dummyData: javaScriptUtils.deepCopyObject(data.dummyData),
      intervalInMilliseconds: this.convertSecondsToMilliseconds(
        Number(data.periodInSeconds)
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
