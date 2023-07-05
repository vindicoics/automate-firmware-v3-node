// Convert to Title Case
module.exports.toTitleCase = (str) => {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

module.exports.generateId = () => {
	const characters = "O123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let id = "O";
	for (let i = 0; i < 25; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		id += characters.charAt(randomIndex);
	}
	return id;
}