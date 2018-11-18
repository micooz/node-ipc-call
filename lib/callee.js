class Callee {

  constructor() {
    this._process = null;
    this._functions = {};
  }

  register(arg) {
    if (typeof arg === 'function' && arg.name) {
      this._functions[arg.name] = arg;
    }
    else if (Array.isArray(arg)) {
      arg.forEach(func => this.register(func));
    }
    else if (typeof arg === 'object') {
      Object.keys(arg).forEach(name => this.register(arg[name]));
    }
    else {
      throw Error(`cannot register "${typeof arg}"`);
    }
  }

  listen() {
    if (this._process) {
      throw Error(`cannot listen() multiple times`);
    }
    this._process = process.on('message', this._onMessage.bind(this));
  }

  destroy() {
    if (this._process) {
      this._process.removeListener('message', this._onMessage);
      this._process = null;
      this._functions = {};
    }
  }

  async _onMessage(msg) {
    if (typeof msg !== 'object') {
      return;
    }
    const { _seq, name, args = [] } = msg;
    const func = this._functions[name];
    if (typeof func !== 'function') {
      process.send({ _seq, _status: Callee.MSG_STATUS_NOT_FOUND, name, payload: `unregistered function: "${name}"` });
      return;
    }
    try {
      const result = await func(...args);
      process.send({ _seq, _status: Callee.MSG_STATUS_OK, name, payload: result });
    } catch (err) {
      process.send({ _seq, _status: Callee.MSG_STATUS_FAIL, name, payload: err.message });
    }
  }

}

Callee.MSG_STATUS_OK = 0;
Callee.MSG_STATUS_FAIL = 1;
Callee.MSG_STATUS_NOT_FOUND = 2;

module.exports = Callee;
