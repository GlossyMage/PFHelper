const dice = require("./dice.js");

var exports = module.exports = {};

exports.attack = function (character) {
	var response = character.name + " attacks with ";
	if (character.gender === "Female") {
		response += "her ";
	} else if (character.gender === "Male") {
		response += "his ";
	} else {
		response += "their ";
	}

	response += character.weapons[0].name + ":\n";

	var attackBonus = parseInt(character.bab) + parseInt(character.weapons[0].hitbonus);

	if (this.hasFeat(character, "weapon finesse") && character.weapons[0].special.indexOf("Light") !== -1) {
		attackBonus += this.getAbilityModifier(character.abilities.dexterity);
	} else {
		attackBonus += this.getAbilityModifier(character.abilities.strength);
	}
	
	var damageBonus = this.getAbilityModifier(character.abilities.strength);
	
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
	return 10 + this.getAbilityModifier(character.abilities.dexterity) + character.armour.bonus;
};

exports.getAbilityModifier = function (ability) {
	return Math.floor((ability - 10) / 2);
};

exports.hasFeat = function (character, feat) {
	console.log("Looking for feat " + feat);
	for (var i = 0; i < character.feats.length; i++) {
		console.log("Checking feat " + character.feats[i]);
		if (character.feats[i].toLowerCase() === feat.toLowerCase()) {
			return true;
		}
	}

	return false;
}

exports.skillCheck = function (character, skill) {
	var normSkill = skill.toLowerCase();

	console.log("Checking skill: " + normSkill);
	
	if (typeof character.skills[normSkill] != 'undefined') {
		return dice.parseRoll("1d20 + " + character.skills[normSkill]);
	}
}

exports.savingThrow = function (character, save) {
	var normSave = save.toLowerCase();

	console.log("Rolling saving throw: " + normSave);

	if (typeof character.saves[normSave] != 'undefined') {
		return dice.parseRoll("1d20 + " + character.saves[normSave]);
	}
}
