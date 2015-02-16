'use strict';

var deep = require('./deep'),
	path = require('path');

module.exports = replaceVariables;

function replaceVariables(marker, config, values, opts) {
	return resolve('', config, marker, values, opts || {});
}

function resolve(prop, config, marker, values, opts) {
	var result;
	if (typeof config === 'string') {
		result = resolveValue(prop, config, marker, values, opts);
	} else if (Array.isArray(config)) {
		result = [];
		prop += prop.length ? '.' : '';
		config.forEach(function(item, idx) {
			result.push(resolve(prop + idx, item, marker, values, opts));
		});
	} else if (typeof config === 'object') {
		result = {};
		prop += prop.length ? '.' : '';
		Object.keys(config).forEach(function(key) {
			result[key] = resolve(prop + key, config[key], marker, values, opts);
		});
	} else {
		result = config;
	}
	return result;
}

function resolveValue(prop, value, marker, values, opts) {
	var escapedMarker = escapeRegExp(marker),
		tokens = matchRegExpGroup(value, new RegExp(escapedMarker + '{\\ *([^' + escapedMarker + '}]+)\\ *}', 'g'));

	tokens.forEach(function(token) {
		var tokenChunks = token.split('|'),
			tokenValue = tokenChunks[0],
			tokenDefValue = tokenChunks.length > 0 ? tokenChunks[1] : null,
			pick = deep.pick(values, resolveRelativeProperty(prop, tokenValue));
		if (pick) {
			value = insertValue(value, marker, token, pick.value);
		} else if (tokenDefValue) {
			value = insertDefaultValue(value, escapedMarker, token, tokenDefValue);
		} else if (!opts.skipUnresolved) {
			throw new Error('Unresolved configuration variable: ' + token);
		}
	});
	return value;
}

function resolveRelativeProperty(propPath, relPath) {
	if (relPath.indexOf('../') === 0) relPath = '../' + relPath;
	else if (relPath.indexOf('./') === 0) relPath = '.' + relPath;
	else return relPath;
	return path.join(propPath.replace(/\./g, '/'), relPath).replace(/\//g, '.');
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

	while(match != null) {
		tokens.push(match[1]);
		match = regexp.exec(txt);
	}
	return tokens;
}
