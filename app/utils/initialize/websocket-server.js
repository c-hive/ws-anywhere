const javaScriptUtils = require("../javascript-utils");

module.exports = function(app, webSocketUserSettings) {
  app.ws("/", ws => {
    ws.on("message", () => {
      if (
        javaScriptUtils.objectIsNotEmpty(
          webSocketUserSettings.onRequest.dummyResponseData
        )
      ) {
        ws.send(
          JSON.stringify(webSocketUserSettings.onRequest.dummyResponseData)
        );
      }

      if (
        javaScriptUtils.objectIsNotEmpty(
          webSocketUserSettings.periodic.dummyResponseData
        )
      ) {
        setInterval(() => {
          ws.send(
            JSON.stringify(webSocketUserSettings.periodic.dummyResponseData)
          );
        }, webSocketUserSettings.periodic.intervalInMilliseconds);
      }
    });
  });
};
