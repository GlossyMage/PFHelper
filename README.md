# PFHelper
A Discord bot to help people playing Pathfinder.

In order to run this bot, you must install Discord.js. 
This is done by opening the repository directory in the terminal and entering the following:
npm install discord.js

Additionally, Node.js version 7.6 or higher is required to ensure the bot will run correctly.

The token.json file is missing from this repository. This is intentional. 
To run this bot, add your own token.json file containing the following:

{
	"token": [your token here]
}

Note: If you want to run this bot on a server that has other bots, you may want to change the prefix in config.json to something else, for instance "pf!", in order to prevent PFHelper from picking up messages meant for other bots.


The characters.json file is not included in the repository because it is a temporary way to get character information until support for Google Sheets can be implemented.
