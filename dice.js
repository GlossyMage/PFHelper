var exports = module.exports = {};

exports.getRandom = function (max) {
	return Math.floor(Math.random() * max) + 1;
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


