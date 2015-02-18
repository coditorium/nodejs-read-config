'use strict';

var mergeConfigs = require('./merge-configs'),
	parse = require('./parse'),
	resolvePath = require('./resolve-path'),
	path = require('path');

module.exports.async = function(configPath, opts, callback) {
	opts = opts || {};
	resolvePath.async(configPath, [opts.basedir], function(configResolvedPath) {
		if (!configResolvedPath) {
			if (isOptional(configPath, opts)) return callback(null, {});
			return callback(configNotFound(configPath));
		}
		mergeParentsAsync(configResolvedPath, opts, callback);
	});
};

module.exports.sync = function(configPath, opts) {
	opts = opts || {};
	var configResolvedPath = resolvePath.sync(configPath, [opts.basedir]);
	if (!configResolvedPath) {
		if (isOptional(configPath, opts)) return {};
		throw configNotFound(configPath);
	}
	return mergeParentsSync(configResolvedPath, opts);
};

function isOptional(configPath, opts) {
	if (!opts.optional) return false;
	return opts.optional.indexOf(configPath) >= 0;
}

function mergeParentsAsync(configPath, opts, callback) {
	var parentField = opts.parentField;
	callback = callback || opts;

	parse.load(configPath, function(err, config) {
		if (err) return callback(err);
		var parentPathValue = parentField ? config[parentField] : null,
			mergeParentsAsyncCallback = function(err, flatParent) {
				if (err) return callback(err);
				var result = mergeConfigs([flatParent || {}, config]);
				if (parentField) delete result[parentField];
				callback(null, result);
			};
		if (!parentPathValue) return callback(null, config);
		resolvePath.async(parentPathValue, [path.dirname(configPath), opts.basedir], function(parentPath) {
			if (!parentPath) {
				if (!isOptional(parentPathValue, opts)) return callback(parentConfigNotFound(parentPathValue, configPath));
				mergeParentsAsyncCallback(null, {});
			} else {
				mergeParentsAsync(parentPath, opts, mergeParentsAsyncCallback);
			}
		});
	});
}

function mergeParentsSync(configPath, opts) {
	var parentField = opts ? opts.parentField : null,
		config = parse.loadSync(configPath),
		parentPathValue = parentField ? config[parentField] : null,
		parentPath = resolvePath.sync(parentPathValue, [path.dirname(configPath), opts ? opts.basedir : null]),
		parentConfig, result;
	if (!parentPathValue) return config;
	if (!parentPath) {
		if (!isOptional(parentPathValue, opts)) throw parentConfigNotFound(parentPathValue, configPath);
		parentConfig = {};
	} else {
		parentConfig = mergeParentsSync(parentPath, opts);
	}
	result = mergeConfigs([parentConfig, config]);
	if (parentField) delete result[parentField];
	return result;
}

function configNotFound(configPath) {
	return new Error('Config file not found \'' + configPath);
}

function parentConfigNotFound(parentPath, configPath) {
	return new Error('Parent config file not found \'' + parentPath + '\' for ' + configPath);
}
