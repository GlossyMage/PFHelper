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

	var attackBonus = character.bab + character.weapons[0].hitBonus;

	if (this.hasFeat(character, "weapon finesse")) {
		attackBonus += this.getAbilityModifier(character.dexterity);
	} else {
		attackBonus += this.getAbilityModifier(character.strength);
	}
	
	var damageBonus = this.getAbilityModifier(character.strength) + character.weapons[0].damageBonus;
	
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

exports.hasFeat = function (character, feat) {
	for (var i = 0; i < character.feats.length; i++) {
		if (character.feats[i] === feat) {
			return true;
		}
	}

	return false;
}
