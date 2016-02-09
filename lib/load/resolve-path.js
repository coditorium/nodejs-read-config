'use strict';

const path = require('path'),
    async = require('async'),
    fs = require('fs');

module.exports.async = function(filepath, opts, callback) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = [];
    }
    async.filter(lookupPaths(filepath, opts), fs.exists, (existingPaths) => {
        callback(existingPaths.length ? existingPaths[0] : null);
    });
};

module.exports.sync = function(filepath, opts) {
    let paths;
    opts = opts || {};
    paths = lookupPaths(filepath, opts).filter(fs.existsSync);
    return paths.length ? paths[0] : null;
};

function lookupPaths(filepath, opts) {
    const paths = [],
        basedirs = opts.cwd || [],
        extensions = opts.extensions || [];
    if (!filepath) return paths;
    if (isAbsolute(filepath)) {
        return endsWith(filepath, extensions) ? [filepath] : addSupportedExtNames(filepath, extensions);
    }
    filepath = endsWith(filepath, extensions) ? [filepath] : addSupportedExtNames(filepath, extensions);
    basedirs.forEach((basedir) => {
        if (!basedir) return;
        filepath.forEach((fp) => {
            paths.push(path.resolve(basedir, fp));
        });
    });
    return paths;
}

function addSupportedExtNames(filepath, extnames) {
    return extnames.map((extname) => {
        return `${filepath}.${extname}`;
    });
}

function isAbsolute(filepath) {
    return path.resolve(filepath) === path.normalize(filepath);
}

function endsWith(text, suffixes) {
    return suffixes.some((suffix) => {
        return text.length >= suffix.length && text.substr(text.length - suffix.length) === suffix;
    });
}
