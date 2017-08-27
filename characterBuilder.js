
var exports = module.exports = {};

exports.buildCharacter = function(values, sheet) {
	var character = 
		{
			abilities: {},
			saves: {},
			skills: {},
			weapons: [{}, {}, {}, {}, {}, {}],
			armour: {},
			equipment: {},
			feats: [],
			traits: {}
		};

	character.player = sheet.player;
	character.id = sheet.id;

	assignArrayToObject(character.abilities, values.slice(0, 6));
	assignArrayToObject(character.saves, values.slice(9, 12));
	assignArrayToObject(character.skills, values.slice(14, 53));
	getWeapons(character.weapons, values.slice(53, 107));

	character.feats = [].concat.apply([], values.slice(117, 140));
	character.traits = [].concat.apply([], values.slice(140, 146));

	character.bab = values[13][0];

	character.name = values[236][0];
	character.race = values[237][0];
	character.classes = values[238][0];
	character.gender = values[239][0];
	character.size = values[240][0];

	return character;
}

function assignArrayToObject(character, array) {
	array.forEach( ([value, attribute]) => { character[attribute.toLowerCase()] = value });
}

function getWeapons(weapons, array) {

	for (var i = 0; i < 6; i++) {
		weapons[i].equipped = array[(i*9)][0];
		weapons[i].name = array[(i*9)+1][0];
		weapons[i].damage = array[(i*9)+2][0];
		weapons[i].critical = array[(i*9)+3][0];
		weapons[i].critrange = array[(i*9)+4][0];
		weapons[i].type = array[(i*9)+5][0];
		weapons[i].range = array[(i*9)+6][0];
		weapons[i].special = array[(i*9)+7][0];
		weapons[i].hitbonus = array[(i*9)+8][0];
	}
}
