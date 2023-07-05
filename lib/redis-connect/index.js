// Component for connecting to Redis using the standard Redis client
// Writen by Ryan Griffiths - ryan@vindico.net - 26-Jun-2023

const { createClient } = require('redis');

// CONNECT TO REDIS
module.exports.connect = () => {
	return new Promise((resolve, reject) => {
		(async () => {
    	try {
				url = `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
				console.log (`Connecting to Redis (${url})...`);
				const client = createClient({url: url});
				await client.connect();
				if (client.isReady) {
					console.log('Redis Client Connected')
					resolve(client)
				}
			}
			catch (error) {
				console.error('#ERROR - Could not connect to Redis')
				reject(error);
			}
		})();
	});
};

// REDIS KEY EXISTS
module.exports.exists = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.exists(key);
				resolve({ status: "success", data: result, message: "Key Exists" });
			}
			catch (error) {
				reject({ status: "error", data: null, message: "ERROR - Key Not Found", stack: error });
			}
		})();
	});
}


// REDIS CREATE STRING
module.exports.createString = (key, value) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				await global.redisClient.set(key, value);
				resolve(true);
			}
			catch (error) {
				reject(error);
			}
		})();
	});
}

// REDIS READ STRING
module.exports.readString = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.get(key);
				resolve(result);
			}
			catch (error) {
				reject(error);
			}
		})();
	});
}

// REDIS UPDATE STRING
module.exports.updateString = (key, value) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				await global.redisClient.set(key, value);
				resolve(true);
			}
			catch (error) {
				reject(error);
			}
		})();
	});
}

// REDIS DELETE STRING
module.exports.deleteString = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				await global.redisClient.del(key);
				resolve(true);
			}
			catch (error) {
				reject(error);
			}
		})();
	});
}
