/*
 * Tweetspeak v1.0
 * Copyright (c) 2011 Rafael Bardini
 * https://github.com/rbardini/tweetspeak
 * 
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

(function tweetspeak() {
	// Assumes jQuery is already included, and waits for it to load.
	// For a more bulletproof solution see joanpiedra.com/jquery/greasemonkey/
	if (typeof window.jQuery === 'undefined') {
		window.setTimeout(tweetspeak, 200);
	} else {
		var $ = jQuery = window.jQuery,
			// Bing AppID — www.bing.com/toolbox/bingdeveloper/
			appId = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			// Microsoft Translator V2 AJAX API — msdn.microsoft.com/en-us/library/ff512404.aspx
			apiUri = 'http://api.microsofttranslator.com/V2/Ajax.svc/',
			// Default content-type (currently the only allowed value) — msdn.microsoft.com/en-us/library/ff512405.aspx
			format = 'audio/wav',
			// Available languages (hardcoded to speed things up) — msdn.microsoft.com/en-us/library/ff512400.aspx
			supported  = ['ca','ca-es','da','da-dk','de','de-de','en','en-au','en-ca','en-gb','en-in','en-us','es','es-es','es-mx','fi','fi-fi','fr','fr-ca','fr-fr','it','it-it','ja','ja-jp','ko','ko-kr','nb-no','nl','nl-nl','no','pl','pl-pl','pt','pt-br','pt-pt','ru','ru-ru','sv','sv-se','zh-chs','zh-cht','zh-cn','zh-hk','zh-tw'];
		init();
	}
	
	function invokeService(methodName, data, callback) {
		if (typeof (data) === 'undefined') {
			data = {};
		}
		data.appId = appId;
		
		return $.ajax({
			url: apiUri+methodName,
			dataType: "jsonp",
			jsonp: "oncomplete",
			data: data
		}).success(function(data) {
				if (typeof callback === 'function') {
					callback(data);
				}
		});
	}
	
	function speak() {
		var title = $(this).find('b').text('Loading...'),
			tweet = $(this).closest('.tweet-content').find('.tweet-text').text(),
			data = {text:tweet, format:format};
		
		invokeService("Detect", data, function(language) {
			if ($.inArray(language, supported) !== -1) {
				data.language = language;
				invokeService("Speak", data, function(stream) {
					var audio = document.createElement('audio');
					audio.src = stream;
					audio.play();
					
					audio.addEventListener('playing', function() {
						title.text('Speaking... ('+language.toUpperCase()+')');
					}, false);
					audio.addEventListener('ended', function() {
						title.text('Speak');
					}, false);
				});
			} else {
				title.text('Can\'t speak in '+language.toUpperCase());
			}
		});
	}
	
	function addAnchor(tweet) {
		var anchor = '<a href="#" class="tweetspeak-action" title="Speak"><span><i/><b>Speak</b></span></a>';
		$(anchor).appendTo(tweet.find('.tweet-actions')).click(speak);
	}
	
	function init() {
		// Base64-encoded speaker icon
		$('head').append('<style>.tweet-actions .tweetspeak-action span i {background:transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAPCAYAAAAYjcSfAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAHlSURBVHjaxZXNK0RRGMbvHeMjokw+k8UUOxm5s2BGGmWhEKWMje2Mf8KG4j9QY8HCjoSQDZIii4mFnRQpFPlMMsT1O/XeOgvN3Lvy1q/nOfd2z3PPnfecMWzbdoVlWT3iPZNIJHb1sc/IUeFwuFTsOz5qeKhkMhkUe42fFU9o7goR1pFOp/fxdfhaD7njhM2nUqlRfA++y6BMlvvX6gLIO9QQdsl4BL8DJlhc28qyuhByAzHClhjf4gfAD1NcizmhemAQsWANhmAPfNBK2Ab3e/HH+Ns/AoeRaQjBOcShACYIa+f+IX7cpEHqteeKIQKvTLpMQJUa41fxQ/gVsKBavQCT9MlzNtRBCs4JaOReFD+DD+HP8E0wBVG1gm6NCKj6AYOJ7xCTQD/6AgF4hEpQtS5sSKCqDBiEHSB5BJagZ9AMJ9DmppEyUASfUCiarUzNP0GFps+uuleCMqIfUADZytZ8OTxAAO7V2And1jjUt5L8pjaf+QstgydtAlX9Qh+MOS8pTRVBvvnMb2gDnEILHLntXlO6dzNH98alWfTu9cMk4RGne3Pt01omv2Acl33q87BPuwhaZHyNH4R8Z5+6OXM7FOKHocbDmTsH8+KvIKa8m9BS0U6Iejzog6ILMOtc/5d/mV/71PLjqPlragAAAABJRU5ErkJggg==") no-repeat 0 0} .tweet-actions .tweetspeak-action:hover span i {background-position:-15px 0}</style>');
		
		var audio = document.createElement('audio');
		
		if (audio !== null && audio.canPlayType && audio.canPlayType(format)) {
			addAnchor($('.stream-item'));
			$(document).bind('DOMNodeInserted', function(event) {
				if ($(event.target).hasClass('stream-item')) {
					addAnchor($(event.target));
				}
			});
		}
	}
})();
