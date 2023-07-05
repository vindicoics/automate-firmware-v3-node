// Component for Redis Sets
// Writen by Ryan Griffiths - ryan@vindico.net - 26-Jun-2023
// Version 0.0.2

// ADD TO SORTED SET
module.exports.add = (key, score, value) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (score === undefined) throw new Error("ERROR - Score Not Provided");			
				if (value === undefined) throw new Error("ERROR - Document Not Provided");
				const result = await global.redisClient.ZADD(key, [{score, value}]);
				resolve({ status: "success", data: result, message: "Added to Set" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Not Added to Set", stack: error });
			}
		})();
	});
};

// ADD TO SET
module.exports.addToSet = (key, value) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (value === undefined) throw new Error("ERROR - Document Not Provided");
				const result = await global.redisClient.SADD(key, value);
				resolve({ status: "success", data: result, message: "Added to Set" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Not Added to Set", stack: error });
			}
		})();
	});
};

// REMOVE FROM SET
module.exports.removeFromSet = (key, value) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (value === undefined) throw new Error("ERROR - Value Not Provided");
				const result = await global.redisClient.SREM(key, value);
				resolve({ status: "success", data: result, message: "Removed from Set" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Not Removed from Set", stack: error });
			}
		})();
	});
};

// READ FROM SET
module.exports.readSet = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				const result = await global.redisClient.SMEMBERS(key);
				resolve({ status: "success", data: result, message: "Read from Set" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Not Read from Set", stack: error });
			}
		})();
	});
}