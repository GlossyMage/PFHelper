const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const token = require("./token.json");


client.login(token.token);

client.on("ready", () => {
	console.log("Bot ready.");
});

client.on("message", (message) => {
	
});

client.on("message", (message) => {
	if (message.author.bot) {
		return;
	}
	
	if (message.content.toLowerCase().includes("bleep")) {
		var bleeps = config.bleeps + 1;
		if (bleeps == 1) {
			message.channel.send("That's 1 time you've bleeped now.");
		} else {
			message.channel.send("That's " + bleeps + " times you've bleeped now.");
		}
		config.bleeps = bleeps;
		fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
	} else if (message.content.startsWith(config.prefix)) {
		var diceRoll = new RegExp(config.diceRoll, 'i');
		var dice = new RegExp(config.dice, 'g');
		var negate = new RegExp(config.negate);
		
		if (diceRoll.test(message.content)) {
			var rolls = [];
			var m;
			var penalty = negate.test(message.content);

			while (m = dice.exec(message.content)) {
				rolls.push(m);
			}
			
			var results = []
			var response = message.author + " rolled: ";

			console.log("Rolls discovered: " + rolls);

			var i = 0;
			for (var i = 0; i < rolls.length; i++) {
				var currentRoll = rollDice(rolls[i]);
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
		} else {
			message.channel.send("I didn't understand that dice roll, sorry.");
		}
	}
});

function rollDice(input) {
	if (!String(input).includes('d')) {
		return parseInt(input);
	}
	
	var numbers = String(input).split("d");
	var results = []

	for (var i = 0; i < numbers[0]; i++) {
		results.push(getRandom(numbers[1]));
	}

	return results;
}

function getRandom(max) {
	return Math.floor(Math.random() * max) + 1;
}
