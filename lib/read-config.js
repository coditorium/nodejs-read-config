'use strict';

const load = require('./load'),
    resolve = require('./resolve'),
    normalizeOptions = require('./normalize-options'),
    ReadConfigError = require('./read-config-error');

module.exports = generic;
module.exports.sync = sync;
module.exports.async = async;

function generic() {
    const resolvedArgs = resolveArgs(arguments);
    if (resolvedArgs.callback) {
        async(resolvedArgs.paths, resolvedArgs.opts, resolvedArgs.callback);
    } else {
        return sync(resolvedArgs.paths, resolvedArgs.opts);
    }
}

function resolveArgs(args) {
    const resolved = {
        paths: args[0]
    };
    if (!args[1]) return resolved;
    if (typeof args[1] === 'function') {
        resolved.callback = args[1];
        return;
    }
    resolved.opts = args[1];
    if (typeof args[2] === 'function') {
        resolved.callback = args[2];
    }
    return resolved;
}

function async(paths, opts, callback) {
    if (typeof opts === 'function' && !callback) {
        callback = opts;
        opts = {};
    }
    if (typeof callback !== 'function') {
        throw new ReadConfigError(`Expected callback parameter. Received: ${callback}`);
    }
    try {
        opts = normalizeOptions(opts);
        paths = normalizePaths(paths);
    } catch (e) {
        return callback(e);
    }
    load.async(paths, opts, (err, config) => {
        if (err) return callback(err);
        try {
            config = resolve(config, opts);
        } catch (e) {
            return callback(e);
        }
        callback(null, config);
    });
}

function sync(paths, opts) {
    let config;
    paths = normalizePaths(paths);
    opts = normalizeOptions(opts);
    config = load.sync(paths, opts);
    config = resolve(config, opts);
    return config;
}

function normalizePaths(paths) {
    const isArray = Array.isArray(paths);
    if (isArray && paths.some((p) => p && typeof p !== 'string') ||
        !isArray && typeof paths !== 'string') {
        throw new ReadConfigError(`Expected a string (or array) with configuration file path. Received: ${paths}`);
    }
    paths = isArray ? paths : [paths];
    return paths.filter((p) => !!p);
}
