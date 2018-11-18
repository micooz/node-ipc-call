# node-ipc-call

[![version](https://img.shields.io/npm/v/node-ipc-call.svg)](https://www.npmjs.com/package/node-ipc-call)
[![downloads](https://img.shields.io/npm/dt/node-ipc-call.svg)](https://www.npmjs.com/package/node-ipc-call)
[![license](https://img.shields.io/npm/l/node-ipc-call.svg)](https://github.com/micooz/node-ipc-call/blob/master/LICENSE)
[![Travis](https://img.shields.io/travis/node-ipc-call/node-ipc-call.svg)](https://travis-ci.org/micooz/node-ipc-call)
[![Coverage](https://img.shields.io/codecov/c/github/micooz/node-ipc-call/master.svg)](https://codecov.io/gh/micooz/node-ipc-call)

> Non-blocking cross-process method call based on IPC for Node.js.

## Usage

```js
const { Caller } = require('node-ipc-call');

const invoker = Caller.fork('./foo.js');

await invoker.invoke('sleep', 1000);
await invoker.invoke('max', 1, 2, 3); // 3

invoker.destroy();
```

```js
// ./foo.js
const { Callee } = require('node-ipc-call');

const callee = new Callee();

// async method
callee.register(async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
});

// sync method
callee.register(function max(...args) {
  return Math.max(...args);
});

callee.listen();
```

## API

### Class: Caller

Added in: v0.0.1

**Caller.fork(modulePath, args, options)**

Added in: v0.0.1

* `Caller.fork()` take the same parameters of [child_process.fork()](https://nodejs.org/dist/latest-v11.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

Returns `<Invoker>`.

### Class: Invoker

Added in: v0.0.1

Returned by `Caller.fork()`, you should make remote function calls via `Invoker`.

**invoker.invoke(name, ...args)**

Added in: v0.0.1

* **name** `<String>` The remote function name.
* **...args** Arguments passed to the remote function.

Returns `<Promise>`.

**invoker.destroy()**

Added in: v0.0.1

Closes the IPC channel to child process, and rejects all pending calls. 

### Class: Callee

Added in: v0.0.1

**callee.register(arg)**

Added in: v0.0.1

* **arg** `<Function>|<Object>|<Array>` The functions or an array of functions exposed to remote call.

Each function to be registered should have an unique name, register the same function multiple times is ok.

**callee.listen()**

Added in: v0.0.1

Starts to listen for method calls from parent process.

**callee.destroy()**

Added in: v0.0.1

Stops listening method calls from parent process.

## License

MIT
