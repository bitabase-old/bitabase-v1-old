const axios = require('axios');
const test = require('tape');

const url = 'http://localhost:8081'

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
