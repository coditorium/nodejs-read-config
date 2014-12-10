'use strict';

var libmodule = 'load/load-config',
	loadConfig = requireLib(libmodule),
	path = require('path'),
	expect = require('chai').expect,
	configWithoutQuotes = path.resolve(__dirname, 'configs/config-without-quotes.json'),
	configWithComments = path.resolve(__dirname, 'configs/config-with-comments.json'),
	configSimple = path.resolve(__dirname, 'configs/config.json');

cases(libmodule + ' async test:', loadConfig.async);
cases(libmodule + ' sync test:', function(path, callback) {
	var result = loadConfig.sync(path);
	callback(null, result);
});

function cases(name, loadConfig) {

	describe(name, function() {

		function check(filepath, done) {
			loadConfig(filepath, function(err, loadedConfig) {
				expect(err).to.not.exist;
				expect(loadedConfig).to.eql({ a: 1 });
				done();
			});
		}

		it('should load simple config file', function(done) {
			check(configSimple, done);
		});

		it('should load config file with comments', function(done) {
			check(configWithComments, done);
		});

		it('should load config file without quotes', function(done) {
			check(configWithoutQuotes, done);
		});

	});

}
