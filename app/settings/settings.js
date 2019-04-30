const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");

class Settings {
  constructor() {
    this.perRequest = {
      dummyResponseData: {}
    };

    this.periodic = {
      dummyResponseData: {},
      intervalInMilliseconds: 0
    };
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setPerRequestData(data) {
    this.perRequest = {
      dummyResponseData: javaScriptUtils.deepCopyObject(data)
    };
  }

  setPeriodicData(data) {
    this.periodic = {
      dummyResponseData: javaScriptUtils.deepCopyObject(data.dummyResponseData),
      intervalInMilliseconds: this.convertSecondsToMilliseconds(
        Number(data.periodInSeconds)
      )
    };
  }
}

module.exports = Settings;
