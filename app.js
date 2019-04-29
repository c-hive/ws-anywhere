const bodyParser = require("body-parser");
const app = require("express")();
require("express-ws")(app);

const initialize = require("./app/utils/initialize");
const runtimeVariables = require("./configs/runtime-variables");
const WebsocketUserSettings = require("./app/resources/websocket-user-settings/websocket-user-settings");

const webSocketUserSettings = new WebsocketUserSettings();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

initialize.endPoints(app);
initialize.webSocketServer(app, webSocketUserSettings);

app
  .use((req, res) => res.sendFile(runtimeVariables.indexFilePath))
  .listen(runtimeVariables.port);
