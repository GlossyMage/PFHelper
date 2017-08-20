const dice = require("./dice.js");

var exports = module.exports = {};

exports.attack = function (character) {
	var response = character.name + " attacks with ";
	if (character.gender === "f") {
		response += "her ";
	} else {
		response += "his ";
	}

	response += character.weapons[0].name + ":\n";

	var attackBonus = this.getAbilityModifier(character.strength) + character.bab + character.weapons[0].hitBonus;
	var damageBonus = this.getAbilityModifier(character.strength) + character.weapons[0].damageBonus;

	console.log("attackBonus = " + attackBonus);
	console.log("damageBonus = " + damageBonus);
	
	response += "Attack roll: ";
	var attackRoll;

	if (attackBonus >= 0) {
		attackRoll = dice.parseRoll("1d20 + " + attackBonus);
	} else {
		attackRoll = dice.parseRoll("1d20 - " + attackBonus);
	}

	console.log("attackRoll = " + attackRoll);

	response += dice.formatRoll(attackRoll) + "\n";

	response += "Damage roll: ";

	var damageRoll;

	if (damageBonus >= 0) {
		damageRoll = dice.parseRoll(character.weapons[0].damage + " + " + damageBonus);
	} else {
		damageRoll = dice.parseRoll(character.weapons[0].damage + " - " + damageBonus);
	}

	response += dice.formatRoll(damageRoll);

	return response;
};

exports.getAC = function (character) {
	return 10 + this.getAbilityModifier(character.dexterity) + character.armour.bonus;
};

exports.getAbilityModifier = function (ability) {
	return Math.floor((ability - 10) / 2);
};
