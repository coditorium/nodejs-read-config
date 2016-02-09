'use strict';

const util = require('util'),
    pkgName = require('../package').name,
    defaults = require('lodash').defaults,
    ReadConfigError = require('./read-config-error'),
    compMapping = {
        basedir: 'cwd',
        replaceEnv: 'systemVars',
        replaceLocal: 'configVars',
        skipUnresolved: 'unresolvedVars',
        freeze: false
    };

module.exports = function(opts) {
    preValidate(opts);
    opts = defaults({}, opts || {}); // copy or create empty object
    opts = compatibility(opts);
    opts = defaultOptions(opts);
    postValidate(opts);
    return opts;
};

function compatibility(opts) {
    Object.keys(compMapping)
        .filter((prevName) => opts.hasOwnProperty(prevName))
        .forEach((prevName) => {
            const newName = compMapping[prevName];
            if (newName) {
                opts[newName] = opts[prevName];
                markDeprecated(`opts.${prevName} is depreacated. Use opts.${newName} instead.`);
            } else {
                markDeprecated(`opts.${prevName} is deprecated and was removed.`);
            }
            delete opts[prevName];
        });
    return opts;
}

function defaultOptions(opts) {
    return defaults(opts, {
        parentField: '__parent',
        cwd: process.cwd(),
        configVars: '@',
        systemVars: '%',
        systemOverrides: false,
        unresolvedVars: false,
        unresolvedConfigs: false
    });
}

function preValidate(opts) {
    if (opts && typeof opts !== 'object') {
        throw new ReadConfigError(`Expected options parameter objects. Intead received: ${opts}`);
    }
    if (opts.cwd === null) {
        throw new ReadConfigError(`Expected opts.cwd to be a string. Intead received: ${opts.cwd}`);
    }
}

function postValidate(opts) {
    if (opts.parentField && typeof opts.parentField !== 'string') {
        throw new ReadConfigError(`Expected opts.parentField to be a string or null. Received: ${opts.parentField}`);
    }
    if (opts.configVars && typeof opts.configVars !== 'string') {
        throw new ReadConfigError(`Expected opts.configVars to be a string or null. Received: ${opts.configVars}`);
    }
    if (opts.systemVars && typeof opts.systemVars !== 'string') {
        throw new ReadConfigError(`Expected opts.configVars to be a string or null. Received: ${opts.systemVars}`);
    }
    if (opts.configVars && opts.systemVars && opts.configVars === opts.systemVars) {
        throw new ReadConfigError('Values opts.configVars and opts.systemVars must be different');
    }
    if (typeof opts.cwd !== 'string') {
        throw new ReadConfigError(`Expected opts.cwd to be a string. Received: ${opts.cwd}`);
    }
    if (opts.systemOverrides !== null && typeof opts.systemOverrides !== 'boolean') {
        throw new ReadConfigError(`Expected opts.systemOverride to be a boolean flag. Received: ${opts.systemOverrides}`);
    }
    if (opts.unresolvedVars !== null && typeof opts.unresolvedVars !== 'boolean') {
        throw new ReadConfigError(`Expected opts.unresolvedVars to be a boolean flag. Received: ${opts.unresolvedVars}`);
    }
    if (opts.unresolvedConfigs !== null && typeof opts.unresolvedConfigs !== 'boolean' && !isArrayOfStringsOrRegexes(opts.unresolvedConfigs)) {
        throw new ReadConfigError(`Expected opts.unresolvedConfigs to be a boolean flag or a string or an array of strings. Received: ${opts.unresolvedConfigs}`);
    }
}

function isArrayOfStringsOrRegexes(value) {
    return Array.isArray(value) && value.every((v) => v instanceof RegExp || typeof v === 'string');
}

function markDeprecated(msg) {
    util.deprecate(() => {}, `[${pkgName}] ${msg}`)();
}
