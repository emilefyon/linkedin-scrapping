
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
var db = require('./lib/db-mysql.js');

// Get configuration
var credentials = config.get("Credentials");
var param = config.get("Parameters");


// Do the work
nav.loggin(driver)
	.then(nav.searchKeyword.bind(nav, driver, param.searchString))
	.then(parser.scrapPages.bind(parser, driver, param.nbPage))
	.then(function(res) {
		db.saveResults(res, param.searchString);
		db.disconnect();
		driver.close();
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


