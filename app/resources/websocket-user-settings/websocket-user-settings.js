const javaScriptUtils = require("../../utils/javascript-utils/");

class WebsocketUserSettings {
  constructor() {
    this.onRequest = {
      responseData: {}
    };

    this.periodic = {
      responseData: {},
      seconds: 0
    };
  }

  convertSecondsToMilliseconds(seconds) {
    const oneSecondInMilliseconds = 1000;

    return seconds * oneSecondInMilliseconds;
  }

  setOnRequestData(data) {
    this.onRequest = {
      responseData: javaScriptUtils.deepCopyObject(data.responseData)
    };
  }

  setPeriodicData(data) {
    this.periodic = {
      responseData: javaScriptUtils.deepCopyObject(data.responseData),
      seconds: this.convertSecondsToMilliseconds(Number(data.periodInSeconds))
    };
  }
}

module.exports = WebsocketUserSettings;
