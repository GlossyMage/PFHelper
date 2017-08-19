const dice = require("./dice.js");

module.exports = {};

exports.attack = function (character) {
	var response = character.name + " attacks with ";
	if (character.gender === "f") {
		response += "her ";
	} else {
		response += "his ";
	}

	if (character.weapons.length == 0) {
		response += "bare fists:";
	} else {
		response += character.weapons[0].name + ":";
	}
};

exports.getAC = function (character) {
	return 10 + getAbilityModifier(character.dexterity) + character.armour.bonus;
};

exports.getAbilityModifier = function (ability) {
	return Math.floor((ability - 10) / 2);
};
