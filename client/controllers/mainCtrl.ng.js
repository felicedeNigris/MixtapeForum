'use strict'

angular.module('mixtapes')
  .controller('MainCtrl', mainCtrl)
function mainCtrl($scope){

	window.onload = function() {
		var introText = document.getElementsByClassName('intro-text')[0];

		//Animate text in hero on load
		introText.className += ' is-showing';

		

		window.addEventListener("scroll", function(event) {

		var wScroll = document.body.scrollTop;
		var botLeft = document.getElementsByClassName('bot-left-intro')[0];
		var botRight = document.getElementsByClassName('bot-right-intro')[0];
		var btn = document.getElementsByClassName('btn')[0];
	  // 	console.log (botLeft.scrollHeight);
	  	// console.log (window.innerHeight);
	  // 	console.log(botLeft.getBoundingClientRect().top);
	 	console.log(wScroll);
	 	console.log(botLeft.getBoundingClientRect().top - window.innerHeight);
	 	// console.log(botLeft.getBoundingClientRect().top - botLeft.scrollHeight);
        // console.log("Current offset from the top is " + botLeft.getBoundingClientRect().top + " pixels");
       	
		if (document.documentElement.scrollTop || botLeft.getBoundingClientRect().top - window.innerHeight < -50) {
            botLeft.className += ' is-showing';
		  	botRight.className += ' is-showing'; 
		  	console.log('triggered'); 
         }
		if(document.documentElement.scrollTop || btn.getBoundingClientRect().top - window.innerHeight < -50) {
			btn.className += ' is-showing';
			console.log('btn triggered');
		}


    	});
	}
}