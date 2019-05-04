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

let timer;

const startSendingPeriodicMessage = ws => {
  timer = setInterval(() => {
    // https://github.com/websockets/ws/issues/793
    const isConnectionOpen = ws.readyState === ws.OPEN;

    if (isConnectionOpen) {
      ws.send(JSON.stringify(settings.periodic.message));
    }
  }, settings.periodic.intervalInMilliseconds);
};

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

app.get("/settings/periodic/start", (req, res) => {
  expressWs.getWss().clients.forEach(client => {
    startSendingPeriodicMessage(client);
  });

  res.json({
    success: true
  });
});

app.get("/settings/periodic/stop", (req, res) => {
  clearInterval(timer);

  res.json({
    success: true
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
    if (javaScriptUtils.objectIsNotEmpty(settings.onEvent.message)) {
      ws.send(JSON.stringify(settings.onEvent.message));
    }
  });

  if (javaScriptUtils.objectIsNotEmpty(settings.periodic.message)) {
    startSendingPeriodicMessage(ws);
  }
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
