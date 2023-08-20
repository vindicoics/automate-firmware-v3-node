const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

// Basic Express Server
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const port = process.env.WEB_PORT;

// Require Axios
const axios = require('axios');

// Require package.json
const package = require('./package.json');

// Create Global Directory for use throughout app
const path = require('path');
global.approute = path.resolve(__dirname);

// Need to update this
const apppath = __dirname + '/public/';
app.use(express.static(apppath));

// Mosquitto Client
const mosquittoConnect = require(global.approute + '/lib/mosquitto-connect/index.js');

// Redis Client
const redisConnect = require(global.approute + '/lib/redis-connect/index.js');
const redisJSON = require(global.approute + '/lib/redis-json/index.js');

// Add Middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit : 52428800}))
app.use(bodyParser.urlencoded({ extended: true }));

// Add Router
const router = require(global.approute + '/router/index.js');
app.use('/api/v1/', router);

// Add Helper Libraries
const datetime = require(`${global.approute}/lib/datetime`);
app.get('/status', (req, res) => res.status(200).json(status));

// Add File System
const fs = require('fs');

let status = {}

const startup = async () => {
    try {
		// Get IP and Serial Number of device
		if (process.env.NODE_ENV === 'production') {
			var rsn = require('raspi-serial-number');
			global.nodeId = await rsn.getSerialNumber();
		} else if (process.env.NODE_ENV === 'staging') {
			var rsn = require('raspi-serial-number');
			global.nodeId = await rsn.getSerialNumber();
		} else {
			global.nodeId = "1000000000999999";
		}
		// Set Status
		status = {
			ENVIRONMENT: process.env.NODE_ENV,
			NAME: package.name,
			VERSION: package.version,
			WEB_PORT: process.env.WEB_PORT,
			REDIS_HOST: process.env.REDIS_HOST,
			REDIS_PORT: process.env.REDIS_PORT,
			MOSQUITO_HOST: process.env.MOSQUITTO_HOST,
			MOSQUITTO_PORT: process.env.MOSQUITTO_PORT,
			NODE_ID: global.nodeId
		}
	} catch (err) {
        console.error(err);
    }
	try {
		// Connect to Redis
		let redisClient = await redisConnect.connect();
		global.redisClient = redisClient;
		await require(global.approute + '/setup.js')
	}
	catch (error) {
		console.error(error)
	}
	try {
		// Connect to Mosquitto
		const mqttClient = await mosquittoConnect.connect();		
		global.mqttClient = mqttClient;
		// Subscribe to Topics
		let subscribeResult = await mosquittoConnect.subscribe('node/#');
		console.log(subscribeResult.message)
		// Launch MQTT client
		require(global.approute + '/mqtt/index.js')
	}
	catch (error) {
		console.error(error)
	}
	try {
		// Launch Meter
		require(global.approute + '/meter.js');
	}
	catch (error) {
		console.error(error)
	}
	try {
		// Launch Relay
		require(global.approute + '/relay.js');
	}
	catch (error) {
		console.error(error)
	}
	app.emit('ready');
   
}

const sendHeartbeat = async () => {
	// Get systeminfo from localhost:8086
	var systemInfo
	if (process.env.NODE_ENV === 'production') {
		systemInfo = await axios.get('http://host.docker.internal:8086/systeminfo')
	} else {
		systemInfo = await axios.get('http://localhost:8086/systeminfo')
	}
	// let systemInfo = await redisJSON.read('systemInfo')
	let heartbeat = systemInfo.data.data;
	heartbeat.version = package.version;

	// Update System Info Version
	await redisJSON.update('systemInfo', heartbeat)
	console.log(heartbeat)

	// console.log(heartbeat)
	await mosquittoConnect.publish('node/' + global.nodeId + '/heartbeat', heartbeat);
	// console.log('heartbeatResult = ' + JSON.stringify(heartbeatResult, null, 2))
}
 

app.on('ready', () => {
    // Start the server only when the app is ready
    app.listen(port, () => {
		console.log(status)
		console.log('Ready')
    });
	// Send Regular Heartbeat
	sendHeartbeat();	
	setInterval(() => {
		sendHeartbeat();
	}, 10000);
});

startup();