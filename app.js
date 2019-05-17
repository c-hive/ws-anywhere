const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const expressWs = require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Setting = require("./app/db/setting");

let settingPersister;

mongoose.connect(runtimeVariables.dbURI, err => {
  if (err) throw new Error("Incorrect MongoDB connection URI - " + err);

  Setting.count({}, (_, count) => {
    const dbIsEmpty = count === 0;

    if (dbIsEmpty) {
      settingPersister = new Setting();

      settingPersister.save(() => {
        // eslint-disable-next-line no-console
        // if (err) console.error(err);
        // ???
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
  Setting.findById(settingPersister._id, (err, settings) => {
    timer = setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(settings.periodicMessage);
      }
    }, settings.intervalInMilliseconds);
  });
};

const sendPeriodicMessageToAllClients = () => {
  expressWs.getWss().clients.forEach(client => {
    createPeriodicMessageInterval(client);
  });
};

app.get("/settings/current", (req, res) => {
  Setting.findById(settingPersister._id, (err, settings) => {
    res.status(200).json({
      success: true,
      currentSettings: settings
    });
  });
});

app.post("/settings/onevent/save", (req, res) => {
  Setting.findOneAndUpdate(
    settingPersister._id,
    req.body,
    (err, updatedSettings) => {
      res.status(200).json({
        success: true,
        currentSettings: updatedSettings
      });
    }
  );
});

app.post("/settings/periodic/save", (req, res) => {
  Setting.findOneAndUpdate(
    settingPersister._id,
    req.body,
    (err, updatedSettings) => {
      if (updatedSettings.isPeriodicMessageSendingActive) {
        clearInterval(timer);

        sendPeriodicMessageToAllClients();
      }

      res.status(200).send({
        success: true,
        currentSettings: updatedSettings
      });
    }
  );
});

app.get("/settings/periodic/start", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: true
  };

  Setting.findOneAndDelete(settingPersister._id, data, () => {
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

  Setting.findOneAndUpdate(settingPersister._id, data, () => {
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
    Setting.findById(settingPersister._id, (err, settings) => {
      if (javaScriptUtils.isDefined(settings.onEventMessage)) {
        ws.send(settings.onEventMessage);
      }
    });
  });

  Setting.findById(settingPersister._id, (err, settings) => {
    if (settings.isPeriodicMessageSendingActive) {
      createPeriodicMessageInterval(ws);
    }
  });
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
