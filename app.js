const bodyParser = require("body-parser");
const app = require("express")();
require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/settings/settings");

const settings = new Settings();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/settings/perrequestdata", req => {
  settings.setPerRequestData(req.body);
});

app.post("/settings/periodicdata", req => {
  settings.setPeriodicData(req.body);
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
      ws.send(JSON.stringify(settings.periodic.dummyResponseData));
    }, settings.periodic.intervalInMilliseconds);
  }
});

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
