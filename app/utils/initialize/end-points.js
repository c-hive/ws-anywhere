module.exports = function(app, webSocketUserSettings) {
  app.post("/settings/onrequestdata", req => {
    webSocketUserSettings.setOnRequestData(req.body);
  });

  app.post("/settings/periodicdata", req => {
    webSocketUserSettings.setPeriodicData(req.body);
  });
};
