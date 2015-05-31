// This file allow to connect to LinkedIn and srap result pages



// Require libraries
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    promise = require('selenium-webdriver').promise,
    fs = require('fs'),
    config = require('config'),
    until = require('selenium-webdriver').until;

// Initialise driver
var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

// App libraries
var nav = require('./lib/navigation.js');

// Get configuration
var credentials = config.get("Credentials");
var param = config.get("Parameters");

// Load listing of profiles
var profiles = JSON.parse(fs.readFileSync(param.outputFile, 'utf8'));

// Sign-in to LinkedIn
nav.loggin(driver).then(visitList.bind(null, profiles.results)).then(function(nbVisited) {
	console.log(nbVisited + " profiles visited");
});

// Don't know why I can't chain them. Any idea ?
// visitList(profiles.results).then(function(nbVisited) {
// 	console.log(nbVisited + " profiles visited");
// });


function visitList(list, nbVisited) {
	list = list.slice();
	return nav.visitProfile(driver, list.pop()).then(null, function() {
		return false;
	}).then(function(succeded) {
		if (list.length) 
			return visitList(list, succeded ? (nbVisited || 0) + 1: nbVisited);
		return nbVisited;
	});
}


