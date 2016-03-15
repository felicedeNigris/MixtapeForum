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
			var midLeft = document.getElementsByClassName('mid-left-intro')[0];
			var midRight = document.getElementsByClassName('mid-right-intro')[0];
			var bot = document.getElementsByClassName('intro-bot')[0];
			var mid = document.getElementsByClassName('intro-mid')[0];
			var btn = document.getElementsByClassName('btn')[0];
			var logo = document.getElementsByClassName('spotify-logo')[0];
		 	console.log(wScroll);

	       	//Animate  text on scroll
	       	if(document.documentElement.scrollTop || midLeft.getBoundingClientRect().top - window.innerHeight < -50) {
	       		midLeft.classList.add('is-showing');
			}
			if(document.documentElement.scrollTop || midRight.getBoundingClientRect().top - window.innerHeight < -100) {
				midRight.classList.add('is-showing');
			}
			if(document.documentElement.scrollTop || botLeft.getBoundingClientRect().top - window.innerHeight < -50) {
	            botLeft.classList.add('is-showing');
			  	botRight.classList.add('is-showing'); 
	         }
			if(document.documentElement.scrollTop || btn.getBoundingClientRect().top - window.innerHeight < -50) {
				btn.classList.add('is-showing');
			}

			//Move triangles in on scroll
			if(document.documentElement.scrollTop || mid.getBoundingClientRect().top - window.innerHeight < 0) {

			}
			console.log(wScroll - document.body.clientHeight);
			//Move logo up on scroll
			if(document.documentElement.scrollTop || bot.getBoundingClientRect().top - window.innerHeight < 0) {
				logo.style.transform = 'translate(0px, -'+ wScroll /4 +'%)';
				// console.log(logo.getBoundingClientRect().top - window.innerHeight);
				// console.log('triggered');
			}
    	});
	}
}