const readFile = require('fs-readfile-promise');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-readedit.json';

var exports = module.exports = {};

var auth;

exports.getAbilityScores = async function() {
	const secret = await getClientSecret();
	auth = await authorize(secret);
	return await getCharacter(auth);
};

async function getClientSecret() {
	try {
		const content = await readFile('client_secret.json');
		return JSON.parse(content);
	} catch (err) {
		console.log("Error handling client secret file: " + err);
	}
}

async function authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	try {
		const token = await readFile(TOKEN_PATH);
		oauth2Client.credentials = JSON.parse(token);
		return oauth2Client;
	} catch (err) {
		return getNewToken(oauth2Client);
	}
}

function getNewToken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorise this app by visiting this url: ', authUrl);

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            return oauth2Client;
            //callback(oauth2Client);
        });
    });
}

function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }

    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

async function getCharacter(auth) {
	const response = await getSheetsValues({
		auth: auth,
		spreadsheetId: '1Nz-Zo6wDwg_BrCn65SwPjEtK3t0HikPo3zhsufTlWxY',
		range: 'B4:C9',
	});

	return response;

	/*
	var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
       	auth: auth,
       	spreadsheetId: '1Nz-Zo6wDwg_BrCn65SwPjEtK3t0HikPo3zhsufTlWxY',
       	range: 'B4:C9',
    }, (err, response) => {
       	if (err) {
       	    reject();
       	} else {
       		var rows = response.values;
       		if (rows.length == 0) {
       		    console.log('No data found.');
       		} else {
       		    console.log(rows);
       		}
       	}
    });
   */
}

function getSheetsValues(params) {
	return new Promise((resolve, reject) => {
		var sheets = google.sheets('v4');
    	sheets.spreadsheets.values.get(params, (err, response) => {
        	if (err) {
        	    reject();
        	} else {
        		resolve(response);
        	}
    	});
    });
}
