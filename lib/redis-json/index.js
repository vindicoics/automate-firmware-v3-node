// Component for Redis Timeseries
// Writen by Ryan Griffiths - ryan@vindico.net - 26-Jun-2023

// CREATE NEW JSON DOCUMENT
module.exports.create = (key, document) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (document === undefined) throw new Error("ERROR - Document Not Provided");			
				const result = await global.redisClient.json.set(key, '$', document);
				resolve({ status: "success", data: result, message: "Document Added" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Document Not Added", stack: error });
			}
		})();
	});
};

// READ JSON DOCUMENT
module.exports.read = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				const result = await global.redisClient.json.get(key);
				if (result === null) throw new Error("ERROR - Document Not Found");
				resolve({ status: "success", data: result, message: "Document Retrieved" });
			} catch (error) {
				reject({ status: "error", data: null, message: "ERROR - Document Not Retrieved", stack: error });
			}
		})();
	});
}

// UPDATE JSON DOCUMENT
module.exports.update = (key, fields) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				var result
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (fields === undefined) throw new Error("ERROR - Fields Not Provided");	
				const document = await global.redisClient.json.get(key);
				if (document === null) {
					result = await global.redisClient.json.set(key, '$', fields);
				} else {
					for (const field in fields) {
						document[field] = fields[field];
					}		
					result = await global.redisClient.json.set(key, '$', document);
				}	
				resolve({ status: "success", data: result, message: "Document Updated" });
			} catch (error) {
				console.error(error)
				reject({ status: "error", data: null, message: "ERROR - Document Not Updated", stack: error });
			}
		})();
	});
};

// DELETE JSON DOCUMENT
module.exports.delete = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				const result = await global.redisClient.del(key);
				if (result === 0) throw new Error("ERROR - Document Not Found");
				resolve({ status: "success", data: result, message: "Document Deleted" });
			} catch (error) {
				reject({ status: "error", data: null, message: "ERROR - Document Not Deleted", stack: error });
			}
		})();
	});
}

// EXPIRE JSON DOCUMENT
module.exports.expire = (key, seconds) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				if (seconds === undefined) throw new Error("ERROR - Seconds Not Provided");	
				const result = await global.redisClient.expire(key, seconds);
				if (result === 0) throw new Error("ERROR - Document Not Found");
				resolve({ status: "success", data: result, message: "Document Expired" });
			} catch (error) {
				reject({ status: "error", data: null, message: "ERROR - Document Not Expired", stack: error });
			}
		})();
	});
}

// CHECK JSON KEY EXISTS
module.exports.exists = (key) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				if (key === undefined) throw new Error("ERROR - Key Not Provided");
				const result = await global.redisClient.exists(key);
				resolve({ status: "success", data: result, message: "Key Exists" });
			} catch (error) {
				reject({ status: "error", data: null, message: "ERROR - Key Not Found", stack: error });
			}
		})();
	});
}