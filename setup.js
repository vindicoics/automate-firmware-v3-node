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
	let powerSumExists = await redisJSON.exists('latestPowerSum');
	if (powerSumExists.data === 0) {
		process.stdout.write('Creating latestPowerSum...');
		try {
			// Create Blank Load JSON
			let powerSum = {
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
			redisJSON.create('latestPowerSum', powerSum);
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
	// Check if usage JSON exists
	let systemInfoExists = await redisJSON.exists('systemInfo');
	if (systemInfoExists.data === 0) {
		process.stdout.write('Creating systemInfo...');
		try {
			// Create Blank systemInfo JSON
			let systemInfo = {
				version: "",
				ipAddress: "",
				serial_number: "",
				total_memory: 0,
				available_memory: 0,
				used_memory: 0,
				free_memory: 0,
				memory_percent: 0,
				memory_unit: "",
				total_disk: 0,
				used_disk: 0,
				free_disk: 0,
				disk_percent: 0,
				disk_unit: "",
				cpu_percent: 0,
				cpu_unit: "",
				ip_address: "",
				mac_address: "",
				timestamp: 0
			}
			redisJSON.create('systemInfo', systemInfo);
			process.stdout.write('SUCCESS\n');
		} catch (error) {
			process.stdout.write('ERROR\n');
			console.error(error)
		}			
	}	
})();