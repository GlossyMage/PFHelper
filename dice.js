var config = require("./config.json");

var exports = module.exports = {};

exports.getRandom = function (max) {
	return Math.floor(Math.random() * max) + 1;
};

exports.parseRoll = function(input) {
	var diceRegex = new RegExp(config.dice, 'g');
	var negateRegex = new RegExp(config.negate);

	var penalty = negateRegex.test(input);
	var rolls = [];
	var m;

	console.log("input: " + input);

	while (m = diceRegex.exec(input)) {
		rolls.push(m);
	}

	console.log("Rolls discovered: " + rolls);
	var results = []

	for (var i = 0; i < rolls.length; i++) {
		var currentRoll = this.rollDice(rolls[i]);
		results.push(currentRoll);
	}

	return results;
}

exports.formatRoll = function(results, penalty) {
	var sum = 0;
	var response = "";
	
	for (var i = 0; i < results.length; i++) {

		if (!(results[i].constructor === Array)) {
			if (penalty) {
				sum -= results[i];
			} else {
				sum += results[i];
			}
					
			response = response + results[i];
		}
		for (var j = 0; j < results[i].length; j++) {
			if (j == results[i].length - 1) {
				response = response + "[ **" + results[i][j] + "** ]";
			} else {
				response = response + "[ **" + results[i][j] + "** ] + ";
			}

			sum += results[i][j];
		}
			
		if (i < results.length - 1) {
			if (penalty && (i == results.length - 2)) {
				response += "    -    ";
			} else {
				response += "    +    ";
			}
		}
	}

	response = response + "    =    ***" + sum + "***";

	return response;
};

exports.rollDice = function (input) {
	if (!String(input).includes('d')) {
		return parseInt(input);
	}

	var numbers = String(input).split("d");
	var results = []

	for (var i = 0; i < numbers[0]; i++) {
		results.push(this.getRandom(numbers[1]));
	}
	return results;
};


