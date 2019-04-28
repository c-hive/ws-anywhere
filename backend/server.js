const path = require('path');
const bodyParser = require('body-parser');
const app = require('express')();
require('express-ws')(app);

const JavaScriptUtils = require('./utils/JavaScriptUtils/JavaScriptUtils');
const WsSettingsClass = require('./utils/resources/WsSettings/WsSettings');

const WsSettings = new WsSettingsClass();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/onrequestdata', (req) => {
	WsSettings.setOnRequestData(req.body);
});

app.post('/periodicdata', (req) => {
	WsSettings.setPeriodicData(req.body);
});

app.ws('/', (ws) => {
	ws.on('message', () => {
		if (JavaScriptUtils.objectIsNotEmpty(WsSettings.onRequest.responseData)) {
			ws.send(JSON.stringify(WsSettings.onRequest.responseData));
		}

		if (JavaScriptUtils.objectIsNotEmpty(WsSettings.periodic.responseData)) {
			setInterval(() => {
				ws.send(JSON.stringify(WsSettings.periodic.responseData));
			}, WsSettings.periodic.seconds);
		}
	});
});

const port = process.env.PORT || 3000;
const indexFile = path.join(process.cwd(), 'frontend/index.html');

app
	.use((req, res) => res.sendFile(indexFile) )
	.listen(port);
