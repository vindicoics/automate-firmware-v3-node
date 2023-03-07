const { createClient } = require('redis');
const client = createClient();

// CONNECT TO REDIS
const connect = async () => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				await client.connect();
				// client.on('error', err => console.log('Redis Client Error', err));
				if (client.isReady) {
					console.log('Redis Client Connected')
					resolve(client)
				}
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

// CREATE HASH
const createHash = (key, hash) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.HSET(key, hash);
				resolve(result)
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

// READ HASH
const readHash = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.HGETALL(key);
				resolve(result)
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

// UPDATE HASH
const updateHash = (key, hash) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.HSET(key, hash);
				resolve(result)
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

// DELETE HASH
const deleteHash = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.DEL(key);
				resolve(result)
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

// EXPIRE HASH
const expireHash = (key, seconds) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				let result = await global.redisClient.EXPIRE(key, seconds);
				resolve(result)
			}
			catch (error) {
				console.error(error);
				reject(error);
			}
		})();
	})
}

 


module.exports = {
	connect,
	createHash,
	readHash,
	updateHash,
	deleteHash,
	expireHash
}


