'use strict';

var mergeConfigs = require('./merge-configs'),
	loadConfig = require('./load-config'),
	resolvePath = require('./resolve-path'),
	path = require('path');

module.exports.async = function(configPath, opts, callback) {
	opts = opts || {};
	resolvePath.async(configPath, [opts.basedir], function(configResolvedPath) {
		if (!configResolvedPath) return callback(configNotFound(configPath));
		mergeParentsAsync(configResolvedPath, opts, callback);
	});
};

module.exports.sync = function(configPath, opts) {
	opts = opts || {};
	var configResolvedPath = resolvePath.sync(configPath, [opts.basedir]);
	if (!configResolvedPath) throw configNotFound(configPath);
	return mergeParentsSync(configResolvedPath, opts);
};

function mergeParentsAsync(configPath, opts, callback) {
	var parentField = opts.parentField;
	callback = callback || opts;

	loadConfig.async(configPath, opts, function(err, config) {
		if (err) return callback(err);
		var parentPathValue = parentField ? config[parentField] : null;
		if (!parentPathValue) return callback(null, config);
		resolvePath.async(parentPathValue, [path.dirname(configPath), opts.basedir], function(parentPath) {
			if (!parentPath) return callback(parentConfigNotFound(parentPathValue, configPath));
			mergeParentsAsync(parentPath, opts, function(err, flatParent) {
				if (err) return callback(err);
				var result = mergeConfigs([flatParent || {}, config]);
				if (parentField) delete result[parentField];
				callback(null, result);
			});
		});
	});
}

function mergeParentsSync(configPath, opts) {
	var parentField = opts ? opts.parentField : null,
		config = loadConfig.sync(configPath, opts),
		parentPathValue = parentField ? config[parentField] : null,
		parentPath = resolvePath.sync(parentPathValue, [path.dirname(configPath), opts ? opts.basedir : null]),
		parentConfig, result;
	if (!parentPathValue) return config;
	if (!parentPath) throw parentConfigNotFound(parentPathValue, configPath);
	parentConfig = mergeParentsSync(parentPath, opts);
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
