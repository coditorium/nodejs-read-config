'use strict';

var replaceVariables = require('./replace-variables'),
	freeze = require('./freeze');

module.exports = function(config, opts) {
	opts = opts || {};
	if (opts.replaceEnv) {
		config = replaceEnvVariables(config, opts.replaceEnv, opts);
	}
	if (opts.replaceLocal) {
		config = replaceLocalVariables(config, opts.replaceLocal, opts);
	}
	config = freeze(config);
	return config;
};

function replaceEnvVariables(config, marker, opts) {
	try {
		return replaceVariables(marker, config, process.env, opts);
	} catch(e) {
		throw new Error('Could not resolve environment variable. ' + e.message);
	}
}

function replaceLocalVariables(config, marker, opts) {
	try {
		return replaceVariables(marker, config, config, opts);
	} catch(e) {
		throw new Error('Could not resolve local variable. ' + e.message);
	}
}
