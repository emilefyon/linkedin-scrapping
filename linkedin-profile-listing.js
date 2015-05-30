



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


var credentials = config.get("Credentials");
var param = config.get("Parameters");

driver.get('http://www.linkedin.com/');
driver.wait(function(){return driver.findElement(By.id('signin'));}, 1000);
driver.findElement(By.id('session_key-login')).sendKeys(credentials.email);
driver.findElement(By.id('session_password-login')).sendKeys(credentials.password);
driver.findElement(By.id('signin')).click();
driver.wait(until.titleMatches(/^Welcome/), 1000);
driver.get('https://www.linkedin.com/vsearch/p?keywords=' + encodeURIComponent(param.searchString));
driver.wait(until.titleMatches(/^Search/), 1000);


scrapPage(param.nbPage).then(function(res) {
	console.log(res);
	fs.writeFile(param.outputFile, JSON.stringify({results: res}, null, 4), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + param.outputFile);
		}
		driver.exit();
	}); 
})




function scrapPage(nbPage) {
	return scrapNextPage(0, []);

	function scrapNextPage(i, result) {
		if (i < nbPage) {
			return getSearchResults().then(function(res) {
				return openNextPageResult().then(function() {
					return scrapNextPage(++i, result.concat(res));					
				});
			});
		} else return result;
	}

}

function openNextPageResult() {
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

function getSearchResults() {
	return driver.findElements(By.css('li.result.people')).then(function(els) {
		return promise.all(els.map(parseSearchResult));
	});
}


function parseSearchResult(el) {
	
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
			jobTitle: results[2]
		}
	});

}

