const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const expressWs = require("express-ws")(app);

const runtimeVariables = require("./configs/runtime-variables");
const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
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

    if (
      isConnectionOpen &&
      javaScriptUtils.isDefined(settings.periodic.message)
    ) {
      ws.send(JSON.stringify(settings.periodic.message));
    }
  }, settings.periodic.intervalInMilliseconds);
};

app.get("/settings/current", (req, res) => {
  const currentSettings = settings.getCurrentSettings();

  res.status(200).json({
    currentSettings
  });
});

app.post("/settings/onevent/save", (req, res) => {
  settings.setOnEventSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.status(200).json({
    success: true,
    currentSettings
  });
});

app.post("/settings/periodic/save", (req, res) => {
  settings.setPeriodicSettings(req.body);

  const currentSettings = settings.getCurrentSettings();

  res.status(200).send({
    success: true,
    currentSettings
  });
});

app.get("/settings/periodic/start", (req, res) => {
  expressWs.getWss().clients.forEach(client => {
    startSendingPeriodicMessage(client);
  });

  res.status(200).json({
    success: true
  });
});

app.get("/settings/periodic/stop", (req, res) => {
  clearInterval(timer);

  res.status(200).json({
    success: true
  });
});

app.get("/disconnect", (req, res) => {
  expressWs.getWss().clients.forEach(client => {
    client.close();
  });

  res.status(200).json({
    success: true
  });
});

app.ws("/", ws => {
  ws.on("message", () => {
    ws.send(JSON.stringify(settings.onEvent.message));
  });

  startSendingPeriodicMessage(ws);
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
