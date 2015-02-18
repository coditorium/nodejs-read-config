# nodejs-read-config

JSON based configuration loader for Node.js.
Features:

- System variables replacement
- Configuration environment replacement
- Variable default values
- Hierarchical configurations
- Configuration merging
- Support for JSON5 and YAML

## How to use

### Environment variable replacement

/tmp/config.json:
```
{ env1: "%{ENV_VAR1}", env2: "%{ENV_VAR2|def}" }
```
index.js:
```
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json');

console.log(config);

//  $ ENV_VAR1=abc node index.js
//  { env1: 'abc', env2: 'def' }
```

### Configuration variable replacement

/tmp/config.json:
```
{
    text1: "def",
    text2: "abc-@{text1}-ghi"
    number1: 1,
    number2: "@{number1}",
    boolean1: true,
    boolean2: "@{boolean1}",
    null1: null,
    null2: "@{null1}",
	obj1: {
		x: 'X',
		y: '@{./x}', // same as @{obj1.x}
		z: '@{../text1}' // same as @{text1}
	},
	obj2: "@{obj1}"
}
```
index.js:
```
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json');

console.log(config);

//  $ node index.js
//  {
//    text1: "def",
//    text2: "abc-def-ghi"
//    number1: 1,
//    number2: 1,
//    boolean1: true,
//    boolean2: true,
//    null1: null,
//    null2: null,
//    obj1: {
//      x: 'X',
//      y: 'X',
//      z: 'def'
//    },
//    obj2: {
//      x: 'X',
//      y: 'X',
//      z: 'def'
//    }
//  }
```

- It is possible to use nested paths like `@{x.y.z}`
- It is possible to use relative paths like `@{./x}` and `@{../y}`
- It is possible to concatenate variables like `@{x}abc@{y}def@{ghi}`

### Configuration hierarchy

/tmp/config-1.json:
```
{
    a: "a",
    b: "b",
    arr: [1, 2, 3]
}
```
/tmp/config-2.json:
```
{
    __parent: "/tmp/config-1.json",
    // same as: __parent: "./config-1.json",
    b: "bb",
    c: "aa",
    arr: []
}
```
index.js:
```
var readConfig = require('read-config'),
    config = readConfig('/tmp/config-2.json');

console.log(config);

//  $ node index.js
//  {
//    a: "a"
//    b: "bb",
//    c: "aa",
//    arr: []
//  }

```

### Hierarchy and basedir

/tmp/config-1.json:
```
{
    a: "a",
    b: "b",
    arr: [1, 2, 3]
}
```
/home/xxx/config-2.json:
```
{
    __parent: "config-1", // no directory & extension specified
    b: "bb",
    c: "aa",
    arr: []
}
```
index.js:
```
var readConfig = require('read-config'),
    config = readConfig('/tmp/config-2.json');

console.log(config);

//  $ node index.js
//  {
//    a: "a"
//    b: "bb",
//    c: "aa",
//    arr: []
//  }
```


## API

### Functions

- **readConfig(paths, [opts])** - Alias for `readConfig.sync(paths, [opts])`.
- **readConfig.sync(paths, [opts])** - Loads configuration file synchronously.
- **readConfig.async(paths, [opts], callback)** - Loads configuration file asynchronously.

All json files are loaded using [JSON5](https://www.npmjs.com/package/json5) library. It means you can add comments, and skip quotes in your config files - thank you json5;).

### Parameters

- **paths** (String/Array) - path (or array of paths) to configuration file. If passed an array of paths than every configuration is resolved separately than merged hierarchically (like: [grand-parent-config, parent-config, child-config]).
- **opts** (Object, optional) - configuration loading options
    - **parentField** - (String, default: '__parent') if specified enables configuration hierarchy. It's value is used to resolve parent configuration file. This field will be removed from the result.
    - **optional** - (String, default: null) list of configuration paths that are optional. If any configuration path is not resolved and is not optional it's treated as empty file and no exception is raised.
    - **basedir** - (String/Array, default: []) base directory (or directories) used for searching configuration files. `basedir` has lower priority than child configuration directory and absolute paths.
    - **replaceEnv** - (String, default: '%', constraint: Must be different than any of `replace.local`) if specified enables environment variable replacement. Expected string value e.g. `%` that will be used to replace all occurrences of `%{...}` with environment variables. You can use default values like: %{a.b.c|some-default-value}.
    - **replaceLocal** - (String, default: '@', constraint: Must be different than any of `replace.env`) if specified enables configuration variable replacement. Expected string value e.g. `@` that will be used to replace all occurrences of `@{...}` with configuration variables. You can use default values like: @{a.b.c|some-default-value}.
    - **skipUnresolved** - (Boolean, default: false) `true` blocks error throwing on unresolved variables.
    - **freeze** - (Boolean, default: false) `true` [freezes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) the final config.

Default **opts** values:
```
{
    parentField: "__parent",
    basedir: null,
    replaceEnv: "%",
    replaceLocal: "@",
    skipUnresolved: false,
    freeze: false
}
```

## Flow

Flow of the configuration loader:

1. Merge all configs passed in **path** parameter with all of their parents (merging all hierarchy)
2. Merge all results to one json object
3. Resolve environment variables
4. Resolve local variables

### Gulp commands:

- `gulp checkstyle` - runs jshint and jscsrc analysis
- `gulp test` - runs tests
- `gulp test --file test/loader.js` - runs single test file `./test/loader.js`
- `gulp` - alias for `gulp jshint test`
- `gulp test-cov` - runs instrumented tests, generates reports to `./build/test`
- `gulp test-cov --file test/loader.js` - runs single instrumented test file `./test/loader.js`
- `gulp clean` - removes `./build` folder
- `gulp ci` - alias for `gulp clean checkstyle test-cov`

### NPM commands:

- `npm test` - alias for `gulp test`
- `npm run ci` - alias for `gulp ci`
