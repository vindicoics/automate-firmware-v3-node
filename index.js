const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

// Basic Express Server
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const port = process.env.WEB_PORT;

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
			const ip = require('ip4');
			global.ip = ip
			const hostIp = process.env.HOST_IP
			console.log(`Host IP: ${hostIp}`);

			// Get Docker Host IP
			// const dockerHostIp = require('docker-host-ip');
			// dockerHostIp( (error, result) => {
			// 	if (error) {
			// 		console.error(error);
			// 	} else {
			// 		global.ip = result;
			// 	}
			// });
			var rsn = require('raspi-serial-number');
			global.nodeId = await rsn.getSerialNumber();
		} else if (process.env.NODE_ENV === 'staging') {
			// Get Local IP
			const ip = require('ip4');
			global.ip = ip
			var rsn = require('raspi-serial-number');
			global.nodeId = await rsn.getSerialNumber();
		} else {
			// Get Local IP
			const ip = require('ip4');
			global.ip = ip
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
			IP_ADDRESS: global.ip,
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
	const namedPipeInPath = '/hostin';
	const namedPipeOutPath = '/hostout';
	const commandToSend = ' python /home/pi/automate-node/system-info.py ';

	// Sending data to the named pipe '/home/pi/hostin'
	const writableStream = await fs.createWriteStream(namedPipeInPath);
	writableStream.write(commandToSend, (err) => {
	  if (err) {
	    console.error('Error writing to the named pipe:', err);
	  }
	  writableStream.end();
	});

	// Listening for data from the named pipe '/home/pi/hostout'
	const readableStream = await fs.createReadStream(namedPipeOutPath);
	readableStream.on('data', async (data) => {
		let heartbeat = {
			version: package.version,
			ipAddress: global.ip,
			...JSON.parse(data.toString()),
			timestamp: datetime.formatDateTimeNow('valueOf'),
		}
		// console.log(heartbeat);
		await redisJSON.update('systemInfo', heartbeat);
		await mosquittoConnect.publish('node/' + global.nodeId + '/heartbeat', heartbeat);
	});
	readableStream.on('error', (err) => {
	  console.error('Error reading from the named pipe:', err);
	});
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