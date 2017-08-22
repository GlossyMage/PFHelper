var config = require("./config.json");

var exports = module.exports = {};

exports.parseRoll = function(input) {
	var diceRegex = new RegExp(config.dice, 'g');

	var results = [];
	var m;

	console.log("input: " + input);

	while (m = diceRegex.exec(input)) {
		results.push(rollDice(m));
	}

	return results;
}

exports.formatRoll = function(results) {
	var sum = 0;
	var response = "";
	
	for (var i = 0; i < results.length; i++) {
		if (!(results[i].constructor === Array)) {
			let stringResult = String(results[i]);
			if (stringResult === '+' || stringResult === '-') {
				response += "    " + stringResult + "    ";
			} else {
				response += stringResult;
			}

			continue;
		}
		
		for (var j = 0; j < results[i].length; j++) {
			if (j == results[i].length - 1) {
				response = response + "[ **" + results[i][j] + "** ]";
			} else {
				response = response + "[ **" + results[i][j] + "** ] + ";
			}
		}
	}

	response = response + "    =    ***" + getRollSum(results) + "***";

	return response;
};

function getRollSum(input) {
	var sum = 0;
	let prevSymbol = "";
	
	for (let i = 0; i < input.length; i++) {
		if (input[i] === '+' || input[i] === '-') {
			prevSymbol = input[i];
		} else if (prevSymbol === "" || prevSymbol === '+') {
			sum += getArraySum(input[i]);
		} else {
			sum -= getArraySum(input[i]);
		}
	}
	
	return sum;
}

function getArraySum(input) {
	if (input.constructor === Array) {
		return input.reduce(function(a, b) { return a + b; }, 0);
	} else {
		return input;
	}
}

function rollDice(input) {
	let stringInput = String(input);

	if (stringInput === '+' || stringInput === '-') {
		return stringInput;
	}
	if (!stringInput.includes('d')) {
		return parseInt(input);
	}

	var numbers = stringInput.split("d");
	var results = []

	for (var i = 0; i < numbers[0]; i++) {
		results.push(getRandom(numbers[1]));
	}
	return results;
}

function getRandom(max) {
	return Math.floor(Math.random() * max) + 1;
}
