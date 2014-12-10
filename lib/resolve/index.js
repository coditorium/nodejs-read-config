'use strict';

var replaceVariables = require('./replace-variables');

module.exports = function(config, opts) {
	opts = opts || {};
	config = replaceEnvVariables(config, opts.replaceEnv, opts);
	config = replaceLocalVariables(config, opts.replaceLocal, opts);
	return config;
};

function replaceEnvVariables(config, marker, opts) {
	if (marker) {
		try {
			return replaceVariables(marker, config, process.env, opts);
		} catch(e) {
			throw new Error('Could not resolve environment variable. ' + e.message);
		}
	} else {
		return config;
	}
}

function replaceLocalVariables(config, marker, opts) {
	if (marker) {
		try {
			return replaceVariables(marker, config, config, opts);
		} catch(e) {
			throw new Error('Could not resolve environment variable. ' + e.message);
		}
	} else {
		return config;
	}
}
