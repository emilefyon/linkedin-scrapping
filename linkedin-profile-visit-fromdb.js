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
var db = require('./lib/db.js');


// Load listing of profiles
nav.loggin(driver).then(function() {
	return db.getProfiles().then(function(items) {
		return visitList(items).then(function(nbVisited) {
			console.log(nbVisited + " profiles visited");
		});
	});

}).then(null, function(reason) {
	console.error(reason);
});



function visitList(list, nbVisited) {
	list = list.slice();
	var el = list.pop();
	return nav.visitProfile(driver, el).then(function() {
		return db.updateProfileVisitTimestamp(el._id);
	}, function() {
		return false;
	}).then(function(succeded) {
		if (list.length) 
			return visitList(list, succeded ? (nbVisited || 0) + 1: nbVisited);
		return nbVisited;
	});
}


