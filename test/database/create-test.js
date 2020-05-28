const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../helpers/session');
const reset = require('../helpers/reset');

const url = 'http://localhost:8081';

test('database: create a new database -> no session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });
});

test('database: create a new database -> no post body', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.ok(response.data.errors.body, 'no post body was provided');
});

test('database: create a new database', async t => {
  t.plan(3);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 201);

  t.ok(response.data.id);
  t.equal(response.data.name, 'testing');
});

test('database: create a new database -> duplicate name', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 422);
  t.equal(response.data.errors.name, 'name has already been taken');
});
