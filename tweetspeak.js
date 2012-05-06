/*
 * Tweetspeak v1.3
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
			baseUri = 'http://api.microsofttranslator.com/V2/Ajax.svc/',
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
			url: baseUri+methodName,
			dataType: 'jsonp',
			jsonp: 'oncomplete',
			data: data
		}).success(function(data) {
				if (typeof callback === 'function') {
					callback(data);
				}
		});
	}
	
	function speak() {
		var title = $(this).find('b').text('Loading...'),
			tweet = $(this).closest('.content').find('.js-tweet-text').text().replace(/\"/g, '\''),
			data = {text:tweet, format:format};
		
		invokeService('Detect', data, function(language) {
			if ($.inArray(language, supported) !== -1) {
				data.language = language;
				invokeService('Speak', data, function(stream) {
					var audio = document.createElement('audio');
					audio.src = stream;
					audio.play();
					
					audio.addEventListener('playing', function() {
						title.text('Speaking ('+language.toUpperCase()+')');
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
	
	function addAnchor(el) {
		var anchor = '<li class="action-speak-container"><a class="with-icn js-action-speak" href="#" title="Speak"><i class="sm-speak"/><b>Speak</b></a></li>';
		$(anchor).insertAfter(el.find('.action-fav-container')).click(speak);
	}
	
	function init() {
		// Base64-encoded speaker icon
		$('head').append('<style>.js-action-speak {color:#0064CD !important} .sm-speak {background:#0064CD url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAOAQMAAAAVCq6zAAAABlBMVEUAAAD29vYCFqe/AAAAAXRSTlMAQObYZgAAAC1JREFUeNo1yrENADAIA0FGz2aM4hVcUqAQKxbFNa+PGX5XWgqMkwJaurWf/R8lrCXzVxJVNgAAAABJRU5ErkJggg==") no-repeat left center; width:14px; height:13px}</style>');
		
		var audio = document.createElement('audio');
		
		if (audio !== null && audio.canPlayType && audio.canPlayType(format)) {
			addAnchor($('.stream-item'));
			$(document).bind('DOMNodeInserted', function(event) {
				var el = $(event.target);
				if (el.is('.stream-item, .js-tweet-details-fixer')) {
					addAnchor(el);
				}
			});
		}
	}
})();
