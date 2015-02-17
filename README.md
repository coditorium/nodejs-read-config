# nodejs-read-config

JSON based configuration loader for Node.js.
Features:

- System variables replacement
- Configuration environment replacement
- Variable default values
- Hierarchical configurations
- Configuration merging

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
    textVar: "def",
    textVal: "abc-@{textVar2}-ghi"
    numberVar: 2,
    numberVal: "1@{numberVar}3",
    booleanVar: true,
    booleanVal: "@{booleanVar}",
    objVar: null,
    objVal: "@{objVar}",
	nested: {
		x: 'X',
		y: '@{./x}', // same as @{nested.x}
		z: '@{../textVar}' // same as @{textVar}
	}
}
```
index.js:
```
var readConfig = require('read-config'),
    config = readConfig('/tmp/config.json');

console.log(config);

//  $ node index.js
//  {
//    textVar: "def",
//    textVal: "abc-def-ghi", // "abc-@{textVar2}-ghi",
//    numberVar: 2,
//    numberVal: 123, // "1@{numberVar}3",
//    booleanVar: true,
//    booleanVal: true, // "@{booleanVar}",
//    objVar: null,
//    objVal: null // "@{objVar}",
//  }
```

- It is possible to use nested paths like `@{x.y.z}`
- It is possible to nest variables up to 3 levels (see options)

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

- **readConfig(path, [opts])** - Alias for `readConfig.sync(path, [opts])`.
- **readConfig.sync(path, [opts])** - Loads configuration file synchronously.
- **readConfig.async(path, [opts], callback)** - Loads configuration file asynchronously.

All json files are loaded using [JSON5](https://www.npmjs.com/package/json5) library. It means you can add comments, and skip quotes in your config files - thank you json5;).

### Parameters

- **path** (String/Array) - path (or array of paths) to configuration file. If passed an array of paths than every configuration is resolved separately than merged hierarchically (like: [grand-parent-config, parent-config, child-config]).
- **opts** (Object, optional) - configuration loading options
    - **parentField** - (String, default: '__parent') if specified enables configuration hierarchy. It's value is used to resolve parent configuration file. This field will be removed from the result.
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
- `gulp ci` - alias for `gulp clean jshint test-cov`

### NPM commands:

- `npm test` - alias for `gulp test`
- `npm run ci` - alias for `gulp ci`
