
var exports = module.exports = {};

exports.buildCharacter = function(sheet) {

	var character = 
		{
			abilities: {},
			saves: {},
			skills: {},
			weapons: {},
			armour: {},
			equipment: {},
			feats: {},
			traits: {}
		};

	assignArrayToObject(character.abilities, sheet.slice(0, 6));
	assignArrayToObject(character.saves, sheet.slice(9, 12));
	assignArrayToObject(character.skills, sheet.slice(14, 53));
	//getWeapons(character.weapons, sheet.slice(53, 107));

	character.name = sheet[236][0];

	return character;
}

function assignArrayToObject(character, array) {
	array.forEach( ([value, attribute]) => { character[attribute] = value });
}

/*function getWeapons(character, array) {
	
}*/
