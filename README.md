# nodejs-read-config

[![Travis build status](https://travis-ci.org/coditorium/nodejs-read-config.png?branch=master)](https://travis-ci.org/coditorium/nodejs-read-config)
[![dependencies](https://david-dm.org/coditorium/nodejs-read-config.png)](https://david-dm.org/coditorium/nodejs-read-config)
[![Coverage Status](https://coveralls.io/repos/coditorium/nodejs-read-config/badge.svg)](https://coveralls.io/r/coditorium/nodejs-read-config)

[![NPM info](https://nodei.co/npm/read-config.png?downloads=true)](https://www.npmjs.com/package/read-config)

Multi format configuration loader with variable replacement for Node.js.

## Installation

```sh
npm install --save read-config
```

## Main features:

- [Configuration variables](#configuration-variables)
- [System variables](#system-variables)
- [System overrides](#system-overrides)
- [Configuration hierarchy](#configuration-hierarchy)
- Supported formats:
  - [JSON](#json-format)
  - [YAML](#yaml-format)
  - [Properties](#properties-format)

## Configuration variables

Use configuration values in multiple places.

- It is possible to use nested paths like `@{x.y.z}`
- It is possible to use relative paths like `@{./x}` and `@{../y}`
- It is possible to concatenate variables like `@{x}abc@{y}def@{ghi}`

``` javascript
// File: /tmp/config.json:
{
  text1: 'def',
  text2: 'abc-@{text1}-ghi',
  number1: 1,
  number2: '@{number1}',
  boolean1: true,
  boolean2: '@{boolean1}',
  null1: null,
  null2: '@{null1}',
  obj1: {
    x: 'X',
    y: '@{./x}', // same as @{obj1.x}
    z: '@{../text1}' // same as @{text1}
  },
  obj2: '@{obj1}'
}

// File: index.js:
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json');
console.log(config);

// Terminal:
$ node index.js
{
  text1: 'def',
  text2: 'abc-def-ghi',
  number1: 1,
  number2: 1,
  boolean1: true,
  boolean2: true,
  null1: null,
  null2: null,
  obj1: {
    x: 'X',
    y: 'X',
    z: 'def'
  },
  obj2: {
    x: 'X',
    y: 'X',
    z: 'def'
  }
}
```

## System variables

Use system variables as configuration values.

- It is possible to change `%` to other character. Just use `systemVars` configuration option.
- It is possible to use default values when environmental variable is not set.

``` javascript
// File: /tmp/config.json
{ env1: '%{ENV_VAR1}', env2: '%{ENV_VAR2|def}' }

// File: index.js
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json');
console.log(config);

// Terminal:
$ ENV_VAR1=abc node index.js
{ env1: 'abc', env2: 'def' }
```

## System overrides

Use system variables to override configuration values.

- It is possible to change `CONFIG` prefix to other value. Just use `systemOverrides` configuration option.
- It is possible to override existing value or create new one.

``` javascript
// File: /tmp/config.json:
{
  rootProp: 'rootProp',
  objProp: {
    x: 'X'
  }
}

// File: index.js:
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json', {
        systemOverrides: true
    });
console.log(config);

// Terminal:
$ CONFIG_objProp_x=abc node index.js
{ rootProp: 'rootProp', objProp: { x: 'abc'} }
```

## Configuration hierarchy

Build configuration hierarchy with parent definition.

``` javascript
// File: /tmp/config-1.json:
{
    a: "a",
    b: "b",
    arr: [1, 2, 3]
}

// File: /tmp/config-2.json:
{
    __parent: "/tmp/config-1.json",
    // same as: __parent: "./config-1.json",
    b: "bb",
    c: "aa",
    arr: []
}

// File: index.js:
var readConfig = require('read-config'),
    config = readConfig('/tmp/config-2.json');
console.log(config);

// Teminal:
$ node index.js
{
  a: 'a',
  b: 'bb',
  c: 'aa',
  arr: []
}

```

## Multiple configuration formats

### JSON format

All JSON files are parsed using [JSON5](https://www.npmjs.com/package/json5) library. It means you can add comments, and skip quotes - thank you json5 ;)

### YAML format

All YAML files are parsed using [js-yaml](https://www.npmjs.com/package/js-yaml) library.
Using YAML representation lookout for special characters like: `'%'` and `'@'`.

### Properties format

All properties files are parsed using [properties](https://www.npmjs.com/package/properties) module.

## API

### Functions

- **readConfig(paths, [opts], [callback])** - Loads configuration. If callback is passed operation is asynchronous.

### Parameters

- **paths** (String/[String]) - path (or array of paths) to configuration file. If passed an array of paths than every configuration is resolved separately than merged hierarchically (like: [grand-parent-config, parent-config, child-config]), where `child-config` overrides `parent-config`, etc. Empty string and `null` are filtered out.
- **opts** (Object, optional) - configuration loading options
    - **parentField** - (String, default: `'__parentField'`) if specified enables configuration hierarchy. It's value is used to resolve parent configuration file. This field will be removed from the final configuration.
    - **cwd** - (String/[String], default: [`process.cwd()`](https://nodejs.org/api/process.html#process_process_cwd)) base directory used for searching configuration files. Mind that `cwd` has lower priority than a configuration directory, and absolute paths.
    - **extensions** - ([String], default: `['json', 'json5', 'yml', 'yaml', 'properties']`) Configuration paths do not need to include file extensions. They can be resolved using `extensions` array. All default extensions are mapped to parsers automatically. In order to handle custom extension add an object: `{ '${ext}': '${parser}' }`. Available parsers: `['jsonParser', 'yamlParser', 'propertiesParser']`.
    - **configVars** - (String, default: `'@'`, constraint: must be different than `systemVariable`) if specified enables configuration variable replacement. Defined value is used to replace all occurrences of `@{...}` with configuration variables. You can use default values like: `'@{a.b.c|some-default-value}'`.
    - **systemVars** - (String, default: `'%'`, constraint: must be different than `configVariable`) if specified enables system variable replacement. Defined value is used to replace all occurrences of `%{...}` with system variables. You can use default values like: `'%{a.b.c|some-default-value}'`.
    - **systemOverrides** - (String, default: `'CONFIG_'`) If specified enables configuration overriding with system variables like `CONFIG_<propertyName>`.
    - **unresolvedVars** - (Boolean, default: `false`) `true` blocks error throwing on unresolved variables.
    - **unresolvedConfigs** - (String/[String]/RegEx/[RegEx]/Boolean, default: `false`) If any configuration file is not resolvable an exception is raised. Unless configuration is optional than unresolved files are treated as empty. If `true` is passed all unresolved paths are treated as optional.

Default **opts** values:
``` javascript
{
  parentField: '__parent',
  cwd: [`process.cwd()`](https://nodejs.org/api/process.html#process_process_cwd),
  extensionOrder: ['json', 'json5', 'yml', 'yaml', 'properties']
  configVariable: '@',
  systemVariable: '%',
  systemOverrides: 'CONFIG_',
  unresolvedVariables: false,
  unresolvedConfigs: false,
}
```

## Details

### Configuration loader flow

1. Merge all configurations passed in **path** parameter with all of their parents (merging all hierarchy)
2. Merge all results to one JSON object
3. Override configuration with environment variables
4. Resolve environment variables
5. Resolve local variables

### Gulp commands:

- `gulp` - alias for `gulp lint test`
- `gulp clean` - removes `./build` folder
- `gulp ci` - alias for `gulp clean lint test-cov`
- `gulp lint` - run source code linter
- `gulp test-cov` - runs instrumented tests, generates reports to `./build/test`. Accepts all parameters from `test` task.
- `gulp test` - run tests
    - `gulp test --file test/loader.js` - run single test file `./test/loader.js`
    - `gulp test --bail` - run test until first error
    - `gulp test --grep "should parse yaml"` - run test that have defines value in description

### NPM commands:

- `npm test` - alias for `gulp test`
- `npm run ci` - alias for `gulp ci`
