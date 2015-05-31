// Require libraries
var webdriver = require('selenium-webdriver'),
By = require('selenium-webdriver').By,
config = require('config'),
promise = require('selenium-webdriver').promise,
until = require('selenium-webdriver').until;

// Get configuration
var credentials = config.get("Credentials");

// App libraries
var nav = require('./navigation.js');

module.exports = {

	getPeopleOnPage: function(driver) {
		return driver.findElements(By.css('li.result.people')).then(function(els) {
			return promise.all(els.map(parsePersonSummary));
		});
	},

	scrapPages: function(driver, nbPage) {
		return scrapNextPage(0, []);

		function scrapNextPage(i, result) {
			if (i < nbPage) {
				return module.exports.getPeopleOnPage(driver).then(function(res) {
					return nav.openNextPageResult(driver).then(function() {
						return scrapNextPage(++i, result.concat(res));					
					});
				});
			} else return result;
		}

	}


}


function parsePersonSummary(el) {
	
	var titleElement = el.findElement(By.className("title"));

	// Name
	var namePromise = titleElement.getText();

	// User ID
	var userIdPromise = titleElement.getAttribute('href').then(function(href) {
		return href.match(/id=(\w+)/)[1];
	});

	// Title
	var jobTitlePromise = el.findElement(By.className('description')).getText();

	// Resolve all the promises
	return promise.all([namePromise, userIdPromise, jobTitlePromise]).then(function(results) {
		return {
			name: results[0],
			userId: results[1],
			_id: results[1],
			jobTitle: results[2]
		}
	});

}
