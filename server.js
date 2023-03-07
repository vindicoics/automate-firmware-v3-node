const { exec } = require("child_process");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const dayjs = require('dayjs');
const express = require("express");
const app = express();
const cors = require("cors");

const { version } = require('./package.json');
console.log('Server Version V' + version);

global.approute = __dirname;
global.dayjs = dayjs;
console.log('global.approute ' + global.approute);

const redis = require(`${global.approute}/functions/redis.js`)


const port = new SerialPort({
	path: '/dev/ttyAMA0',
	baudRate: 38400,
	//parser: new Readline({ delimiter: '\r\n' }),
  });


(async() => {
	try {
		let client = await redis.connect();
		global.redisClient = client;

		let interval = 0.5 / 3600
		
		let powerSum = {
			S1: 0,
			S2: 0,
			S3: 0,
			S4: 0,
			S5: 0,
			S6: 0,
			S7: 0,
		}

		let prevPower = {
			S1: 0,
			S2: 0,
			S3: 0,
			S4: 0,
			S5: 0,
			S6: 0,
			S7: 0,
		}

		const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
		parser.on('data', async (line) => {
			console.info('interval ' + interval)
			// Create an array of the data
			const Z = line.split(' ');
			let now = dayjs().valueOf();
			let load = {
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
			console.log(load)

			// Calculate energy
			powerSum.S1 += prevPower.S1 + load.S1;
			powerSum.S2 += prevPower.S2 + load.S2;
			powerSum.S3 += prevPower.S3 + load.S3;
			powerSum.S4 += prevPower.S4 + load.S4;
			powerSum.S5 += prevPower.S5 + load.S5;
			powerSum.S6 += prevPower.S6 + load.S6;
			powerSum.S7 += prevPower.S7 + load.S7;
 	
			prevPower.S1 = load.S1;
			prevPower.S2 = load.S2;
			prevPower.S3 = load.S3;
			prevPower.S4 = load.S4;
			prevPower.S5 = load.S5;
			prevPower.S6 = load.S6;
			prevPower.S7 = load.S7;
			
			let usage = {
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
			console.log(usage)
			await redis.updateHash('load', load);
			await redis.updateHash('usage', usage);
		
			//  if (value > 5) {
		//    console.table(load)
		   //   await client.ts.add('load', now, value);
		//   }
		});
		
	} catch (error) {
		console.error(error);
	}
})();

// const redis = require(`${global.approute}/functions/redis.js`).connect();

console.log('v 1.2')

app.use(cors());
console.log('use cors')

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.get("/write/:channel/:value", (req, res) => {
	console.log('write ' + req.params.channel + ' ' + req.params.value)
	const { channel, value } = req.params;
	if (channel === "all") {
		exec(`8mosind 0 write 1 ${value}`, () => { return });
		exec(`8mosind 0 write 2 ${value}`, () => { return });
		exec(`8mosind 0 write 3 ${value}`, () => { return });
		exec(`8mosind 0 write 4 ${value}`, () => { return });
		exec(`8mosind 0 write 5 ${value}`, () => { return });
		exec(`8mosind 0 write 6 ${value}`, () => { return });
		exec(`8mosind 0 write 7 ${value}`, () => { return });
		let relay = { 
			[`S1`]: value,
			[`S2`]: value,
			[`S3`]: value,
			[`S4`]: value,
			[`S5`]: value,
			[`S6`]: value,
			[`S7`]: value,
			timestamp: dayjs().valueOf()
		};
		redis.updateHash('relay', relay);
		return res.send("All channels set to " + value + "");
	} else {
		exec(`8mosind 0 write ${channel} ${value}`, (error, stdout, stderr) => {
			let relay = { 
				[`S${channel}`]: value,
				timestamp: dayjs().valueOf()
			};
			redis.updateHash('relay', relay);
			if (error) console.error(`exec error: ${error}`);
			if (stderr) console.error(`stderr: ${stderr}`);
			return res.send(`${stdout}`);
		});
	}
});

app.get("/write/all/:value", (req, res) => {
	const { value } = req.params;
	exec(`8mosind 0 write ${value}`, (error, stdout, stderr) => {
		return res.send(`${stdout}`);
	});
});

app.get("/read/:channel", (req, res) => {
	const { channel } = req.params;
	exec(`8mosind 0 read ${channel}`, (error, stdout, stderr) => {
		if (stdout == 0) {
			return res.send("off");
		} else {
			return res.send("on");
		}
	});
});

app.get("/load/", async (req, res) => {
	let readResult = await redis.readHash('load');
	return res.status(200).json({ success: true, data: readResult });
});

app.get("/usage/", async (req, res) => {
	let readResult = await redis.readHash('usage');
	return res.status(200).json({ success: true, data: readResult });
});

app.get("/relay/", async (req, res) => {
	let readResult = await redis.readHash('relay');
	return res.status(200).json({ success: true, data: readResult });
});

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get("/test", async (req, res) => {
	exec(`8mosind 0 write 1 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 2 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 3 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 4 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 5 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 6 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 7 1`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 1 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 2 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 3 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 4 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 5 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 6 0`, () => {
		return;
	});
	await delay(2000);
	exec(`8mosind 0 write 7 0`, () => {
		return;
	});
});

app.listen(3000, () => {
	console.log("Server listening on port 3000");
});




process.on('SIGINT', function () {
  port.close(function () {
    console.log('Serial port closed');
    process.exit();
  });
});
