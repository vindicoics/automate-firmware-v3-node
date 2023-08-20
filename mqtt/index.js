

const redisConnect = require(`${global.approute}/lib/redis-connect`);
// const redisSearch = require(`${global.approute}/lib/redis-search`);
// const redisJSON = require(`${global.approute}/lib/redis-json`);
// const redisTimeseries = require(`${global.approute}/lib/redis-timeseries`);
// const redisSet = require(`${global.approute}/lib/redis-set`);
// const datetime = require(`${global.approute}/lib/datetime`);
// const dbSchema = require(`${global.approute}/db-schema.js`);
const relay = require(`${global.approute}/relay.js`);

// Mosquitto Client
const mosquitto = require(global.approute + '/lib/mosquitto-connect/index.js');

global.mqttClient.on("message", async (topic, message) => {
		// check for messages where the node is this node and the topic is control then write to the relay
		topicSplit = topic.split("/")
		switch (true) {
			case topicSplit[0] === 'node' && topicSplit[1] === global.nodeId && topicSplit[2] === 'control':
				data = JSON.parse(message);	
				if (data !== undefined) {
					// TODO - NEED TO ADD THIS TO THE DATABASE via SETUP.JS
					// let mqttService = await redisConnect.readString('mqttService');
					// if (mqttService == 1) {
						// console.log(topicSplit[3])
						await relay.write(topicSplit[3], data)
						// console.log(result.message)
					// }
				}
			default:
				break;
			}
});