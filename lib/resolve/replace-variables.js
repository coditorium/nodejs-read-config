'use strict';

var deep = require('./deep');

module.exports = replaceVariables;

function replaceVariables(marker, config, values, opts) {
	opts = opts || {};
	var text = JSON.stringify(config);
	text = secureTemplate(text, marker, values, opts);
	return JSON.parse(text);
}

function secureTemplate(txt, marker, values, opts) {
	var escapedMarker = escapeRegExp(marker),
		tokens = matchRegExpGroup(txt, new RegExp(escapedMarker + '{\\ *([^' + escapedMarker + '}]+)\\ *}', 'g'));

	tokens.forEach(function(token) {
		var tokenChunks = token.split('|'),
			tokenValue = tokenChunks[0],
			tokenDefValue = tokenChunks.length > 0 ? tokenChunks[1] : null,
			pick = deep.pick(values, tokenValue);
		if (pick) {
			txt = insertValue(txt, marker, token, pick.value);
		} else if (tokenDefValue) {
			txt = insertDefaultValue(txt, escapedMarker, token, tokenDefValue);
		} else if (!opts.skipUnresolved) {
			throw new Error('Unresolved configuration variable: ' + token);
		}
	});
	return txt;
}

function insertValue(txt, marker, token, pickValue) {
	var value = pickValue;
	value = typeof value === 'string' ? ('\"' + value + '\"') : value;
	value = typeof value === 'object' ? JSON.stringify(value) : value;
	txt = txt.replace(escapedRegExp('\"' + marker + '{' + token + '}\"', 'g'), value);
	value = pickValue;
	value = typeof value === 'object' ? JSON.stringify(value).replace(/\"/g, '\\"') : value;
	txt = txt.replace(escapedRegExp(marker + '{' + token + '}', 'g'), value);
	return txt;
}

function insertDefaultValue(txt, marker, token, tokenDefValue) {
	var value = tokenDefValue;
	value = (value === 'true' || value === 'false') ? value === 'true' : value;
	value = value === 'null' ? null : value;
	value = /^[+-]?\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value;
	txt = txt.replace(escapedRegExp('\"' + marker + '{' + token + '}\"', 'g'),
		typeof value === 'string' ? ('\"' + value + '\"') : value);
	txt = txt.replace(escapedRegExp(marker + '{' + token + '}', 'g'), tokenDefValue);
	return txt;
}

function escapedRegExp(str, opts) {
	return new RegExp(escapeRegExp(str), opts);
}

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function matchRegExpGroup(txt, regexp) {
	var tokens = [],
		match = regexp.exec(txt);

	while (match != null) {
		tokens.push(match[1]);
		match = regexp.exec(txt);
	}
	return tokens;
}
