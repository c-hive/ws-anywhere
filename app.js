const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const expressWs = require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Setting = require("./app/db/setting");

let setting;

mongoose.connect(runtimeVariables.dbURI, err => {
  if (err) {
    if (err.name === "MongoNetworkError") {
      throw new Error("Incorrect MongoDB connection uri.");
    }

    throw err;
  }

  Setting.find({}, (err, data) => {
    if (err) throw err;

    const dbIsEmpty = data.length === 0;

    if (dbIsEmpty) {
      setting = new Setting();

      setting.save(err => {
        if (err) throw err;
      });
    } else {
      setting = data[0];
    }
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "resources")));
app.use(express.static(path.join(__dirname, "scripts")));

let timer;

const createPeriodicMessageInterval = ws => {
  Setting.findById(setting._id, (err, copiedSettings) => {
    if (err) throw err;

    timer = setInterval(() => {
      // https://github.com/websockets/ws/issues/793
      const isConnectionOpen = ws.readyState === ws.OPEN;

      if (isConnectionOpen) {
        ws.send(copiedSettings.periodicMessage);
      }
    }, copiedSettings.interval * 1000);
  });
};

const sendPeriodicMessageToAllClients = () => {
  expressWs.getWss().clients.forEach(client => {
    createPeriodicMessageInterval(client);
  });
};

app.get("/settings/current", (req, res) => {
  Setting.findById(setting._id, (err, copiedSettings) => {
    if (err) throw err;

    return res.status(200).json({
      currentSettings: copiedSettings
    });
  });
});

app.post("/settings/onevent/save", (req, res) => {
  Setting.findOneAndUpdate(setting._id, req.body, err => {
    if (err) throw err;

    return res.sendStatus(200);
  });
});

app.post("/settings/periodic/save", (req, res) => {
  Setting.findOneAndUpdate(setting._id, req.body, (err, updatedSettings) => {
    if (err) throw err;

    if (updatedSettings.isPeriodicMessageSendingActive) {
      clearInterval(timer);

      sendPeriodicMessageToAllClients();
    }

    return res.sendStatus(200);
  });
});

app.get("/settings/periodic/start", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: true
  };

  Setting.findOneAndUpdate(setting._id, data, err => {
    if (err) throw err;

    sendPeriodicMessageToAllClients();

    return res.sendStatus(200);
  });
});

app.get("/settings/periodic/stop", (req, res) => {
  const data = {
    isPeriodicMessageSendingActive: false
  };

  Setting.findOneAndUpdate(setting._id, data, err => {
    if (err) throw err;

    clearInterval(timer);

    return res.sendStatus(200);
  });
});

app.get("/disconnect", (req, res) => {
  expressWs.getWss().clients.forEach(client => {
    client.close();
  });

  return res.sendStatus(200);
});

app.ws("/", ws => {
  ws.on("message", () => {
    Setting.findById(setting._id, (err, copiedSettings) => {
      if (err) throw err;

      if (javaScriptUtils.isDefined(copiedSettings.onEventMessage)) {
        ws.send(copiedSettings.onEventMessage);
      }
    });
  });

  Setting.findById(setting._id, (err, copiedSettings) => {
    if (err) throw err;

    if (copiedSettings.isPeriodicMessageSendingActive) {
      createPeriodicMessageInterval(ws);
    }
  });
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
