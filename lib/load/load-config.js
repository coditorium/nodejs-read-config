'use strict';

var json5 = require('json5'),
	fs = require('fs');

module.exports.async = function(filepath, basedirs, callback) {
	callback = callback || basedirs;
	fs.readFile(filepath, { encoding: 'utf8' }, function(err, content) {
		if (err) return callback(err);
		var parsed;
		try {
			parsed = json5.parse(content);
		} catch(e) {
			callback(e);
		}
		callback(null, parsed);
	});
};

module.exports.sync = function(filepath) {
	var content = fs.readFileSync(filepath, { encoding: 'utf8' });
	return json5.parse(content);
};
