const router = require("express").Router();
const redisJSON = require(`${global.approute}/lib/redis-json`);
const redisConnect = require(`${global.approute}/lib/redis-connect`);
const datetime = require(`${global.approute}/lib/datetime`);
const relay = require(`${global.approute}/relay.js`);
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/", (req, res) => {
	console.log('apppath = ' + apppath)
    res.sendFile(apppath + 'index.html', { root: __dirname })
});

router.get("/write/:channel/:value", async (req, res) => {
	try {
		const { channel, value } = req.params;
		let writeResult = await relay.write(channel, value)
		return res.status(200).json(writeResult);
	} catch (error) {
		return res.status(500).json(error);
	}	
});

router.get("/write/all/:value", async (req, res) => {
	try {
		const { value } = req.params;
		let writeAllResult = await relay.writeAll(value)
		return res.status(200).json(writeAllResult);
	} catch (error) {
		return res.status(500).json(error);
	}	
});

router.get("/read/:channel", async (req, res) => {
	try {
		const { channel } = req.params;
		let readResult = await relay.read(channel)
		return res.status(200).json(readResult);
	}
	catch (error) {
		return res.status(500).json(error);
	}
});

router.get("/load/", async (req, res) => {
	try {
		let readResult = await redisJSON.read('latestLoad');
		return res.status(200).json({ success: true, data: readResult });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});

router.get("/usage/", async (req, res) => {
	try {
		let readResult = await redisJSON.read('latestUsage');
		return res.status(200).json({ success: true, data: readResult });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});

// reset flag
router.post("/reset/", async (req, res) => {
	try {
		await redisConnect.createString('reset', '1');
		return res.status(200).json({ success: true });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});

// update usage
router.post("/usage/", async (req, res) => {
	try {
		let usage = req.body;
		await redisJSON.update('latestUsage', usage);
		return res.status(200).json({ success: true, data: usage });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});
// update powerSum
router.post("/powersum/", async (req, res) => {
	try {
		let powersum = req.body;
		await redisJSON.update('latestPowerSum', powersum);
		return res.status(200).json({ success: true, data: powersum });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});
// update load
router.post("/load/", async (req, res) => {
	try {
		let load = req.body;
		await redisJSON.update('latestLoad', load);
		return res.status(200).json({ success: true, data: load });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});

router.get("/mqttservice/", async (req, res) => {
	try {
		let readResult = await redisConnect.readString('mqttService');
		return res.status(200).json({ success: true, data: readResult });
	}
	catch (error) {
		return res.status(500).json({ success: false, error: error });
	}
});

router.get("/relay/", async (req, res) => {
	try {
		let readResult = await redisJSON.read('latestRelay');
		return res.status(200).json({ success: true, data: readResult });
	}
	catch (error) {
		return res.status(500).json(error);
	}
});

router.get("/test", async (req, res) => {
	try {
		let testResult = await relay.testAll();
		return res.status(200).json(testResult);
	} catch (error) {
		return res.status(500).json(error);
	}
});

module.exports = router;