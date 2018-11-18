const { Callee } = require('../../lib');

const callee = new Callee();

callee.register(function foo() {
  return 'foo';
});

callee.listen();
