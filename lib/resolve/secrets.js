'use strict';

const fs = require('fs'),
    path = require('path'),
    SECRETS_DIR = '/run/secrets';

function readSecrets() {
    let output = {};
    if (fs.existsSync(SECRETS_DIR)) {
        const files = fs.readdirSync(SECRETS_DIR);

        files.forEach((file) => {
            const fullPath = path.join(SECRETS_DIR, file),
                key = file,
                data = fs.readFileSync(fullPath, 'utf8').toString().trim();
            output[key] = data;
        });
    }
    return output;
}

module.exports = readSecrets;