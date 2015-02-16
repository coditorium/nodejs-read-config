'use strict';

var libmodule = 'resolve/index',
	resolve = requireLib(libmodule),
	expect = require('chai').expect,
	opts = {
		replaceEnv: '%',
		replaceLocal: '@'
	};

describe(libmodule + ' test:', function() {

	describe('should replace config local variables', function() {

		it('with whole value', function() {
			var config = { a: '@{b}', b: 'x' },
				resolved = resolve(config, opts);
			expect(resolved).be.eql({ a: 'x', b: 'x' });
		});

		it('with partial value', function() {
			var config = { a: 'X@{b}X', b: 'x' },
				resolved = resolve(config, opts);
			expect(resolved).be.eql({ a: 'XxX', b: 'x' });
		});

		it('with embedded value', function() {
			var config = { a: '@{b.c}', b: { c: 'x' } },
				resolved = resolve(config, opts);
			expect(resolved).be.eql({ a: 'x', b: { c: 'x' } });
		});

	});

	describe('should replace system variables', function() {

		it('basic example', function() {
			process.env.CONFIG_LOADER_TEST_VAR = 'cofig-loader-test-var';
			var config = { a: '%{CONFIG_LOADER_TEST_VAR}' },
				resolved = resolve(config, opts);
			expect(resolved).be.eql({
				a: 'cofig-loader-test-var'
			});
		});

	});

	it('should replace env variables before local', function() {
		process.env.CONFIG_LOADER_TEST_VAR = 'cofig-loader-test-var';
		var config = { a: '%{CONFIG_LOADER_TEST_VAR}', b: '@{a}' },
			resolved = resolve(config, opts);
		expect(resolved).be.eql({
			a: 'cofig-loader-test-var',
			b: 'cofig-loader-test-var'
		});
	});

	it('should not resolve env variables', function() {
		process.env.CONFIG_LOADER_TEST_VAR = 'cofig-loader-test-var';
		var config = { a: '%{CONFIG_LOADER_TEST_VAR}', b: '@{a}' },
			resolved = resolve(config);
		expect(resolved).be.eql(config);
	});

	it('should throw error on unresolved variable', function() {
		expect(function() {
			resolve({ y: '%{x}' }, opts);
		}).to.throw('Could not resolve environment variable. Unresolved configuration variable: x');
	});

	it('should not throw error on unresolved variable', function() {
		expect(function() {
			resolve({ y: '%{x}' }, {
				replace: {
					env: '%',
					local: '@',
					skipUnresolved: true
				}
			});
		}).to.not.throw();
	});

});
