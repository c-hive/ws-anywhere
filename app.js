const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const expressWs = require("express-ws")(app);

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

app.post("/settings/onevent", (req, res) => {
  settings.setOnEventSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.json({
    success: true,
    currentSettings
  });
});

app.post("/settings/periodic", (req, res) => {
  settings.setPeriodicSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.send({
    success: true,
    currentSettings
  });
});

app.get("/disconnect", (req, res) => {
  expressWs.getWss().clients.forEach(client => {
    client.close();
  });

  res.json({
    success: true
  });
});

app.ws("/", ws => {
  ws.on("message", () => {
    if (
      javaScriptUtils.objectIsNotEmpty(settings.onEvent.dummyResponseMessage)
    ) {
      ws.send(JSON.stringify(settings.onEvent.dummyResponseMessage));
    }
  });

  if (
    javaScriptUtils.objectIsNotEmpty(settings.periodic.dummyResponseMessage)
  ) {
    setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(JSON.stringify(settings.periodic.dummyResponseMessage));
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
