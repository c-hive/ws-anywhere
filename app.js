const bodyParser = require("body-parser");
const app = require("express")();
require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/settings/settings");

const settings = new Settings();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/settings/perrequestdata", (req, res) => {
  settings.setPerRequestData(req.body);

  res.json({
    success: true
  });
});

app.post("/settings/periodicdata", (req, res) => {
  settings.setPeriodicData(req.body);

  res.send({
    success: true
  });
});

app.ws("/", ws => {
  ws.on("message", () => {
    if (
      javaScriptUtils.objectIsNotEmpty(settings.perRequest.dummyResponseData)
    ) {
      ws.send(JSON.stringify(settings.perRequest.dummyResponseData));
    }
  });

  if (javaScriptUtils.objectIsNotEmpty(settings.periodic.dummyResponseData)) {
    setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(JSON.stringify(settings.periodic.dummyResponseData));
      } else {
        // It might not be necessary, but good to close the connection safely.
        ws.close();
      }
    }, settings.periodic.intervalInMilliseconds);
  }
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
