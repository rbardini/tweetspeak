/*
 * Tweetspeak v1.3
 * Copyright (c) 2011 Rafael Bardini
 * https://github.com/rbardini/tweetspeak
 * 
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

(function tweetspeak() {
	if (typeof window.jQuery === 'undefined') {
		window.setTimeout(tweetspeak, 200);
	} else {
		var $ = jQuery = window.jQuery,
			appId = '7F49F33CD9011FCDCC9ADD5E88B79B6B82525881',
			baseUri = 'http://api.microsofttranslator.com/V2/Ajax.svc/',
			format = 'audio/wav',
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
		$('head').append('<style>.js-action-speak {color:#0064CD !important} .sm-speak {background:#0064CD url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAcCAMAAABWBG9SAAAACVBMVEUAAAD29vb///8kb9lQAAAAAXRSTlMAQObYZgAAAEZJREFUeNqVzzEOACAMQtGv9z+0aerQpKQo41sAlsiICEQggRQkE9axqEFs0VU7/uP7FhkRgQgkkIJkwjoWNYgtumrHv38/oAMCv8Ts8xAAAAAASUVORK5CYII=") no-repeat left top; width:14px; height:14px} .opened-tweet .sm-speak {background-position:left bottom} #tweetspeak-bar {background:#DFF1DF; border-top:1px solid #BBE2BB; -webkit-box-shadow: inset 0 3px 8px rgba(0,0,0,.05); -moz-box-shadow: inset 0 3px 8px rgba(0,0,0,.05); box-shadow: inset 0 3px 8px rgba(0,0,0,.05); display:none; font-size:13px; padding:10px 1px; text-align:center; text-shadow: 0 1px 0 rgba(255, 255, 255, .6); z-index:2; zoom:1} .tweetspeak-warning {background:#FFF0C0 !important; border-color:#FFE38D !important}</style>');
		
		var msg, bar = $('<div class="stream-item"><div id="tweetspeak-bar"></div></div>').prependTo($('.js-stream-manager-container')).children(),
			audio = document.createElement('audio');
		
		if (audio !== null && audio.canPlayType && audio.canPlayType(format)) {
			addAnchor($('.stream-item'));
			$(document).bind('DOMNodeInserted', function(event) {
				var el = $(event.target);
				if (el.is('.stream-item, .js-tweet-details-fixer')) {
					addAnchor(el);
				}
			});
			msg = 'Tweetspeak set up! Click the <em>Speak</em> link below any tweet to listen.';
		} else {
			bar.addClass('tweetspeak-warning');
			msg = 'Your browser does not support HTML5 Audio or the WAV format.<br/>Visit <a href="http://browsehappy.com/">Browse Happy</a> and upgrade your browser!';
		}
		
		bar.html(msg).slideDown();
		window.setTimeout(function() {
			bar.slideUp();
		}, 15000);
	}
})();
