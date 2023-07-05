const redisJSON = require(`${global.approute}/lib/redis-json`);
const datetime = require(`${global.approute}/lib/datetime`);
// Require Serial Port
const { SerialPort } = require('serialport');
// Require MQTT
const mosquittoConnect = require(global.approute + '/lib/mosquitto-connect/index.js');


(async () => {
	try {
		let usage = {};
		let load = {};
		let now = datetime.formatDateTimeNow('valueOf')
		// Set Checking Interval to every half second
		let interval = 0.5 / 3600
		// Set initial powerSum			
		let powerSum = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0, }
		// Set initial prevPower
		let prevPower = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0, S7: 0, }

		// TODO - Should we be getting this from database so it increments every time

		if (process.env.NODE_ENV === 'production') {
			// Connect to Serial Port
			const port = new SerialPort({
				path: '/dev/ttyAMA0',
				baudRate: 38400,
				//parser: new Readline({ delimiter: '\r\n' }),
 			});
			// Read Line Parser
			const { ReadlineParser } = require('@serialport/parser-readline');
			const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
			// Read Data
			parser.on('data', async (line) => {
				now = datetime.formatDateTimeNow('valueOf')
				// console.info('interval ' + interval)
				// Create an array of the data
				const Z = line.split(' ');
				load = {
					S1: Math.abs(Z[1]) > 2 ? Math.abs(Z[1]) : 0,
					S2: Math.abs(Z[2]) > 2 ? Math.abs(Z[2]) : 0,
					S3: Math.abs(Z[3]) > 2 ? Math.abs(Z[3]) : 0,
					S4: Math.abs(Z[4]) > 2 ? Math.abs(Z[4]) : 0,
					S5: Math.abs(Z[5]) > 2 ? Math.abs(Z[5]) : 0,
					S6: Math.abs(Z[6]) > 2 ? Math.abs(Z[6]) : 0,
					S7: Math.abs(Z[7]) > 2 ? Math.abs(Z[7]) : 0,
					total: 0,
					unit: 'W',
					timestamp: now
				}
				load.total = parseFloat(load.S1) + parseFloat(load.S2) + parseFloat(load.S3) + parseFloat(load.S4) + parseFloat(load.S5) + parseFloat(load.S6) + parseFloat(load.S7),
				// console.log(load)
				// Calculate energy
				powerSum.S1 += prevPower.S1 + load.S1;
				powerSum.S2 += prevPower.S2 + load.S2;
				powerSum.S3 += prevPower.S3 + load.S3;
				powerSum.S4 += prevPower.S4 + load.S4;
				powerSum.S5 += prevPower.S5 + load.S5;
				powerSum.S6 += prevPower.S6 + load.S6;
				powerSum.S7 += prevPower.S7 + load.S7;
				// Set prevPower
				prevPower.S1 = load.S1;
				prevPower.S2 = load.S2;
				prevPower.S3 = load.S3;
				prevPower.S4 = load.S4;
				prevPower.S5 = load.S5;
				prevPower.S6 = load.S6;
				prevPower.S7 = load.S7;
				// Calculate usage
				usage = {
					S1: (interval / 2) * powerSum.S1 / 1000,
					S2: (interval / 2) * powerSum.S2 / 1000,
					S3: (interval / 2) * powerSum.S3 / 1000,
					S4: (interval / 2) * powerSum.S4 / 1000,
					S5: (interval / 2) * powerSum.S5 / 1000,
					S6: (interval / 2) * powerSum.S6 / 1000,
					S7: (interval / 2) * powerSum.S7 / 1000,
					total: 0,
					unit: 'kWh',
					timestamp: now
				}
				usage.total = parseFloat(usage.S1) + parseFloat(usage.S2) + parseFloat(usage.S3) + parseFloat(usage.S4) + parseFloat(usage.S5) + parseFloat(usage.S6) + parseFloat(usage.S7),
				// console.log(usage)
				// update redis with load and usage
				await redisJSON.update('latestLoad', load);
				await redisJSON.update('latestUsage', usage);
				// TODO - Send to MQTT
			});
		} else if (process.env.NODE_ENV === 'development') {
			setInterval(async () => {
				now = datetime.formatDateTimeNow('valueOf')
				load = {
					// Generate random number that is between 1000 and 1500 for S1-S7
					S1: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S2: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S3: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S4: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S5: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S6: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					S7: Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000,
					total: 0,
					unit: 'W',
					timestamp: now
				}
				load.total = parseFloat(load.S1) + parseFloat(load.S2) + parseFloat(load.S3) + parseFloat(load.S4) + parseFloat(load.S5) + parseFloat(load.S6) + parseFloat(load.S7),
				// console.log(load)
				// Calculate energy
				powerSum.S1 += prevPower.S1 + load.S1;
				powerSum.S2 += prevPower.S2 + load.S2;
				powerSum.S3 += prevPower.S3 + load.S3;
				powerSum.S4 += prevPower.S4 + load.S4;
				powerSum.S5 += prevPower.S5 + load.S5;
				powerSum.S6 += prevPower.S6 + load.S6;
				powerSum.S7 += prevPower.S7 + load.S7;
				// Set prevPower
				prevPower.S1 = load.S1;
				prevPower.S2 = load.S2;
				prevPower.S3 = load.S3;
				prevPower.S4 = load.S4;
				prevPower.S5 = load.S5;
				prevPower.S6 = load.S6;
				prevPower.S7 = load.S7;
				// Calculate usage
				usage = {
					S1: (interval / 2) * powerSum.S1 / 1000,
					S2: (interval / 2) * powerSum.S2 / 1000,
					S3: (interval / 2) * powerSum.S3 / 1000,
					S4: (interval / 2) * powerSum.S4 / 1000,
					S5: (interval / 2) * powerSum.S5 / 1000,
					S6: (interval / 2) * powerSum.S6 / 1000,
					S7: (interval / 2) * powerSum.S7 / 1000,
					total: 0,
					unit: 'kWh',
					timestamp: now
				}
				usage.total = parseFloat(usage.S1) + parseFloat(usage.S2) + parseFloat(usage.S3) + parseFloat(usage.S4) + parseFloat(usage.S5) + parseFloat(usage.S6) + parseFloat(usage.S7),
				// console.log(usage)
				// update redis with load and usage
				await redisJSON.update('latestLoad', load);
				await redisJSON.update('latestUsage', usage);
				let latestRelay = await redisJSON.read('latestRelay');
				let relay = latestRelay.data;
				delete load.timestamp;
				delete usage.timestamp;
				let payload = {}
				payload.load = load;
				payload.usage = usage;
				delete relay.timestamp;
				payload.relay = relay;
				payload.timestamp = now;
				// console.log(payload)
				// Send to Automate Controller (MQTT Server)
				mosquittoConnect.publish(`node/${global.nodeId}/data/`, payload);
			}, 500);
		}		
		// Write to Redis
		//  if (value > 5) {
			// console.table(load)
			// await client.ts.add('load', now, value);
		//   }

		// await redis.updateHash('load', load);
		// await redis.updateHash('usage', usage);
	} catch (error) {
		console.error(error);
	}
})();

if (process.env.NODE_ENV === 'production') {
	process.on('SIGINT', function () {
  		port.close(function () {
    		console.log('Serial port closed');
    		process.exit();
  		});
	});
}