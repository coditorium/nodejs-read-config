'use strict';

var extnames = require('./parse').extnames,
	path = require('path'),
	async = require('async'),
	fs = require('fs');

module.exports.async = function(filepath, basedirs, callback) {
	if (typeof basedirs === 'function') {
		callback = basedirs;
		basedirs = [];
	}
	async.filter(lookupPaths(filepath, basedirs), fs.exists, function(existingPaths) {
		callback(existingPaths.length ? existingPaths[0] : null);
	});
};

module.exports.sync = function(filepath, basedirs) {
	var paths;
	basedirs = basedirs || [];
	paths = lookupPaths(filepath, basedirs).filter(fs.existsSync);
	return paths.length ? paths[0] : null;
};

function lookupPaths(filepath, basedirs) {
	var paths = [];
	if (!filepath) return paths;
	filepath = endsWith(filepath, extnames) ? filepath : filepath + '.json';
	if (isAbsolute(filepath)) return [filepath];
	basedirs.forEach(function(basedir) {
		if (basedir) paths.push(path.resolve(basedir, filepath));
	});
	return paths;
}

function isAbsolute(filepath) {
	return path.resolve(filepath) === path.normalize(filepath);
}

function endsWith(text, suffixes) {
	return suffixes.some(function(suffix) {
		return text.length >= suffix.length && text.substr(text.length - suffix.length) === suffix;
	});
}
