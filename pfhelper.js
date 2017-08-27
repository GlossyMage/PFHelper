const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");
const characterSheets = require("./characters.json");
const fs = require("fs");
const token = require("./token.json");

var s = require("./sheetreader.js");
var dice = require("./dice.js");
var c = require("./characters.js");

var characters = [];


client.login(token.token);

client.on("ready", () => {
	client.user.setGame("Pathfinder");
	console.log("Bot ready.");
});

client.on("message", (message) => {
	if (message.author.bot || !message.content.startsWith(config.prefix)) {
		return;
	}
	
	if (message.content.toLowerCase().includes("bleep")) {
		console.log("Bleeping detected.");
		commandBleep(message);
	}

	if (message.content.startsWith(config.prefix + "attack")) {
		commandAttack(message);
	} else if (message.content.startsWith(config.prefix + "getAC")) {
		commandAC(message);
	} else if (message.content.startsWith(config.prefix + "bind ")) {
		commandBind(message);
	} else if (message.content.startsWith(config.prefix + "unbind ")) {
		commandUnbind(message);
	} else if (message.content.startsWith(config.prefix + "sheets")) {
		commandSheets(message);
	} else if (message.content.startsWith(config.prefix + "skill")) {
		commandSkill(message);
	} else if (message.content.startsWith(config.prefix + "save")) {
		commandSave(message);
	} else if (message.content.startsWith(config.prefix + "help")) {
		commandHelp(message);
	} else if (message.content.startsWith(config.prefix + 'r')) {
		var diceRoll = new RegExp(config.diceRoll, 'i');
		
		if (diceRoll.test(message.content)) {
			commandRoll(message);
		} else {
			message.channel.send("I didn't understand that dice roll, sorry.");
		}
	}
});

function commandBleep(message) {
	var bleeps = config.bleeps + 1;
	if (bleeps == 1) {
		message.channel.send("That's 1 time you've bleeped now.");
	} else {
		message.channel.send("That's " + bleeps + " times you've bleeped now.");
	}
	config.bleeps = bleeps;
	fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
}

function commandRoll(message) {
	var diceRegex = new RegExp(config.dice, 'g');
	var negateRegex = new RegExp(config.negate);
			
	var response = message.author + " rolled: " + dice.formatRoll(dice.parseRoll(message.content));

	message.channel.send(response).catch(function () {
		message.channel.send("Why would you need to roll that many dice? If you absolutely must, break the roll up into several messages.");
	});
}

function commandSheets(message) {

	message.channel.send("Reading the character sheets now. I'll list the characters as they become available.");

	for (var i = 0; i < characterSheets.length; i++) {
		s.readSheet(characterSheets[i]).then((results) => {
			characters.push(results);
			message.channel.send("Character now available: " + results.name);
		});
	}
}

function commandBind(message) {
	var characterName = message.content.substring("!bind ".length, message.content.length);
	var response = "";

	for (var i = 0; i < characters.length; i++) {
		if (characters[i].name.toLowerCase().indexOf(characterName.toLowerCase()) !== -1) {
			if (characters[i].player === "") {
				characters[i].player = message.author.id;
				persistBind(characters[i].id, message.author.id);
				response = characters[i].name + " is now bound to " + message.author + ".";
			} else {
				response = "That character is already bound to " + client.users.get(characters[i].player) + ".";
			}
		}
	}

	if (response === "") {
		response = "No available character with that name was found. Please try again.";
	}

	message.channel.send(response);
}

function persistBind(id, player) {
	for (var i = 0; i < characterSheets.length; i++) {
		if (characterSheets[i].id === id) {
			characterSheets[i].player = player;

			fs.writeFile("./characters.json", JSON.stringify(characterSheets), (err) => console.error);
		}
	}
}

function commandUnbind(message) {
	var characterName = message.content.substring("!unbind ".length, message.content.length);
	var response = "";
	var gmRole = message.guild.roles.find("name", "dungeon master");

	if (!message.member.roles.has(gmRole.id)) {
		message.channel.send("Only a " + gmRole + " can unbind characters.");
		return;
	}

	for (var i = 0; i < characters.length; i++) {
		if (characters[i].name.toLowerCase().indexOf(characterName.toLowerCase()) !== -1) {
			characters[i].player = "";

			persistBind(characters[i].id, "");
			
			response = characters[i].name + " has been unbound.";
		}
	}

	if (response === "") {
		response = "No character with that name was found. Please try again.";
	}

	message.channel.send(response);
}

function commandAttack(message) {
	var index = findCharacter(message);

	if (index === -1) {
		return;
	}
	
	message.channel.send(c.attack(characters[index]));
}

function commandAC(message) {
	var pronoun = "";

	var index = findCharacter(message);

	if (index === -1) {
		return;
	}

	if (characters[index].name.endsWith("s")) {
		pronoun = "'";
	} else {
		pronoun = "'s";
	}
	
	var response = characters[index].name + pronoun + " Armour Class is currently " + c.getAC(characters[index]) + ".";
	message.channel.send(response);
}

function commandSkill(message) {
	var index = findCharacter(message);

	if (index === -1) {
		return;
	}
	
	var skill = message.content.substring(7, message.content.length);
	var response = "";

	var check = c.skillCheck(characters[index], skill);

	if (check) {
		response = characters[index].name + " rolled " + skill + " check: " + dice.formatRoll(check);
	} else {
		response = "Skill \"" + skill + "\" not found.";
	}

	message.channel.send(response);
}

function commandSave(message) {
	var index = findCharacter(message);

	if (index === -1) {
		return;
	}

	var save = message.content.substring(6, message.content.length);
	var response = "";

	var result = c.savingThrow(characters[index], save);

	if (result) {
		response = characters[index].name + " rolled a " + save + " save: " + dice.formatRoll(result);
	} else {
		response = "That's not a saving throw. Please use either Fortitude, Reflex, or Will.";
	}

	message.channel.send(response);
}

function commandHelp(message) {
	var response = "Hello! I am a Discord bot made to help you play Pathfinder. "
		+ "I'll keep track of your character sheets, and roll your dice for you!"
		+ " Here are some of my most useful commands:\n\n";

	response += "**" + config.prefix + "r[oll] <dice and bonuses/penalties>** | Perform a standard "
		+ "dice roll. I'll accept any combination of dice and bonuses/penalties, "
		+ "and the dice can be of any size, so feel free to go nuts. Keep in mind, "
		+ "though, that Discord has a character limit which restricts how many "
		+ "dice you can roll at once. So no rolling 1000d6 in one go, please.\n\n";
	response += "**" + config.prefix + "bind <character name>** | Before you can perform any "
		+ "character-specific actions, you need to bind your character to you "
		+ "first. The following commands all require you to have a character "
		+ "bound to you.\n\n";
	response += "**" + config.prefix + "attack [main|off|both|<weapon name>]** | This command lets you "
		+ "attack with your character's weapons. If no parameters are provided,"
		+ " your character will attack using the weapon currently equipped in "
		+ "their main hand (or their fists if no weapons are equipped). If you "
		+ "want to attack with a specific weapon, you can use one of the "
		+ "parameters as shown.\n\n";
	response += "**" + config.prefix + "skill <skill name>** | This command lets you roll skill checks."
		+ " Simply add the name of the skill you wish to roll, and I'll handle "
		+ "the dirty work.\n\n";
	response += "**" + config.prefix + "save <fortitude|reflex|will>** | This command lets you roll "
		+ "one of the three standard saving throws used in Pathfinder.\n\n";
	response += "**" + config.prefix + "getAC** | This command simply tells you the Armour Class of your "
		+ "character. This one will probably get replaced by a better command soon.";

	message.channel.send(response);
}

function findCharacter(message) {
	var index = -1;

	for (var i = 0; i < characters.length; i++) {
		if (characters[i].player === message.author.id) {
			index = i;
		}
	}

	if (index === -1) {
		var response = "You do not have a character bound to you.";

		response += checkAvailable();
		message.channel.send(response);
	}

	return index;
}

function checkAvailable() {
	var availableCharacters = "";

	for (var i = 0; i < characters.length; i++) {
		if (characters[i].player === "") {
			availableCharacters += characters[i].name + "; ";
		}
	}

	var response = "";

	if (availableCharacters.length > 0) {
		response +=  " The following characters are currently available (semicolon separated): \n";
		response += availableCharacters.substring(0, availableCharacters.length - 2);
		response += "\nUse the command !bind <character name> to take ownership of a character.";
	} else {
		response += " No characters are currently available. Please consult your GM.\n";
	}

	return response;
}
