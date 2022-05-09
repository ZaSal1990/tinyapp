const { assert } = require('chai');
const getUserByEmail = require('../helper.js');

const users = {
  '7hvcwq': {
    id: '7hvcwq',
    email: 'khan_zahra4424@hotmail.com',
    password: 'abc'
  },
  gsqxl6: {
    id: 'gsqxl6',
    email: 'khan.zahra3@gmail.com',
    password: 'abc' }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('khan.zahra3@gmail.com', users);
    const expectedUserID = 'gsqxl6';
    assert.deepEqual(user, expectedUserID);
  });
});