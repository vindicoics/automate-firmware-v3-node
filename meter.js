const redisConnect = require(`${global.approute}/lib/redis-connect`);
const redisJSON = require(`${global.approute}/lib/redis-json`);
const datetime = require(`${global.approute}/lib/datetime`);
// Require Serial Port
const { SerialPort } = require('serialport');
// Require MQTT
const mosquittoConnect = require(global.approute + '/lib/mosquitto-connect/index.js');

(async () => {
	try {
		let latestPowerSum = {};
		let latestLoad = {};

		// Sum of all powers
		// Get the latest powerSum from Redis
		let latestPowerSumResult = await redisJSON.read('latestPowerSum');
		if (latestPowerSumResult.status === 'success') {
			latestPowerSum = latestPowerSumResult.data;
			powerSum1 = latestPowerSum.S1;
			powerSum2 = latestPowerSum.S2;
			powerSum3 = latestPowerSum.S3;
			powerSum4 = latestPowerSum.S4;
			powerSum5 = latestPowerSum.S5;
			powerSum6 = latestPowerSum.S6;
			powerSum7 = latestPowerSum.S7;
		} else {
			powerSum1 = 0;
			powerSum2 = 0;
			powerSum3 = 0;
			powerSum4 = 0;
			powerSum5 = 0;
			powerSum6 = 0;
			powerSum7 = 0;
		}

		// Get the latest load from Redis
		let latestLoadResult = await redisJSON.read('latestLoad');
		if (latestLoadResult.status === 'success') {
			latestLoad = latestLoadResult.data;
			prevPower1 = latestLoad.S1;
			prevPower2 = latestLoad.S2;
			prevPower3 = latestLoad.S3;
			prevPower4 = latestLoad.S4;
			prevPower5 = latestLoad.S5;
			prevPower6 = latestLoad.S6;
			prevPower7 = latestLoad.S7;
		} else {
			prevPower1 = 0;
			prevPower2 = 0;
			prevPower3 = 0;
			prevPower4 = 0;
			prevPower5 = 0;
			prevPower6 = 0;
			prevPower7 = 0;
		}

		let usage = {};
		let load = {};
		let now = datetime.formatDateTimeNow('valueOf')		

		// Poling Interval is 2 seconds
		const timeDuration = 2 / 3600;
		if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
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
				let reset = await redisConnect.exists('reset');
				if (reset.data == 1) {
					// Reset the powerSum
					powerSum1 = 0;
					powerSum2 = 0;
					powerSum3 = 0;
					powerSum4 = 0;
					powerSum5 = 0;
					powerSum6 = 0;
					powerSum7 = 0;
					// Reset the load
					prevPower1 = 0;
					prevPower2 = 0;
					prevPower3 = 0;
					prevPower4 = 0;
					prevPower5 = 0;
					prevPower6 = 0;
					prevPower7 = 0;
					// Reset the reset flag
					await redisConnect.deleteString('reset');
				}
				
				now = datetime.formatDateTimeNow('valueOf')
				// Create an array of the data
				const Z = line.split(' ');
				const ignoreValue = 10; // Changed from 2 to 10
				load = {
					S1: Math.abs(Z[1]) > ignoreValue ? Math.abs(Z[1]) : 0,
					S2: Math.abs(Z[2]) > ignoreValue ? Math.abs(Z[2]) : 0,
					S3: Math.abs(Z[3]) > ignoreValue ? Math.abs(Z[3]) : 0,
					S4: Math.abs(Z[4]) > ignoreValue ? Math.abs(Z[4]) : 0,
					S5: Math.abs(Z[5]) > ignoreValue ? Math.abs(Z[5]) : 0,
					S6: Math.abs(Z[6]) > ignoreValue ? Math.abs(Z[6]) : 0,
					S7: Math.abs(Z[7]) > ignoreValue ? Math.abs(Z[7]) : 0,
					total: 0,
					unit: 'W',
					timestamp: now
				}
				load.total = parseFloat(load.S1) + parseFloat(load.S2) + parseFloat(load.S3) + parseFloat(load.S4) + parseFloat(load.S5) + parseFloat(load.S6) + parseFloat(load.S7);

				// Building the sum of powers
				powerSum1 += prevPower1 + load.S1;
				powerSum2 += prevPower2 + load.S2;
				powerSum3 += prevPower3 + load.S3;
				powerSum4 += prevPower4 + load.S4;
				powerSum5 += prevPower5 + load.S5;
				powerSum6 += prevPower6 + load.S6;
				powerSum7 += prevPower7 + load.S7;

				let powerSum = {
					S1: powerSum1,
					S2: powerSum2,
					S3: powerSum3,
					S4: powerSum4,
					S5: powerSum5,
					S6: powerSum6,
					S7: powerSum7,
					total: 0,
					unit: 'W',
					timestamp: now
				}
				powerSum.total = parseFloat(powerSum.S1) + parseFloat(powerSum.S2) + parseFloat(powerSum.S3) + parseFloat(powerSum.S4) + parseFloat(powerSum.S5) + parseFloat(powerSum.S6) + parseFloat(powerSum.S7);

				// Save the new Power Reading as the previous for next loop run
				prevPower1 = load.S1;
				prevPower2 = load.S2;
				prevPower3 = load.S3;
				prevPower4 = load.S4;
				prevPower5 = load.S5;
				prevPower6 = load.S6;
				prevPower7 = load.S7;
				
				// Calculate the energy usage
				usage = {
					S1: (timeDuration / 2 * powerSum1) / 1000, // in kWh,
					S2: (timeDuration / 2 * powerSum2) / 1000, // in kWh,
					S3: (timeDuration / 2 * powerSum3) / 1000, // in kWh,
					S4: (timeDuration / 2 * powerSum4) / 1000, // in kWh,
					S5: (timeDuration / 2 * powerSum5) / 1000, // in kWh,
					S6: (timeDuration / 2 * powerSum6) / 1000, // in kWh,
					S7: (timeDuration / 2 * powerSum7) / 1000, // in kWh,
					total: 0,
					unit: 'kWh',
					timestamp: now
				}
				usage.total = parseFloat(usage.S1) + parseFloat(usage.S2) + parseFloat(usage.S3) + parseFloat(usage.S4) + parseFloat(usage.S5) + parseFloat(usage.S6) + parseFloat(usage.S7);

				// update redis with load and usage and powersum
				await redisJSON.update('latestLoad', load);
				await redisJSON.update('latestUsage', usage);
				await redisJSON.update('latestPowerSum', powerSum);

				// get all relay straings from redis
				let S1 = await redisConnect.readString('S1');
				let S2 = await redisConnect.readString('S2');
				let S3 = await redisConnect.readString('S3');
				let S4 = await redisConnect.readString('S4');
				let S5 = await redisConnect.readString('S5');
				let S6 = await redisConnect.readString('S6');
				let S7 = await redisConnect.readString('S7');

				let relay = {
					S1: parseInt(S1),
					S2: parseInt(S2),
					S3: parseInt(S3),
					S4: parseInt(S4),
					S5: parseInt(S5),
					S6: parseInt(S6),
					S7: parseInt(S7),
					timestamp: now
				}
				// console.log(relay)

				delete load.timestamp;
				delete usage.timestamp;
				delete powerSum.timestamp;
				delete relay.timestamp;
				let payload = {}
				payload.load = load;
				payload.usage = usage;
				payload.powerSum = powerSum;
				payload.relay = relay;
				payload.timestamp = now;
				// Send to Automate Controller (MQTT Server)
				mosquittoConnect.publish(`node/${global.nodeId}/data/`, payload);
			});
		} else {
			// Run with test data
			setInterval(async () => {
				let reset = await redisConnect.exists('reset');
				if (reset.data == 1) {
					// Reset the powerSum
					powerSum1 = 0;
					powerSum2 = 0;
					powerSum3 = 0;
					powerSum4 = 0;
					powerSum5 = 0;
					powerSum6 = 0;
					powerSum7 = 0;
					// Reset the load
					prevPower1 = 0;
					prevPower2 = 0;
					prevPower3 = 0;
					prevPower4 = 0;
					prevPower5 = 0;
					prevPower6 = 0;
					prevPower7 = 0;
					// Reset the reset flag
					await redisConnect.deleteString('reset');
				}
				
				now = datetime.formatDateTimeNow('valueOf')
				load = {
					S1: 1000,
					S2: 1000,
					S3: 1000,
					S4: 1000,
					S5: 1000,
					S6: 1000,
					S7: 1000,
					total: 1000*7,
					unit: 'W',
					timestamp: now
				}
				load.total = parseFloat(load.S1) + parseFloat(load.S2) + parseFloat(load.S3) + parseFloat(load.S4) + parseFloat(load.S5) + parseFloat(load.S6) + parseFloat(load.S7);
				
				// Building the sum of powers		
				powerSum1 += prevPower1 + load.S1;
				powerSum2 += prevPower2 + load.S2;
				powerSum3 += prevPower3 + load.S3;
				powerSum4 += prevPower4 + load.S4;
				powerSum5 += prevPower5 + load.S5;
				powerSum6 += prevPower6 + load.S6;
				powerSum7 += prevPower7 + load.S7;
				
				let powerSum = {
					S1: powerSum1,
					S2: powerSum2,
					S3: powerSum3,
					S4: powerSum4,
					S5: powerSum5,
					S6: powerSum6,
					S7: powerSum7,
					total: 0,
					unit: 'W',
					timestamp: now
				}
				powerSum.total = parseFloat(powerSum.S1) + parseFloat(powerSum.S2) + parseFloat(powerSum.S3) + parseFloat(powerSum.S4) + parseFloat(powerSum.S5) + parseFloat(powerSum.S6) + parseFloat(powerSum.S7);
				
				// Save the new Power Reading as the previous for next loop run
				prevPower1 = load.S1;
				prevPower2 = load.S2;
				prevPower3 = load.S3;
				prevPower4 = load.S4;
				prevPower5 = load.S5;
				prevPower6 = load.S6;
				prevPower7 = load.S7;
				
				// Calculate the energy usage
				usage = {
					S1: (timeDuration / 2 * powerSum1) / 1000, // in kWh,
					S2: (timeDuration / 2 * powerSum2) / 1000, // in kWh,
					S3: (timeDuration / 2 * powerSum3) / 1000, // in kWh,
					S4: (timeDuration / 2 * powerSum4) / 1000, // in kWh,
					S5: (timeDuration / 2 * powerSum5) / 1000, // in kWh,
					S6: (timeDuration / 2 * powerSum6) / 1000, // in kWh,
					S7: (timeDuration / 2 * powerSum7) / 1000, // in kWh,
					total: 0,
					unit: 'kWh',
					timestamp: now
				}
				usage.total = parseFloat(usage.S1) + parseFloat(usage.S2) + parseFloat(usage.S3) + parseFloat(usage.S4) + parseFloat(usage.S5) + parseFloat(usage.S6) + parseFloat(usage.S7);
				
				// update redis with load and usage and powersum
				await redisJSON.update('latestLoad', load);
				await redisJSON.update('latestUsage', usage);
				await redisJSON.update('latestPowerSum', powerSum);
				
				// get all relay straings from redis
				let S1 = await redisConnect.readString('S1');
				let S2 = await redisConnect.readString('S2');
				let S3 = await redisConnect.readString('S3');
				let S4 = await redisConnect.readString('S4');
				let S5 = await redisConnect.readString('S5');
				let S6 = await redisConnect.readString('S6');
				let S7 = await redisConnect.readString('S7');

				let relay = {
					S1: parseInt(S1),
					S2: parseInt(S2),
					S3: parseInt(S3),
					S4: parseInt(S4),
					S5: parseInt(S5),
					S6: parseInt(S6),
					S7: parseInt(S7),
					timestamp: now
				}
				// console.log(relay)

				delete load.timestamp;
				delete usage.timestamp;
				delete powerSum.timestamp;
				delete relay.timestamp;
				let payload = {}
				payload.load = load;
				payload.usage = usage;
				payload.powerSum = powerSum;
				payload.relay = relay;
				payload.timestamp = now;
				// Send to Automate Controller (MQTT Server)
				mosquittoConnect.publish(`node/${global.nodeId}/data/`, payload);
			}, 2000);
		}	
	} catch (error) {
		console.error(error);
	}
})();

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
	process.on('SIGINT', function () {
  		port.close(function () {
    		console.log('Serial port closed');
    		process.exit();
  		});
	});
}