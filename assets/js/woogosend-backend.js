(function($) {
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
function woogosendDebounce(func, wait) {
	var timeout;
	return function () {
		var context = this;
		var args = arguments;
		var later = function () {
			timeout = null;
			func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

function woogosendToggleButtons(args) {
	$.when($('#woogosend-buttons').remove()).then(function () {
		$('#btn-ok').hide().after(wp.template('woogosend-buttons')(woogosendGetButtons(args)));
	});
}

function woogosendGetButtons(args) {
	var buttonDefault = {
		btn_right: {
			id: 'save-settings',
			icon: 'yes',
			label: woogosendI18n('buttons.Save Changes'),
		},
	};

	if (!args) {
		return buttonDefault;
	}

	return args;
}

function woogosendObject(obj, path, def) {
	if (typeof path === 'string') {
		path = path.split('.');
	}

	try {
		// Cache the current object
		var current = obj;

		// For each item in the path, dig into the object
		for (var i = 0; i < path.length; i++) {
			current = current[path[i]];
		}

		return current;
	} catch (error) {
		console.log('woogosendObject', error);

		return def;
	}
}

function woogosendI18n(path, def) {
	return woogosendObject(woogosend_backend.i18n, path, def);
}

function woogosendError(path, def) {
	return woogosendObject(woogosend_backend.i18n.errors, path, def);
}

function woogosendSprintf() {
	//  discuss at: https://locutus.io/php/sprintf/
	// original by: Ash Searle (https://hexmen.com/blog/)
	// improved by: Michael White (https://getsprink.com)
	// improved by: Jack
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Kevin van Zonneveld (https://kvz.io)
	// improved by: Dj
	// improved by: Allidylls
	//    input by: Paulo Freitas
	//    input by: Brett Zamir (https://brett-zamir.me)
	// improved by: Rafał Kukawski (https://kukawski.pl)
	//   example 1: sprintf("%01.2f", 123.1)
	//   returns 1: '123.10'
	//   example 2: sprintf("[%10s]", 'monkey')
	//   returns 2: '[    monkey]'
	//   example 3: sprintf("[%'#10s]", 'monkey')
	//   returns 3: '[####monkey]'
	//   example 4: sprintf("%d", 123456789012345)
	//   returns 4: '123456789012345'
	//   example 5: sprintf('%-03s', 'E')
	//   returns 5: 'E00'
	//   example 6: sprintf('%+010d', 9)
	//   returns 6: '+000000009'
	//   example 7: sprintf('%+0\'@10d', 9)
	//   returns 7: '@@@@@@@@+9'
	//   example 8: sprintf('%.f', 3.14)
	//   returns 8: '3.140000'
	//   example 9: sprintf('%% %2$d', 1, 2)
	//   returns 9: '% 2'

	var regex = /%%|%(?:(\d+)\$)?((?:[-+#0 ]|'[\s\S])*)(\d+)?(?:\.(\d*))?([\s\S])/g
	var args = arguments
	var i = 0
	var format = args[i++]

	var _pad = function (str, len, chr, leftJustify) {
		if (!chr) {
			chr = ' '
		}
		var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
		return leftJustify ? str + padding : padding + str
	}

	var justify = function (value, prefix, leftJustify, minWidth, padChar) {
		var diff = minWidth - value.length
		if (diff > 0) {
			// when padding with zeros
			// on the left side
			// keep sign (+ or -) in front
			if (!leftJustify && padChar === '0') {
				value = [
					value.slice(0, prefix.length),
					_pad('', diff, '0', true),
					value.slice(prefix.length)
				].join('')
			} else {
				value = _pad(value, minWidth, padChar, leftJustify)
			}
		}
		return value
	}

	var _formatBaseX = function (value, base, leftJustify, minWidth, precision, padChar) {
		// Note: casts negative numbers to positive ones
		var number = value >>> 0
		value = _pad(number.toString(base), precision || 0, '0', false)
		return justify(value, '', leftJustify, minWidth, padChar)
	}

	// _formatString()
	var _formatString = function (value, leftJustify, minWidth, precision, customPadChar) {
		if (precision !== null && precision !== undefined) {
			value = value.slice(0, precision)
		}
		return justify(value, '', leftJustify, minWidth, customPadChar)
	}

	// doFormat()
	var doFormat = function (substring, argIndex, modifiers, minWidth, precision, specifier) {
		var number, prefix, method, textTransform, value

		if (substring === '%%') {
			return '%'
		}

		// parse modifiers
		var padChar = ' ' // pad with spaces by default
		var leftJustify = false
		var positiveNumberPrefix = ''
		var j, l

		for (j = 0, l = modifiers.length; j < l; j++) {
			switch (modifiers.charAt(j)) {
				case ' ':
				case '0':
					padChar = modifiers.charAt(j)
					break
				case '+':
					positiveNumberPrefix = '+'
					break
				case '-':
					leftJustify = true
					break
				case "'":
					if (j + 1 < l) {
						padChar = modifiers.charAt(j + 1)
						j++
					}
					break
			}
		}

		if (!minWidth) {
			minWidth = 0
		} else {
			minWidth = +minWidth
		}

		if (!isFinite(minWidth)) {
			throw new Error('Width must be finite')
		}

		if (!precision) {
			precision = (specifier === 'd') ? 0 : 'fFeE'.indexOf(specifier) > -1 ? 6 : undefined
		} else {
			precision = +precision
		}

		if (argIndex && +argIndex === 0) {
			throw new Error('Argument number must be greater than zero')
		}

		if (argIndex && +argIndex >= args.length) {
			throw new Error('Too few arguments')
		}

		value = argIndex ? args[+argIndex] : args[i++]

		switch (specifier) {
			case '%':
				return '%'
			case 's':
				return _formatString(value + '', leftJustify, minWidth, precision, padChar)
			case 'c':
				return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, padChar)
			case 'b':
				return _formatBaseX(value, 2, leftJustify, minWidth, precision, padChar)
			case 'o':
				return _formatBaseX(value, 8, leftJustify, minWidth, precision, padChar)
			case 'x':
				return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
			case 'X':
				return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
					.toUpperCase()
			case 'u':
				return _formatBaseX(value, 10, leftJustify, minWidth, precision, padChar)
			case 'i':
			case 'd':
				number = +value || 0
				// Plain Math.round doesn't just truncate
				number = Math.round(number - number % 1)
				prefix = number < 0 ? '-' : positiveNumberPrefix
				value = prefix + _pad(String(Math.abs(number)), precision, '0', false)

				if (leftJustify && padChar === '0') {
					// can't right-pad 0s on integers
					padChar = ' '
				}
				return justify(value, prefix, leftJustify, minWidth, padChar)
			case 'e':
			case 'E':
			case 'f': // @todo: Should handle locales (as per setlocale)
			case 'F':
			case 'g':
			case 'G':
				number = +value
				prefix = number < 0 ? '-' : positiveNumberPrefix
				method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(specifier.toLowerCase())]
				textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(specifier) % 2]
				value = prefix + Math.abs(number)[method](precision)
				return justify(value, prefix, leftJustify, minWidth, padChar)[textTransform]()
			default:
				// unknown specifier, consume that char and return empty
				return ''
		}
	}

	try {
		return format.replace(regex, doFormat)
	} catch (err) {
		return false
	}
}

(function (w) {
  'use strict';

  var A, F, O, consoleMethods, fixConsoleMethod, consoleOn,
    allHandlers, methodObj;

  A = [];
  F = function () { return; };
  O = {};

  // All possible standard methods to provide an interface for
  consoleMethods = [
    'assert', 'clear', 'count', 'debug',
    'dir', 'dirxml', 'error', 'exception',
    'group', 'groupCollapsed', 'groupEnd',
    'info', 'log', 'profile', 'profileEnd',
    'table', 'time', 'timeEnd', 'timeStamp',
    'trace', 'warn'
  ];

  // Holds handlers to be executed for every method
  allHandlers = [];

  // Holds handlers per method
  methodObj = {};

  // Overrides the existing console methods, to call any stored handlers first
  fixConsoleMethod = (function () {
    var func, empty;

    empty = function () {
      return F;
    };

    if (w.console) {
      // If `console` is even available
      func = function (methodName) {
        var old;
        if (methodName in console && (old = console[methodName])) {
          // Checks to see if `methodName` is defined on `console` and has valid function to execute
          // (and stores the old handler)
          // This is important so that undefined methods aren't filled in
          console[methodName] = function () {
            // Overwrites current console method with this function
            var args, argsForAll, i, j;
            // Copy all arguments passed to handler
            args = A.slice.call(arguments, 0);
            for (i = 0, j = methodObj[methodName].handlers.length; i < j; i++) {
              // Loop over all stored handlers for this specific method and call them
              F.apply.call(methodObj[methodName].handlers[i], console, args);
            }
            for (i = 0, j = allHandlers.length; i < j; i++) {
              // Loop over all stored handlers for ALL events and call them
              argsForAll = [methodName];
              A.push.apply(argsForAll, args);
              F.apply.call(allHandlers[i], console, argsForAll);
            }
            // Calls old
            F.apply.call(old, console, args);
          };
        }
        return console[methodName] || empty;
      };
    } else {
      func = empty;
    }

    return func;
  }());

  // Loop through all standard console methods and add a wrapper function that calls stored handlers
  (function () {
    var i, j, cur;
    for (i = 0, j = consoleMethods.length; i < j; i++) {
      // Loop through all valid console methods
      cur = consoleMethods[i];
      methodObj[cur] = {
        handlers: []
      };
      fixConsoleMethod(cur);
    }
  }());

  // Main handler exposed
  consoleOn = function (methodName, callback) {
    var key, cur;
    if (O.toString.call(methodName) === '[object Object]') {
      // Object literal provided as first argument
      for (key in methodName) {
        // Loop through all keys in object literal
        cur = methodName[key];
        if (key === 'all') {
          // If targeting all events
          allHandlers.push(cur);
        } else if (key in methodObj) {
          // If targeting specific valid event
          methodObj[key].handlers.push(cur);
        }
      }
    } else if (typeof methodName === 'function') {
      // Function provided as first argument
      allHandlers.push(methodName);
    } else if (methodName in methodObj) {
      // Valid String event provided
      methodObj[methodName].handlers.push(callback);
    }
  };

  // Actually expose an interface
  w.ConsoleListener = {
    on: consoleOn
  };
}(this));

/**
 * Map Picker
 */
var woogosendMapPicker = {
	params: {},
	origin_lat: '',
	origin_lng: '',
	origin_address: '',
	zoomLevel: 16,
	apiKeyErrorCheckInterval: null,
	apiKeyError: '',
	editingAPIKey: false,
	init: function (params) {
		woogosendMapPicker.params = params;
		woogosendMapPicker.apiKeyError = '';
		woogosendMapPicker.editingAPIKey = false;

		ConsoleListener.on('error', function (errorMessage) {
			if (errorMessage.toLowerCase().indexOf('google') !== -1) {
				woogosendMapPicker.apiKeyError = errorMessage;
			}

			if ($('.gm-err-message').length) {
				$('.gm-err-message').replaceWith('<p style="text-align:center">' + woogosendMapPicker.convertError(errorMessage) + '</p>');
			}
		});

		$('[data-link="api_key"]').each(function () {
			$(this).after(wp.template('woogosend-button')({
				href: '#',
				class: 'woogosend-buttons--has-icon woogosend-api-key-button',
				text: '<span class="dashicons"></span>',
			}));
		});

		// Edit Api Key
		$(document).off('focus', '[data-link="api_key"]');
		$(document).on('focus', '[data-link="api_key"]', function () {
			if ($(this).prop('readonly') && !$(this).hasClass('loading')) {
				$(this).data('value', $(this).val()).prop('readonly', false);
			}
		});

		$(document).off('blur', '[data-link="api_key"]');
		$(document).on('blur', '[data-link="api_key"]', function () {
			if (!$(this).prop('readonly') && !$(this).hasClass('editing')) {
				$(this).data('value', undefined).prop('readonly', true);
			}
		});

		$(document).off('input', '[data-link="api_key"]', woogosendMapPicker.handleApiKeyInput);
		$(document).on('input', '[data-link="api_key"]', woogosendMapPicker.handleApiKeyInput);

		// Edit Api Key
		$(document).off('click', '.woogosend-api-key-button', woogosendMapPicker.editApiKey);
		$(document).on('click', '.woogosend-api-key-button', woogosendMapPicker.editApiKey);

		// Show Store Location Picker
		$(document).off('click', '.woogosend-field--origin');
		$(document).on('click', '.woogosend-field--origin', function () {
			if ($(this).prop('readonly')) {
				$('.woogosend-edit-location-picker').trigger('click');
			}
		});

		// Show Store Location Picker
		$(document).off('focus', '[data-link="location_picker"]', woogosendMapPicker.showLocationPicker);
		$(document).on('focus', '[data-link="location_picker"]', woogosendMapPicker.showLocationPicker);

		// Hide Store Location Picker
		$(document).off('click', '#woogosend-btn--map-cancel', woogosendMapPicker.hideLocationPicker);
		$(document).on('click', '#woogosend-btn--map-cancel', woogosendMapPicker.hideLocationPicker);

		// Apply Store Location
		$(document).off('click', '#woogosend-btn--map-apply', woogosendMapPicker.applyLocationPicker);
		$(document).on('click', '#woogosend-btn--map-apply', woogosendMapPicker.applyLocationPicker);

		// Toggle Map Search Panel
		$(document).off('click', '#woogosend-map-search-panel-toggle', woogosendMapPicker.toggleMapSearch);
		$(document).on('click', '#woogosend-map-search-panel-toggle', woogosendMapPicker.toggleMapSearch);
	},
	validateAPIKeyBothSide: function ($input) {
		woogosendMapPicker.validateAPIKeyServerSide($input, woogosendMapPicker.validateAPIKeyBrowserSide);
	},
	validateAPIKeyBrowserSide: function ($input) {
		woogosendMapPicker.apiKeyError = '';

		woogosendMapPicker.initMap($input.val(), function () {
			var geocoderArgs = {
				latLng: new google.maps.LatLng(parseFloat(woogosendMapPicker.params.defaultLat), parseFloat(woogosendMapPicker.params.defaultLng)),
			};

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode(geocoderArgs, function (results, status) {
				if (status.toLowerCase() === 'ok') {
					console.log('validateAPIKeyBrowserSide', results);

					$input.addClass('valid');

					setTimeout(function () {
						$input.removeClass('editing loading valid');
					}, 2000);
				}
			});

			clearInterval(woogosendMapPicker.apiKeyErrorCheckInterval);

			woogosendMapPicker.apiKeyErrorCheckInterval = setInterval(function () {
				if ($input.hasClass('valid') || woogosendMapPicker.apiKeyError) {
					clearInterval(woogosendMapPicker.apiKeyErrorCheckInterval);
				}

				if (woogosendMapPicker.apiKeyError) {
					woogosendMapPicker.showError($input, woogosendMapPicker.apiKeyError);
					$input.prop('readonly', false).removeClass('loading');
				}
			}, 300);
		});
	},
	validateAPIKeyServerSide: function ($input, onSuccess) {
		$.ajax({
			method: 'POST',
			url: woogosendMapPicker.params.ajax_url,
			data: {
				action: 'woogosend_validate_api_key_server',
				nonce: woogosendMapPicker.params.validate_api_key_nonce,
				key: $input.val(),
			}
		}).done(function (response) {
			console.log('validateAPIKeyServerSide', response);

			if (typeof onSuccess === 'function') {
				onSuccess($input);
			} else {
				$input.addClass('valid');

				setTimeout(function () {
					$input.removeClass('editing loading valid');
				}, 2000);
			}
		}).fail(function (error) {
			if (error.responseJSON && error.responseJSON.data) {
				woogosendMapPicker.showError($input, error.responseJSON.data);
			} else if (error.statusText) {
				woogosendMapPicker.showError($input, error.statusText);
			} else {
				woogosendMapPicker.showError($input, 'Google Distance Matrix API error: Uknown');
			}

			$input.prop('readonly', false).removeClass('loading');
		});
	},
	showError: function ($input, errorMessage) {
		$('<div class="error notice woogosend-error-box"><p>' + woogosendMapPicker.convertError(errorMessage) + '</p></div>')
			.hide()
			.appendTo($input.closest('td'))
			.slideDown();
	},
	removeError: function ($input) {
		$input.closest('td')
			.find('.woogosend-error-box')
			.remove();
	},
	convertError: function (text) {
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
	},
	handleApiKeyInput: function (e) {
		var $input = $(e.currentTarget);

		if ($input.val() === $input.data('value')) {
			$input.removeClass('editing').next('.woogosend-edit-api-key').removeClass('editing');
		} else {
			$input.addClass('editing').next('.woogosend-edit-api-key').addClass('editing');
		}

		woogosendMapPicker.removeError($input);
	},
	editApiKey: function (e) {
		e.preventDefault();

		var $input = $(this).blur().prev('input');

		if (!$input.hasClass('editing') || $input.hasClass('loading')) {
			return;
		}

		$input.prop('readonly', true).addClass('loading');

		if ($input.attr('data-key') === 'api_key') {
			woogosendMapPicker.validateAPIKeyServerSide($input);
		} else {
			woogosendMapPicker.validateAPIKeyBrowserSide($input);
		}

		woogosendMapPicker.removeError($input);
	},
	showLocationPicker: function (event) {
		event.preventDefault();

		$(this).blur();

		woogosendMapPicker.apiKeyError = '';

		var api_key_picker = $('#woocommerce_woogosend_api_key_picker').val();

		if (woogosendMapPicker.isEditingAPIKey()) {
			return window.alert(woogosendError('finish_editing_api'));
		} else if (!api_key_picker.length) {
			return window.alert(woogosendError('api_key_picker_empty'));
		}

		$('.modal-close-link').hide();

		woogosendToggleButtons({
			btn_left: {
				id: 'map-cancel',
				label: woogosendI18n('buttons.Cancel'),
				icon: 'undo'
			},
			btn_right: {
				id: 'map-apply',
				label: woogosendI18n('buttons.Apply Changes'),
				icon: 'editor-spellcheck'
			}
		});

		$('#woogosend-field-group-wrap--location_picker').fadeIn().siblings().hide();

		var $subTitle = $('#woogosend-field-group-wrap--location_picker').find('.wc-settings-sub-title').first().addClass('woogosend-hidden');

		$('.wc-backbone-modal-header').find('h1').append('<span>' + $subTitle.text() + '</span>');

		woogosendMapPicker.initMap(api_key_picker, woogosendMapPicker.renderMap);
	},
	hideLocationPicker: function (e) {
		e.preventDefault();

		woogosendMapPicker.destroyMap();

		$('.modal-close-link').show();

		woogosendToggleButtons();

		$('#woogosend-field-group-wrap--location_picker').find('.wc-settings-sub-title').first().removeClass('woogosend-hidden');

		$('.wc-backbone-modal-header').find('h1 span').remove();

		$('#woogosend-field-group-wrap--location_picker').hide().siblings().not('.woogosend-hidden').fadeIn();
	},
	applyLocationPicker: function (e) {
		e.preventDefault();

		if (!woogosendMapPicker.apiKeyError) {
			$('#woocommerce_woogosend_origin_lat').val(woogosendMapPicker.origin_lat);
			$('#woocommerce_woogosend_origin_lng').val(woogosendMapPicker.origin_lng);
			$('#woocommerce_woogosend_origin_address').val(woogosendMapPicker.origin_address);
		}

		woogosendMapPicker.hideLocationPicker(e);
	},
	toggleMapSearch: function (e) {
		e.preventDefault();

		$('#woogosend-map-search-panel').toggleClass('expanded');
	},
	initMap: function (apiKey, callback) {
		woogosendMapPicker.destroyMap();

		if (_.isEmpty(apiKey)) {
			apiKey = 'InvalidKey';
		}

		$.getScript('https://maps.googleapis.com/maps/api/js?libraries=geometry,places&key=' + apiKey, callback);
	},
	renderMap: function () {
		woogosendMapPicker.origin_lat = $('#woocommerce_woogosend_origin_lat').val();
		woogosendMapPicker.origin_lng = $('#woocommerce_woogosend_origin_lng').val();

		var currentLatLng = {
			lat: _.isEmpty(woogosendMapPicker.origin_lat) ? parseFloat(woogosendMapPicker.params.defaultLat) : parseFloat(woogosendMapPicker.origin_lat),
			lng: _.isEmpty(woogosendMapPicker.origin_lng) ? parseFloat(woogosendMapPicker.params.defaultLng) : parseFloat(woogosendMapPicker.origin_lng)
		};

		var map = new google.maps.Map(
			document.getElementById('woogosend-map-canvas'),
			{
				mapTypeId: 'roadmap',
				center: currentLatLng,
				zoom: woogosendMapPicker.zoomLevel,
				streetViewControl: false,
				mapTypeControl: false
			}
		);

		var marker = new google.maps.Marker({
			map: map,
			position: currentLatLng,
			draggable: true,
			icon: woogosendMapPicker.params.marker
		});

		var infowindow = new google.maps.InfoWindow({ maxWidth: 350 });

		if (_.isEmpty(woogosendMapPicker.origin_lat) || _.isEmpty(woogosendMapPicker.origin_lng)) {
			infowindow.setContent(woogosendMapPicker.params.i18n.drag_marker);
			infowindow.open(map, marker);
		} else {
			woogosendMapPicker.setLatLng(marker.position, marker, map, infowindow);
		}

		google.maps.event.addListener(marker, 'dragstart', function () {
			infowindow.close();
		});

		google.maps.event.addListener(marker, 'dragend', function (event) {
			woogosendMapPicker.setLatLng(event.latLng, marker, map, infowindow);
		});

		$('#woogosend-map-wrap').prepend(wp.template('woogosend-map-search-panel')());
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('woogosend-map-search-panel'));

		var mapSearchBox = new google.maps.places.SearchBox(document.getElementById('woogosend-map-search-input'));

		// Bias the SearchBox results towards current map's viewport.
		map.addListener('bounds_changed', function () {
			mapSearchBox.setBounds(map.getBounds());
		});

		var markers = [];

		// Listen for the event fired when the user selects a prediction and retrieve more details for that place.
		mapSearchBox.addListener('places_changed', function () {
			var places = mapSearchBox.getPlaces();

			if (places.length === 0) {
				return;
			}

			// Clear out the old markers.
			markers.forEach(function (marker) {
				marker.setMap(null);
			});

			markers = [];

			// For each place, get the icon, name and location.
			var bounds = new google.maps.LatLngBounds();

			places.forEach(function (place) {
				if (!place.geometry) {
					console.log('Returned place contains no geometry');
					return;
				}

				marker = new google.maps.Marker({
					map: map,
					position: place.geometry.location,
					draggable: true,
					icon: woogosendMapPicker.params.marker
				});

				woogosendMapPicker.setLatLng(place.geometry.location, marker, map, infowindow);

				google.maps.event.addListener(marker, 'dragstart', function () {
					infowindow.close();
				});

				google.maps.event.addListener(marker, 'dragend', function (event) {
					woogosendMapPicker.setLatLng(event.latLng, marker, map, infowindow);
				});

				// Create a marker for each place.
				markers.push(marker);

				if (place.geometry.viewport) {
					// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});

			map.fitBounds(bounds);
		});

		setTimeout(function () {
			$('#woogosend-map-search-panel').removeClass('woogosend-hidden');
		}, 500);
	},
	destroyMap: function () {
		if (window.google) {
			window.google = undefined;
		}

		$('#woogosend-map-canvas').empty();
		$('#woogosend-map-search-panel').remove();
	},
	setLatLng: function (location, marker, map, infowindow) {
		var geocoder = new google.maps.Geocoder();

		geocoder.geocode(
			{
				latLng: location
			},
			function (results, status) {
				if (status === google.maps.GeocoderStatus.OK && results[0]) {
					var infowindowContents = [
						woogosendMapPicker.params.i18n.latitude + ': ' + location.lat().toString(),
						woogosendMapPicker.params.i18n.longitude + ': ' + location.lng().toString()
					];

					infowindow.setContent(infowindowContents.join('<br />'));
					infowindow.open(map, marker);

					marker.addListener('click', function () {
						infowindow.open(map, marker);
					});

					$('#woogosend-map-search-input').val(results[0].formatted_address);

					woogosendMapPicker.origin_lat = location.lat();
					woogosendMapPicker.origin_lng = location.lng();
					woogosendMapPicker.origin_address = results[0].formatted_address;
				}
			}
		);

		map.setCenter(location);
	},
	isEditingAPIKey: function () {
		return $('[data-link="api_key"].editing').length > 0;
	},
};

/**
 * Backend Scripts
 */

var woogosendBackend = {
	renderForm: function () {
		if (!$('#woocommerce_woogosend_origin_type') || !$('#woocommerce_woogosend_origin_type').length) {
			return;
		}

		// Submit form
		$(document).off('click', '#woogosend-btn--save-settings', woogosendBackend.submitForm);
		$(document).on('click', '#woogosend-btn--save-settings', woogosendBackend.submitForm);

		// Toggle Store Origin Fields
		$(document).off('change', '#woocommerce_woogosend_origin_type', woogosendBackend.toggleStoreOriginFields);
		$(document).on('change', '#woocommerce_woogosend_origin_type', woogosendBackend.toggleStoreOriginFields);

		$('#woocommerce_woogosend_origin_type').trigger('change');

		$('.wc-modal-shipping-method-settings table.form-table').each(function () {
			var $table = $(this);
			var $rows = $table.find('tr');

			if (!$rows.length) {
				$table.remove();
			}
		});

		$('.woogosend-field-group').each(function () {
			var $fieldGroup = $(this);

			var fieldGroupId = $fieldGroup
				.attr('id')
				.replace('woocommerce_woogosend_field_group_', '');

			var $fieldGroupDescription = $fieldGroup
				.next('p')
				.detach();

			var $fieldGroupTable = $fieldGroup
				.nextAll('table.form-table')
				.first()
				.attr('id', 'woogosend-table--' + fieldGroupId)
				.addClass('woogosend-table woogosend-table--' + fieldGroupId)
				.detach();

			$fieldGroup
				.wrap('<div id="woogosend-field-group-wrap--' + fieldGroupId + '" class="woogosend-field-group-wrap stuffbox woogosend-field-group-wrap--' + fieldGroupId + '"></div>');

			$fieldGroupDescription
				.appendTo('#woogosend-field-group-wrap--' + fieldGroupId);

			$fieldGroupTable
				.appendTo('#woogosend-field-group-wrap--' + fieldGroupId);

			if ($fieldGroupTable && $fieldGroupTable.length) {
				if ($fieldGroup.hasClass('woogosend-field-group-hidden')) {
					$('#woogosend-field-group-wrap--' + fieldGroupId)
						.addClass('woogosend-hidden');
				}
			} else {
				$('#woogosend-field-group-wrap--' + fieldGroupId).remove();
			}
		});

		$('.woogosend-field').each(function () {
			var $field = $(this);
			var fieldUnit = $field.attr('data-unit');

			if (!fieldUnit) {
				return;
			}

			$field.next('.woogosend-field-unit').remove();
			$field.after('<span class="woogosend-field-unit">' + fieldUnit + '</span>');
		});

		var params = _.mapObject(woogosend_backend, function (val, key) {
			switch (key) {
				case 'default_lat':
				case 'default_lng':
				case 'test_destination_lat':
				case 'test_destination_lng':
					return parseFloat(val);

				default:
					return val;
			}
		});

		woogosendMapPicker.init(params);

		woogosendToggleButtons();
	},
	maybeOpenModal: function () {
		// Try show settings modal on settings page.
		if (woogosend_backend.showSettings) {
			setTimeout(function () {
				var isMethodAdded = false;
				var methods = $(document).find('.wc-shipping-zone-method-type');
				for (var i = 0; i < methods.length; i++) {
					var method = methods[i];
					if ($(method).text() === woogosend_backend.methodTitle) {
						$(method).closest('tr').find('.row-actions .wc-shipping-zone-method-settings').trigger('click');
						isMethodAdded = true;
						return;
					}
				}

				// Show Add shipping method modal if the shipping is not added.
				if (!isMethodAdded) {
					$('.wc-shipping-zone-add-method').trigger('click');
					$('select[name="add_method_id"]').val(woogosend_backend.methodId).trigger('change');
				}
			}, 500);
		}
	},
	submitForm: function (e) {
		e.preventDefault();

		if (woogosendMapPicker.isEditingAPIKey()) {
			window.alert(woogosendError('finish_editing_api'));
		} else {
			$('#btn-ok').trigger('click');
		}
	},
	toggleStoreOriginFields: function (e) {
		e.preventDefault();
		var selected = $(this).val();
		var fields = $(this).data('fields');
		_.each(fields, function (fieldIds, fieldValue) {
			_.each(fieldIds, function (fieldId) {
				if (fieldValue !== selected) {
					$('#' + fieldId).closest('tr').hide();
				} else {
					$('#' + fieldId).closest('tr').show();
				}
			});
		});
	},
	initForm: function () {
		// Init form
		$(document.body).off('wc_backbone_modal_loaded', woogosendBackend.renderForm);
		$(document.body).on('wc_backbone_modal_loaded', woogosendBackend.renderForm);
	},
	init: function () {
		woogosendBackend.initForm();
		woogosendBackend.maybeOpenModal();
	}
};

$(document).ready(woogosendBackend.init);
}(jQuery));
