class WsSettings {
	constructor() {
		this.onRequest = {
			responseData: {},
		};
		this.periodic = {
			responseData: {},
			seconds: 0,
		};
	}
    
	setOnRequestData(responseData) {
		this.onRequest = {
			responseData,
		};
	}
    
	setPeriodicData(data) {
		this.periodic = {
			responseData: JSON.parse(data.responseData),
			seconds: data.periodInSeconds,
		};
	}
}

module.exports = WsSettings;
