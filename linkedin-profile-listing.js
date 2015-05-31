
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
var parser = require('./lib/parser.js');
var db = require('./lib/db.js');

// Get configuration
var credentials = config.get("Credentials");
var param = config.get("Parameters");


// Sign-in to LinkedIn
nav.loggin(driver);

// Go on search page
nav.searchKeyword(driver, param.searchString);

// Scrap results
parser.scrapPages(driver, param.nbPage).then(function(res) {
	console.log(res);
	// Write to file
	exportToFile(res);
	db.saveResults(res);
});


function exportToFile(res, callback) {
	fs.writeFile(param.outputFile, JSON.stringify({results: res}, null, 4), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + param.outputFile);
		}
		if (callback) {callback(err);}
	}); 

}


