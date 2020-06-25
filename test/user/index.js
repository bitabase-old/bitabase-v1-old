const axios = require('axios');
const test = require('tape');

const reset = require('../helpers/reset');

const url = 'http://localhost:8001';

test('user: create a new user with validation errors', async t => {
  t.plan(2);

  const response = await axios(`${url}/v1/users`, {
    method: 'post',
    validateStatus: () => true
  });

  t.equal(response.status, 422);

  t.deepEqual(response.data, {
    errors: {
      email: 'email is a required field',
      password: 'password is a required field'
    }
  });
});

test('user: create a new user', async t => {
  t.plan(3);

  await reset();

  const response = await axios(`${url}/v1/users`, {
    method: 'post',
    validateStatus: () => true,
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  });

  t.equal(response.status, 200);
  t.equal(response.data.id.length, 36);
  t.equal(response.data.email, 'test@example.com');
});
