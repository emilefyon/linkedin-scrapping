# LinkedIn Scrapping & Automation

## Introduction

This app allows you to scrapp LinkedIn results and to visit profiles afterwards.

Based on node.js.

## Installation

Import repository and run 

> npm install

to import dependencies.

Add new file in *config/* folder (for instance *development.json*) with your crendentials

> {
> 	"Credentials": {
>		"email": "your email",
>		"password": "your linkedin password"
>	}
> } 

Update your search term and number of pages you want to look for:

>	{
>		"Parameters": {
>			"nbPage": 2,
>			"searchString": "nodejs"
>		}
>	} 

Then run the execution files: 

> node linkedin-profile-listing.js
> node linkedin-profile-visit.js

Enjoy