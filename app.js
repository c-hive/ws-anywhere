const bodyParser = require("body-parser");
const app = require("express")();
require("express-ws")(app);

const javaScriptUtils = require("./app/utils/javascript-utils/javascript-utils");
const runtimeVariables = require("./configs/runtime-variables");
const Settings = require("./app/settings/settings");

const settings = new Settings();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/settings/onrequestdata", req => {
  settings.setOnRequestData(req.body);
});

app.post("/settings/periodicdata", req => {
  settings.setPeriodicData(req.body);
});

app.ws("/", ws => {
  ws.on("message", () => {
    if (
      javaScriptUtils.objectIsNotEmpty(settings.onRequest.dummyResponseData)
    ) {
      ws.send(JSON.stringify(settings.onRequest.dummyResponseData));
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
