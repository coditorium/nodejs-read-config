'use strict';

var merge = require('lodash').merge,
	fs = require('fs'),
	load = require('./load'),
	resolve = require('./resolve');

module.exports = sync;
module.exports.sync = sync;
module.exports.async = async;

function async(paths, opts, callback) {
	var err;
	if (typeof opts === 'function' && !callback) {
		callback = opts;
		opts = {};
	}
	opts = defaultOptions(opts);
	err = validateParams(paths, opts, callback);
	if (err) {
		if (typeof callback === 'function') return callback(err);
		throw err;
	}

	load.async(paths, opts, function(err, config) {
		if (err) return callback(err);
		try {
			config = resolve(config, opts);
		} catch(e) {
			return callback(e);
		}
		callback(null, config);
	});
}

function sync(paths, opts) {
	var err, config;
	opts = defaultOptions(opts);
	err = validateParams(paths, opts);
	if (err) throw err;
	config = load.sync(paths, opts);
	config = resolve(config, opts);
	return config;
}

function validateParams(paths, opts, callback) {
	if (opts && typeof opts !== 'object') {
		return new Error('Expected parameter with options');
	}
	if (callback && typeof callback !== 'function') {
		return new Error('Expected callback parameter');
	}
	if (typeof paths !== 'string' && !Array.isArray(paths)) {
		return new Error('Expected a string (or array) with configuration file path');
	}
	if (opts.replaceLocal && opts.replaceLocal && opts.replaceLocal === opts.replaceEnv) {
		return new Error('Values opts.replaceLocal and opts.replaceEnv must be different');
	}
	if (opts.basedir && !fs.existsSync(opts.basedir)) {
		return new Error('Base directory not found: ' + opts.basedir);
	}
}

function defaultOptions(opts) {
	return merge({
		parentField: '__parent',
		basedir: null,
		replaceEnv: '%',
		replaceLocal: '@',
		skipUnresolved: false,
		freeze: false
	}, opts);
}
