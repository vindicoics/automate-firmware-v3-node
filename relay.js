const { exec } = require("child_process");
const dayjs = require("dayjs")
const redisJSON = require("./lib/redis-json/index.js")
// Write to All Relays
module.exports.writeAll = (value) => {
	return new Promise((resolve, reject) => {
		try {
			exec(`8mosind 0 write ${value}`, (error, stdout, stderr) => {
				resolve({ status: "success", data: stdout, message: "Relay Write Started" });
			})
		}
		catch (error) {
			reject({ status: "error", data: null, message: "ERROR - Couldn't retrieve Relay Status", stack: error });
		}
	})
};

// write to Channel
module.exports.write = (channel, value) => {
	return new Promise((resolve, reject) => {
		try {
			(async() => {
				if (channel === "all") {
					if (process.env.NODE_ENV === 'production') {
						exec(`8mosind 0 write 1 ${value}`, () => { return });
						exec(`8mosind 0 write 2 ${value}`, () => { return });
						exec(`8mosind 0 write 3 ${value}`, () => { return });
						exec(`8mosind 0 write 4 ${value}`, () => { return });
						exec(`8mosind 0 write 5 ${value}`, () => { return });
						exec(`8mosind 0 write 6 ${value}`, () => { return });
						exec(`8mosind 0 write 7 ${value}`, () => { return });
					}
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
					await redisJSON.update('latestRelay', relay);
					resolve({ status: "success", data: null, message: `All Relays set to ${value}` });
				} else {
					if (process.env.NODE_ENV === 'production') {
						exec(`8mosind 0 write ${channel} ${value}`, async (error, stdout, stderr) => {
							if (error) console.error(`exec error: ${error}`);
							if (stderr) console.error(`stderr: ${stderr}`);
						});
					}
					let relay = { 
						[`S${channel}`]: value,
						timestamp: dayjs().valueOf()
					};
					await redisJSON.update('latestRelay', relay);
					resolve ({status: "success", data: null, message: `Relay ${channel} set to ${value}` });
				}
			})();
		}
		catch (error) {
			reject({ status: "error", data: null, message: "ERROR - Couldn't retrieve Relay Status", stack: error });
		}
	})	
};


// Read Channel
module.exports.read = (channel) => {
	return new Promise((resolve, reject) => {
		try {
			if (process.env.NODE_ENV === 'production') {
				exec(`8mosind 0 read ${channel}`, (error, stdout, stderr) => {
					if (stdout == 0) {
						resolve({ status: "success", data: "off", message: "Relay Off" });
					} else {
						resolve({ status: "success", data: "on", message: "Relay On" });
					}	
				})
			} else {
				resolve({ status: "success", data: "off", message: "Development Mode - No Relays to Read" });
			}
		}
		catch (error) {
			reject({ status: "error", data: null, message: "ERROR - Couldn't retrieve Relay Status", stack: error });
		}
	})
};

const delay = (ms) => {
	return new Promise ((resolve) => setTimeout(resolve, ms));
}



// Test All Relays
module.exports.testAll = () => {
	return new Promise((resolve, reject) => {
		try {
			(async() => {
				if (process.env.NODE_ENV === 'production') {
					exec(`8mosind 0 write 1 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 2 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 3 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 4 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 5 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 6 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 7 1`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 1 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 2 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 3 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 4 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 5 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 6 0`, () => { return; });
					await delay(2000);
					exec(`8mosind 0 write 7 0`, () => { return; });
					resolve({ status: "success", data: null, message: "Relay Test Completed" });
				} else {
					resolve({ status: "success", data: null, message: "Development Mode - No Relays to Test" });
				}
			})();
		}
		catch (error) {
			reject({ status: "error", data: null, message: "ERROR - Couldn't retrieve Relay Status", stack: error });
		}
	})
}
