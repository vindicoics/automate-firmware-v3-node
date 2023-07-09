const redisJSON = require(`${global.approute}/lib/redis-json`);
const redisConnect = require(`${global.approute}/lib/redis-connect`);
const datetime = require(`${global.approute}/lib/datetime/index.js`);

console.log('Setup Started');
(async () => {
	// Create mqttService string
	let mqttServiceExistsResult = await redisConnect.exists('mqttService');
	if (mqttServiceExistsResult.data == 0) {
		process.stdout.write('Creating mqttService String...');
		try {
			await redisConnect.createString('mqttService', '1');
			process.stdout.write('SUCCESS\n');
		} catch (error) {
			process.stdout.write('ERROR\n');
			console.error(error)
		}
	}
	// Check if Relay JSON exists
	let relayExists = await redisJSON.exists('latestRelay');
	if (relayExists.data === 0) {
		process.stdout.write('Creating latestRelay...');
		try {
			// Create Blank Relay JSON
			let relay = {
				S1: 0,
				S2: 0,
				S3: 0,
				S4: 0,
				S5: 0,
				S6: 0,
				S7: 0,
				timestamp: datetime.formatDateTimeNow('valueOf')
			}
			redisJSON.create('latestRelay', relay);
			process.stdout.write('SUCCESS\n');
		} catch (error) {
			process.stdout.write('ERROR\n');
			console.error(error)
		}			
	}
	// Check if load JSON exists
	let loadExists = await redisJSON.exists('latestLoad');
	if (loadExists.data === 0) {
		process.stdout.write('Creating latestLoad...');
		try {
			// Create Blank Load JSON
			let load = {
				S1: 0,
				S2: 0,
				S3: 0,
				S4: 0,
				S5: 0,
				S6: 0,
				S7: 0,
				total: 0,
				unit: 'W',
				timestamp: datetime.formatDateTimeNow('valueOf')
			}
			redisJSON.create('latestLoad', load);
			process.stdout.write('SUCCESS\n');
		} catch (error) {
			process.stdout.write('ERROR\n');
			console.error(error)
		}			
	}
	// Check if usage JSON exists
	let usageExists = await redisJSON.exists('latestUsage');
	if (usageExists.data === 0) {
		process.stdout.write('Creating latestUsage...');
		try {
			// Create Blank Usage JSON
			let usage = {
				S1: 0,
				S2: 0,
				S3: 0,
				S4: 0,
				S5: 0,
				S6: 0,
				S7: 0,
				total: 0,
				unit: 'kWh',
				timestamp: datetime.formatDateTimeNow('valueOf')
			}
			redisJSON.create('latestUsage', usage);
			process.stdout.write('SUCCESS\n');
		} catch (error) {
			process.stdout.write('ERROR\n');
			console.error(error)
		}			
	}
})();