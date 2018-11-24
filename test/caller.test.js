const path = require('path');
const Caller = require('../lib/caller');

const fooScript = path.join(__dirname, 'scripts/foo.js');

test('fork() should not throw', () => {
  expect(() => {
    const invoker = Caller.fork(fooScript);
    invoker.destroy();
  }).not.toThrow();
});

test('destroy() should be ok', async () => {
  const invoker = Caller.fork(fooScript);
  await invoker.invoke('foo');
  expect(() => invoker.destroy()).not.toThrow();
});

test('destroy() should reject unconsumed promises', async () => {
  const invoker = Caller.fork(fooScript);
  const promise = invoker.invoke('foo');
  invoker.destroy();
  try {
    await promise;
  } catch (err) {
    expect(err.message).toMatch('rejected by destroy()');
  }
});

test('invoke() empty method should throw', async () => {
  const invoker = Caller.fork(fooScript);
  try {
    await invoker.invoke();
  } catch (err) {
    expect(err.message).toMatch('bad method name to invoke');
  }
  invoker.destroy();
});

test('invoke() the same methods concurrently should be ok', async () => {
  const invoker = Caller.fork(fooScript);
  expect(
    await Promise.all([
      invoker.invoke('foo', [1, 2]),
      invoker.invoke('foo'),
    ])
  ).toEqual(['foo.1.2', 'foo.a.b']);
  invoker.destroy();
});

test('invoke() on disconnected process should throw', async () => {
  const invoker = Caller.fork(fooScript);
  invoker.destroy();
  try {
    await invoker.invoke('foo');
  } catch (err) {
    expect(err.message).toMatch('child process is not connected');
  }
});

test('invoke(foo) should return foo.a.b', async () => {
  const invoker = Caller.fork(fooScript);
  expect(await invoker.invoke('foo')).toBe('foo.a.b');
  invoker.destroy();
});

test('invoke(_unknown) should reject', async () => {
  const invoker = Caller.fork(fooScript);
  try {
    await invoker.invoke('_unknown');
  } catch (err) {
    expect(err.message).toMatch('unregistered function: "_unknown"');
  }
  invoker.destroy();
});

test('invoke() timeout should reject', async () => {
  const invoker = Caller.fork(fooScript);
  try {
    await invoker.invoke('longTask', null, { timeout: 200 });
  } catch (err) {
    expect(err.message).toMatch('method "longTask" timeout');
  }
  invoker.destroy();
});

test('_onMessage() should return nothing when msg is invalid', () => {
  const invoker = Caller.fork(fooScript);
  expect(invoker._onMessage(null)).toBe(undefined);
  invoker.destroy();
});

test('_onMessage() should return nothing when no associate name found in _promises', () => {
  const invoker = Caller.fork(fooScript);
  expect(invoker._onMessage({ name: 'xxx' })).toBe(undefined);
  invoker.destroy();
});

test('_onTimeout() with no promises should do nothing', () => {
  const invoker = Caller.fork(fooScript);
  expect(invoker._onTimeout()).toBe(undefined);
  invoker.destroy();
});
