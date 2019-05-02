const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/settings/settings");

const settings = new Settings();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "resources")));
app.use(express.static(path.join(__dirname, "scripts")));

app.get("/settings/current", (req, res) => {
  const currentSettings = settings.getCurrentSettings();

  res.json({
    currentSettings
  });
});

app.post("/settings/perrequestdata", (req, res) => {
  settings.setPerRequestSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.json({
    success: true,
    currentSettings
  });
});

app.post("/settings/periodicdata", (req, res) => {
  settings.setPeriodicSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.send({
    success: true,
    currentSettings
  });
});

app.ws("/", ws => {
  ws.on("message", () => {
    if (javaScriptUtils.objectIsNotEmpty(settings.perRequest.dummyData)) {
      ws.send(JSON.stringify(settings.perRequest.dummyData));
    }
  });

  if (javaScriptUtils.objectIsNotEmpty(settings.periodic.dummyData)) {
    setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(JSON.stringify(settings.periodic.dummyData));
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
