'use strict';

const admin = require('..');
const assert = require('assert').strict;

assert.strictEqual(admin(), 'Hello from admin');
console.info('admin tests passed');
