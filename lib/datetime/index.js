// Component for Date Time Functions
// Writen by Ryan Griffiths - ryan@vindico.net - 27-May-2023

// * DayJS 
const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')
var isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)
dayjs.extend(utc)

// FORMAT DATE TIME NOW
module.exports.formatDateTimeNow = (formatOut) => {
	switch (formatOut) {
		case "toISOString":
			return dayjs().utc().toISOString();
		case "toJSON":
			return dayjs().utc().toJSON();
		case "toObject":
			return dayjs().utc().toObject();
		case "toArray":
			return dayjs().utc().toArray();
		case "unix":
			return dayjs().utc().unix();
		case "valueOf":
			return dayjs().utc().valueOf();
		default:
			return dayjs().utc().format(formatOut);
	}
};

// FORMAT DATE TIME
module.exports.formatDateTime = (date, formatIn, formatOut) => {
	if (date !== "" && date !== null && date !== undefined && date != 0) {
		switch (formatIn) {
			case 'ISOString':
				date = dayjs(date).utc(); 
				break;			
			case 'unix': 
				date = dayjs.unix(date).utc();
				break;
			default: 
				date = dayjs(date, formatIn).utc();
		}
		switch (formatOut) {
			case "toISOString":
				return dayjs(date).utc().toISOString();
			case "toJSON":
				return dayjs(date).utc().toJSON();
			case "toObject":
				return dayjs(date).utc().toObject();
			case "toArray":
				return dayjs(date).utc().toArray();
			case "unix":
				return dayjs(date).utc().unix();
			case "valueOf":
				return dayjs(date).utc().valueOf();
			default:
				return dayjs(date).utc().format(formatOut);
		}
	} else {
		return "";
	}
};

// ADD HOUR MINUTES SECONDS TO DATE TIME
module.exports.addTimeAndFormatDateTime = (data, formatIn, formatOut, hours, minutes, seconds) => {
	if (data !== "" && data !== null && data !== undefined && data != 0) {
		let date = dayjs(data, formatIn).utc();
		date = date.add(hours, "hour");
		date = date.add(minutes, "minute");
		date = date.add(seconds, "second");
		switch (formatOut) {
			case "toISOString":
				return dayjs(date, formatIn).utc().toISOString();
			case "toJSON":
				return dayjs(date, formatIn).utc().toJSON();
			case "toObject":
				return dayjs(date, formatIn).utc().toObject();
			case "toArray":
				return dayjs(date, formatIn).utc().toArray();
			case "unix":
				return dayjs(date, formatIn).utc().unix();
			case "valueOf":
				return dayjs(date, formatIn).utc().valueOf();
			default:
				return dayjs(date, formatIn).utc().format(formatOut);
		}
	} else {
		return "";
	}
};

// START OF
module.exports.startOf = (date, formatIn, formatOut, unit) => {
	if (date === "" || date === null || date !== undefined) date = dayjs().utc();
	switch (formatIn) {
		case 'ISOString':
			date = dayjs(date).utc(); 
			break;			
		case 'unix': 
			date = dayjs.unix(date).utc();
			break;
		default: 
			date = dayjs(date, formatIn).utc();
	}
	switch (formatOut) {
		case "toISOString":
			return dayjs(date).utc().startOf(unit).toISOString();
		case "toJSON":
			return dayjs(date).utc().startOf(unit).toJSON();
		case "toObject":
			return dayjs(date).utc().startOf(unit).toObject();
		case "toArray":
			return dayjs(date).utc().startOf(unit).toArray();
		case "unix":
			return dayjs(date).utc().startOf(unit).unix();
		case "valueOf":
			return dayjs(date).utc().startOf(unit).valueOf();
		default:
			return dayjs(date).utc().startOf(unit).format(formatOut);
	}
}

// END OF
module.exports.endOf = (date, formatIn, formatOut, unit) => {
	if (date === "" || date === null || date !== undefined) date = dayjs().utc();
	switch (formatIn) {
		case 'ISOString':
			date = dayjs(date).utc(); 
			break;			
		case 'unix': 
			date = dayjs.unix(date).utc();
			break;
		default: 
			date = dayjs(date, formatIn).utc();
	}
	switch (formatOut) {
		case "toISOString":
			return dayjs(date).utc().endOf(unit).toISOString();
		case "toJSON":
			return dayjs(date).utc().endOf(unit).toJSON();
		case "toObject":
			return dayjs(date).utc().endOf(unit).toObject();
		case "toArray":
			return dayjs(date).utc().endOf(unit).toArray();
		case "unix":
			return dayjs(date).utc().endOf(unit).unix();
		case "valueOf":
			return dayjs(date).utc().endOf(unit).valueOf();
		default:
			return dayjs(date).utc().endOf(unit).format(formatOut);
	}
}	
