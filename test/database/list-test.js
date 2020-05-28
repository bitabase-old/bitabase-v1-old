const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../helpers/session');
const reset = require('../helpers/reset');

const url = 'http://localhost:8081';

const createDatabase = (headers, data) =>
  axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  });

test('database: list databases -> no session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: { id: 'invalid session provided' }
  });
});

test('database: list databases -> not found', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'get',
    headers: session.asHeaders
  });

  t.equal(response.status, 200);
  t.equal(response.data.length, 0);
});

test('database: list databases', async t => {
  t.plan(9);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'get',
    headers: session.asHeaders
  });

  t.equal(response.status, 200);
  t.equal(response.data.length, 1);
  t.equal(response.data[0].name, 'testing');
  t.equal(response.data[0].total_collections, 0);
  t.equal(response.data[0].total_reads, 0);
  t.equal(response.data[0].total_writes, 0);
  t.equal(response.data[0].total_space, 0);
  t.ok(response.data[0].id);
  t.ok(response.data[0].date_created);
});

test('database: list databases -> only mine', async t => {
  t.plan(9);
  await reset();

  const firstSession = await createUserAndSession();
  await createDatabase(firstSession.asHeaders);

  const secondSession = await createUserAndSession();
  await createDatabase(secondSession.asHeaders);

  const response = await axios(url + '/v1/databases', {
    validateStatus: () => true,
    method: 'get',
    headers: firstSession.asHeaders
  });

  t.equal(response.status, 200);
  t.equal(response.data.length, 1);
  t.equal(response.data[0].name, 'testing');
  t.equal(response.data[0].total_collections, 0);
  t.equal(response.data[0].total_reads, 0);
  t.equal(response.data[0].total_writes, 0);
  t.equal(response.data[0].total_space, 0);
  t.ok(response.data[0].id);
  t.ok(response.data[0].date_created);
});
