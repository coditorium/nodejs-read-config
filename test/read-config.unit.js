'use strict';

var libmodule = '../index',
	loadConfig = requireLib(libmodule),
	path = require('path'),
	expect = require('chai').expect;

function convertSync2Async(sync) {
	return function(paths, opts, callback) {
		var result;
		callback = callback || opts;
		opts = typeof opts === 'function' ? null : opts;
		try {
			result = sync(paths, opts);
		} catch(e) {
			return callback(e);
		}
		callback(null, result);
	};
}

cases(libmodule + ' deafult mode test:', convertSync2Async(loadConfig));
cases(libmodule + ' async test:', loadConfig.async);
cases(libmodule + ' sync test:', convertSync2Async(loadConfig.sync));

function cases(name, loadConfig) {

	function absolute(filepath) {
		return path.resolve(__dirname, filepath);
	}

	describe(name, function() {

		describe('should throw error on', function() {

			it('basedir not found', function(done) {
				loadConfig('xxx', { basedir: absolute('xxx') }, function(err) {
					expect(err).to.exist;
					done();
				});
			});

			it('paths of incorrect type', function(done) {
				loadConfig(123, function(err) {
					expect(err).to.exist;
					done();
				});
			});

			it('opts of incorrect type', function(done) {
				loadConfig('xxx', 123, function(err) {
					expect(err).to.exist;
					done();
				});
			});

			it('the same replace markers', function(done) {
				loadConfig('xxx', { replace: { env:'x', local: 'x' } }, function(err) {
					expect(err).to.exist;
					done();
				});
			});

		});

		it('should load complex config definition', function(done) {
			process.env['CONFIG_LOADER_TEST_VAR_B'] = 'config-loader-test-var-b';
			loadConfig([
				absolute('configs/other/config-default.json'),
				absolute('configs/config-a2.json'),
				'../subfolder/config-b3.json'
			], {
				basedir: absolute('configs/basedir')
			}, function(err, config) {
				expect(err).to.not.exist;
				expect(config).to.exist;
				expect(config).to.be.eql({
					default: true,
					a1: 'a1',
					a2: 'a2',
					b1: 'b1',
					b2: 'b2',
					b3: 'b3',
					'env-var': 'config-loader-test-var-b',
					'local-var': 'a1',
					'env-var-with-default': 999
				});
				done();
			});
		});

	});
}
