const javaScriptUtils = require("../utils/javascript-utils/javascript-utils");

class Settings {
  constructor() {
    this.onRequest = {
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

  setOnRequestData(data) {
    this.onRequest = {
      dummyResponseData: javaScriptUtils.deepCopyObject(data.dummyResponseData)
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
