
// Require libraries
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    config = require('config'),
    until = require('selenium-webdriver').until;

// Get configuration
var credentials = config.get("Credentials");

module.exports = {
	
	loggin: function(driver) {
		// Sign-in to LinkedIn
		goToHomePage(driver).then(fillInSignInForm(driver)).then(function() {
			return true;
		}, function() {
			console.log('could not log-in');
			return false;
		});
	},

	visitProfile: function(driver, el) {	
		console.log(el.name + " " + el.userId);
		return driver.get('https://www.linkedin.com/profile/view?id=' + el.userId).then(function() {
			return driver.wait(until.titleMatches(new RegExp('^' + el.name + '')), 2000).then(function() {
				return true;
			});		
		});
	},

	searchKeyword: function(driver, search) {
		return driver.get('https://www.linkedin.com/vsearch/p?keywords=' + encodeURIComponent(search)).then(function() {
			return driver.wait(until.titleMatches(/^Search/), 1000).then(function() {
				return true
			}, function() {
				console.log('Could not reach to search page');
				return false;
			});
		});
	},

	openNextPageResult: function(driver) {
	return driver.findElement(By.css("ul.pagination li.active")).getText().then(function(currentPage) {
		var nextPage =  parseInt(currentPage) + 1;
		console.log("Next page: " + nextPage);
		driver.findElement(By.css("ul.pagination li.next a")).click();
		driver.wait(function() {
			return driver.findElement(By.css("ul.pagination li.active")).getText().then(function(newPage) {
				// console.log("newPage: " + newPage, parseInt(newPage) === nextPage);
				return parseInt(newPage) === nextPage;
			}, function(reason) {
				return false;
			});
		}, 10000);
	});
}

}

function goToHomePage(driver) {
	return driver.get('http://www.linkedin.com/nhome/').then(function() {
		driver.wait(function(){
			return driver.findElement(By.id('signin')).then(function() {
				return true;
			});
		}, 1000);
	});
}

function fillInSignInForm(driver) {
	driver.findElement(By.id('session_key-login')).sendKeys(credentials.email);
	driver.findElement(By.id('session_password-login')).sendKeys(credentials.password);
	driver.findElement(By.id('signin')).click();
	return driver.wait(until.titleMatches(/^Welcome/), 1000).then(function(){
		return true;
	});
}