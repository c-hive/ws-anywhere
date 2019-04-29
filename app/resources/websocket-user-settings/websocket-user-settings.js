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

  setOnRequestData(responseData) {
    this.onRequest = {
      responseData: javaScriptUtils.deepCopyObject(responseData)
    };
  }

  setPeriodicData(data) {
    this.periodic = {
      responseData: JSON.parse(
        javaScriptUtils.deepCopyObject(data.responseData)
      ),
      seconds: data.periodInSeconds
    };
  }
}

module.exports = WebsocketUserSettings;
