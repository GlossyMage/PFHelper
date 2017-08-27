const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");
const characterSheets = require("./characters.json");
const fs = require("fs");
const token = require("./token.json");

var s = require("./sheetreader.js");
var dice = require("./dice.js");
var c = require("./characters.js");

var hieronymus = 0;


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
	s.getAbilityScores().then((results) => {

		var response = "Stats for " + results.name + ":\n";
		response += "Strength: " + results.abilities.Strength + "\n";
		response += "Dexterity: " + results.abilities.Dexterity + "\n";
		response += "Constitution: " + results.abilities.Constitution + "\n";
		response += "Intellect: " + results.abilities.Intellect + "\n";
		response += "Wisdom: " + results.abilities.Wisdom + "\n";
		response += "Charisma: " + results.abilities.Charisma;

		hieronymus = results;

		message.channel.send(response);
	});
}

function commandBind(message) {
	var characterName = message.content.substring("!bind ".length, message.content.length);
	var response = "";

	for (var i = 0; i < characterSheets.length; i++) {
		if (characterName.toLowerCase() === characterSheets[i].name.toLowerCase()) {
			if (characterSheets[i].player === "") {
				characterSheets[i].player = message.author.id;
				response = characterSheets[i].name + " is now bound to " + message.author + ".";
			} else {
				response = "That character is already bound to " + client.users.get(characterSheets[i].player) + ".";
			}
		}
	}

	if (response === "") {
		response = "No available character with that name was found. Please try again.";
	}

	message.channel.send(response);
}

function commandUnbind(message) {
	var characterName = message.content.substring("!unbind ".length, message.content.length);
	var response = "";
	var gmRole = message.guild.roles.find("name", "dungeon master");

	if (!message.member.roles.has(gmRole.id)) {
		message.channel.send("Only a " + gmRole + " can unbind characters.");
		return;
	}

	for (var i = 0; i < characterSheets.length; i++) {
		if (characterName.toLowerCase() === characterSheets[i].name.toLowerCase()) {
			characterSheets[i].player = "";
			response = characterSheets[i].name + " has been unbound.";
		}
	}

	if (response === "") {
		response = "No character with that name was found. Please try again.";
	}

	message.channel.send(response);
}

function commandAttack(message) {
	var index = -1;
	
	for (var i = 0; i < characterSheets.length; i++) {
		if (characterSheets[i].player === message.author.id) {
			index = i;
		}
	}

	if (index === -1) {
		var response = "You do not have a character bound to you.";

		response += checkAvailable();
		message.channel.send(response);
		return;
	}
	
	message.channel.send(c.attack(characterSheets[index]));
}

function commandAC(message) {
	var pronoun = "";
	var index = -1;
	var availableCharacters = "";

	for (var i = 0; i < characterSheets.length; i++) {
		if (characterSheets[i].player === message.author.id) {
			index = i;
		}
	}

	console.log(availableCharacters);

	if (index === -1) {
		var response = "You do not have a character bound to you.";

		response += checkAvailable();
		message.channel.send(response);
		return;
	}

	if (characterSheets[index].name.endsWith("s")) {
		pronoun = "'";
	} else {
		pronoun = "'s";
	}
	
	var response = characterSheets[index].name + pronoun + " Armour Class is currently " + c.getAC(characterSheets[index]) + ".";
	message.channel.send(response);
}

function commandSkill(message) {
	if (hieronymus === 0) {
		message.channel.send("Character not found. Please do !sheets first to make me prepare your character.");
		return;
	}
	
	var skill = message.content.split(" ")[1];
	var response = "";

	var check = c.skillCheck(hieronymus, message.content.split(" ")[1]);

	if (check) {
		response = hieronymus.name + " rolled " + skill + " check: " + dice.formatRoll(check);
	} else {
		response = "Skill \"" + skill + "\" not found.";
	}

	message.channel.send(response);
}

function checkAvailable() {
	var availableCharacters = "";

	for (var i = 0; i < characterSheets.length; i++) {
		if (characterSheets[i].player === "") {
			availableCharacters += characterSheets[i].name + "; ";
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
