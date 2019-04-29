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

    this.oneMinInMilliseconds = 1000;
  }

  setOnRequestData(data) {
    this.onRequest = {
      responseData: javaScriptUtils.deepCopyObject(data.responseData)
    };
  }

  setPeriodicData(data) {
    this.periodic = {
      responseData: javaScriptUtils.deepCopyObject(data.responseData),
      seconds: Number(data.periodInSeconds) * this.oneMinInMilliseconds
    };
  }
}

module.exports = WebsocketUserSettings;
