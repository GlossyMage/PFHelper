const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const token = require("./token.json");

var dice = require("./dice.js");
var characters = require("./characters.js");


client.login(token.token);

client.on("ready", () => {
	console.log("Bot ready.");
});

client.on("message", (message) => {
	if (message.author.bot || !message.content.startsWith(config.prefix)) {
		return;
	}
	
	if (message.content.toLowerCase().includes("bleep")) {
		console.log("Bleeping detected.");
		commandBleep(message);
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

	var rolls = [];
	var m;
	var penalty = negateRegex.test(message.content);

	while (m = diceRegex.exec(message.content)) {
		rolls.push(m);
	}
			
	var results = []
	var response = message.author + " rolled: ";

	console.log("Rolls discovered: " + rolls);

	var i = 0;
	for (var i = 0; i < rolls.length; i++) {
		var currentRoll = dice.rollDice(rolls[i]);
		results.push(currentRoll);
	}

	var sum = 0;
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

	message.channel.send(response);
}
