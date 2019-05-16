const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const expressWs = require("express-ws")(app);

const runtimeVariables = require("./configs/runtime-variables");
const Setting = require("./app/db/setting");
const SettingPersister = require("./app/setting-persister/setting-persister");

let settingPersister;

mongoose.connect(runtimeVariables.dbURI, err => {
  if (err) throw new Error("Incorrect MongoDB connection URI - " + err);

  Setting.count({}, (_, count) => {
    const dbIsEmpty = count === 0;

    if (dbIsEmpty) {
      const newSetting = new Setting();

      settingPersister = new SettingPersister(newSetting._id);

      newSetting.save(err => {
        // eslint-disable-next-line no-console
        if (err) console.error(err);
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
  settingPersister.copy((err, copiedData) => {
    // FIXME: no errors please! :)
    // eslint-disable-next-line no-console
    if (err) return console.error(err);

    timer = setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(copiedData.periodicMessage);
      }
    }, copiedData.intervalInMilliseconds);
  });
};

const sendPeriodicMessageToAllClients = () => {
  expressWs.getWss().clients.forEach(client => {
    createPeriodicMessageInterval(client);
  });
};

app.get("/settings/current", (req, res) => {
  settingPersister.copy((err, copiedData) => {
    // TODO: error handling.
    res.status(200).json({
      currentSettings: copiedData
    });
  });
});

app.post("/settings/onevent/save", (req, res) => {
  settingPersister.update(req.body, (err, copiedData) => {
    if (err) {
      return res.json({
        success: false
      });
    }

    res.status(200).json({
      success: true,
      currentSettings: copiedData
    });
  });
});

app.post("/settings/periodic/save", (req, res) => {
  settingPersister.update(req.body, (err, copiedData) => {
    if (err) {
      return res.json({
        success: false
      });
    }

    if (copiedData.isPeriodicMessageSendingActive) {
      clearInterval(timer);

      sendPeriodicMessageToAllClients();
    }

    res.status(200).send({
      success: true,
      currentSettings: copiedData
    });
  });
});

app.get("/settings/periodic/start", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: true
  };

  settingPersister.update(data, err => {
    if (err) {
      // TODO: add status code!
      return res.json({
        success: false
      });
    }

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

  settingPersister.update(data, err => {
    if (err) {
      return res.json({
        success: false
      });
    }

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
    settingPersister.copy((err, copiedData) => {
      ws.send(JSON.stringify(copiedData.onEventMessage));
    });
  });

  settingPersister.copy((err, copiedData) => {
    if (copiedData.isPeriodicMessageSendingActive) {
      createPeriodicMessageInterval(ws);
    }
  });
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
