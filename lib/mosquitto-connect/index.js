// Component for connecting to Mosquitto using the standard Mosquitto client
// Writen by Ryan Griffiths - ryan@vindico.net - 27-May-2023

const mqtt = require("async-mqtt");

module.exports.connect = () => {
	return new Promise((resolve, reject) => {
		(async () => {
    	try {
				console.log (`Connecting to Mosquitto Server (${process.env.MOSQUITTO_HOST}:${process.env.MOSQUITTO_PORT})...`);
				let options = {
					mqttConId: 'server',
					username: process.env.MOSQUITTO_USERNAME,
					password: process.env.MOSQUITTO_PASSWORD
				}
				const client = mqtt.connect(process.env.MOSQUITTO_HOST, options);
				client.on('connect', () => {
					console.log('MQTT server is available.');
					resolve(client)
				});
				
				client.on('error', (error) => {
					console.error('Controller is not available yet. Retrying...');
					// setTimeout(() => reject(error), 5000); // Retry after 5 seconds.
				});
				
				// console.log('Mosquitto Client Connected');
			}
			catch (error) {
				console.error('#ERROR - Could not connect to Mosquitto')
				reject(error);
			}
		})();
	});
};


// MQTT SUBSCRIBE
module.exports.subscribe = (topic) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (topic === undefined) throw new Error("ERROR - Topic Not Provided");
				const result = await global.mqttClient.subscribe(topic)
				if (result[0].topic === topic) {
					resolve({ status: "success", data: result[0], message: `Subscribed to Topic ${topic}` });
				} else {
					reject({ status: "error", data: null, message: `ERROR - Couldn't Subscribe to Topic ${topic}`, stack: null });
				}	
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: `ERROR - Couldn't Subscribe to Topic ${topic}`, stack: error });
			}
		})();
	});
};

// MQTT Publish
module.exports.publish = (topic, data) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (topic === undefined) throw new Error("ERROR - Topic Not Provided");
				if (data === undefined) throw new Error("ERROR - Data Not Provided");
				let payload = JSON.stringify(data);
				const result = await global.mqttClient.publish(topic, payload)
				resolve({ status: "success", data: result, message: `Published to Topic ${topic}` });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: `ERROR - Couldn't Publish to Topic ${topic}`, stack: error });
			}
		})();
	});
};
