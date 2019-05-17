const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const expressWs = require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/db/settings");

let settings;

mongoose.connect(runtimeVariables.dbURI, err => {
  if (err) {
    if (err.name === "MongoNetworkError") {
      throw new Error("Incorrect MongoDB connection uri.");
    } else {
      throw err;
    }
  }

  Settings.countDocuments({}, (_, count) => {
    const dbIsEmpty = count === 0;

    if (dbIsEmpty) {
      settings = new Settings();

      settings.save(err => {
        if (err) throw err;
      });
    }
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "resources")));
app.use(express.static(path.join(__dirname, "scripts")));

let timer;

const createPeriodicMessageInterval = ws => {
  Settings.findById(settings._id, (err, settings) => {
    if (err) throw err;

    timer = setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(settings.periodicMessage);
      }
    }, settings.interval * 1000);
  });
};

const sendPeriodicMessageToAllClients = () => {
  expressWs.getWss().clients.forEach(client => {
    createPeriodicMessageInterval(client);
  });
};

app.get("/settings/current", (req, res) => {
  Settings.findById(settings._id, (err, settings) => {
    if (err) throw err;

    res.status(200).json({
      success: true,
      currentSettings: settings
    });
  });
});

app.post("/settings/onevent/save", (req, res) => {
  Settings.findOneAndUpdate(settings._id, req.body, (err, updatedSettings) => {
    if (err) throw err;

    res.status(200).json({
      success: true,
      currentSettings: updatedSettings
    });
  });
});

app.post("/settings/periodic/save", (req, res) => {
  Settings.findOneAndUpdate(settings._id, req.body, (err, updatedSettings) => {
    if (err) throw err;

    if (updatedSettings.isPeriodicMessageSendingActive) {
      clearInterval(timer);

      sendPeriodicMessageToAllClients();
    }

    res.status(200).send({
      success: true,
      currentSettings: updatedSettings
    });
  });
});

app.get("/settings/periodic/start", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: true
  };

  Settings.findOneAndUpdate(settings._id, data, err => {
    if (err) throw err;

    sendPeriodicMessageToAllClients();

    res.status(200).json({
      success: true
    });
  });
});

app.get("/settings/periodic/stop", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: false
  };

  Settings.findOneAndUpdate(settings._id, data, err => {
    if (err) throw err;

    clearInterval(timer);

    res.status(200).json({
      success: true
    });
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
    Settings.findById(settings._id, (err, settings) => {
      if (err) throw err;

      if (javaScriptUtils.isDefined(settings.onEventMessage)) {
        ws.send(settings.onEventMessage);
      }
    });
  });

  Settings.findById(settings._id, (err, settings) => {
    if (err) throw err;

    if (settings.isPeriodicMessageSendingActive) {
      createPeriodicMessageInterval(ws);
    }
  });
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
