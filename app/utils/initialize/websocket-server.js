const javaScriptUtils = require("../javascript-utils");

module.exports = function(app, webSocketUserSettings) {
  app.ws("/", ws => {
    ws.on("message", () => {
      if (
        javaScriptUtils.objectIsNotEmpty(
          webSocketUserSettings.onRequest.responseData
        )
      ) {
        ws.send(JSON.stringify(webSocketUserSettings.onRequest.responseData));
      }

      if (
        javaScriptUtils.objectIsNotEmpty(
          webSocketUserSettings.periodic.responseData
        )
      ) {
        setInterval(() => {
          ws.send(JSON.stringify(webSocketUserSettings.periodic.responseData));
        }, webSocketUserSettings.periodic.seconds);
      }
    });
  });
};
