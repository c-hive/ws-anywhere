const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const expressWs = require("express-ws")(app);

const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/settings/settings");
const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const settingsSchema = require("./app/db/settings-model");

const settings = new Settings();

// https://mongoosejs.com/docs/deprecations.html
mongoose.set("useFindAndModify", false);

mongoose.connect(runtimeVariables.dbURI, err => {
  if (err) throw new Error("Incorrect MongoDB connection URI - " + err);

  settings.loadValuesFromDb();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "resources")));
app.use(express.static(path.join(__dirname, "scripts")));

const save = (id, data) => {
  if (javaScriptUtils.isDefined(id)) {
    // TODO: should tbe callback be used/defined?
    settingsSchema.findByIdAndUpdate(id, data, err => {
      // eslint-disable-next-line no-console
      if (err) console.error(err);
    });
  } else {
    const newSettings = new settingsSchema({
      onEvent: data.message
    });

    newSettings.save(err => {
      // eslint-disable-next-line no-console
      if (err) console.error(err);
    });
  }
};

let timer;

const createPeriodicMessageInterval = ws => {
  timer = setInterval(() => {
    // https://github.com/websockets/ws/issues/793
    const isConnectionOpen = ws.readyState === ws.OPEN;

    if (isConnectionOpen) {
      ws.send(settings.periodic.message);
    }
  }, settings.periodic.intervalInMilliseconds);
};

const sendPeriodicMessageToAllClients = () => {
  expressWs.getWss().clients.forEach(client => {
    createPeriodicMessageInterval(client);
  });
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

  save(currentSettings.id, {
    onEvent: currentSettings.onEvent.message,
    periodic: currentSettings.periodic.message,
    intervalInMilliseconds: currentSettings.periodic.intervalInMilliseconds
  });

  res.status(200).json({
    success: true,
    currentSettings
  });
});

app.post("/settings/periodic/save", (req, res) => {
  settings.setPeriodicSettings(req.body);

  if (settings.isPeriodicMessageSendingActive) {
    clearInterval(timer);

    sendPeriodicMessageToAllClients();
  }

  const currentSettings = settings.getCurrentSettings();

  save(currentSettings.id, {
    onEvent: currentSettings.onEvent.message,
    periodic: currentSettings.periodic.message,
    intervalInMilliseconds: currentSettings.periodic.intervalInMilliseconds
  });

  res.status(200).send({
    success: true,
    currentSettings
  });
});

app.get("/settings/periodic/start", (req, res) => {
  settings.setIsPeriodicMessageSendingActive(true);

  sendPeriodicMessageToAllClients();

  res.status(200).json({
    success: true
  });
});

app.get("/settings/periodic/stop", (req, res) => {
  settings.setIsPeriodicMessageSendingActive(false);

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

  if (settings.isPeriodicMessageSendingActive) {
    createPeriodicMessageInterval(ws);
  }
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
