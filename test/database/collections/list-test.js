const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../../helpers/session');
const reset = require('../../helpers/reset');

const url = 'http://localhost:8081';

const createDatabase = (headers, data) =>
  axios(url + '/v1/databases', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing'
    }
  });

const createCollection = (headers, data) =>
  axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: {
      name: 'testing'
    }
  });

test('database collections: list collections -> no session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/databases/unknown/collections', {
    validateStatus: () => true
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });
});

test('database collections: list collections -> not found', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases/unknown/collections', {
    method: 'get',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(response.status, 404);
  t.equal(response.data.error, 'database not found');
});

test('database collections: list collections', async t => {
  t.plan(8);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const response = await axios(url + '/v1/databases/testing/collections', {
    method: 'get',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(response.status, 200);
  t.equal(response.data.length, 1);
  t.equal(response.data[0].name, 'testing');
  t.equal(response.data[0].statistics.total_reads, 0);
  t.equal(response.data[0].statistics.total_writes, 0);
  t.equal(response.data[0].statistics.total_space, 0);
  t.ok(response.data[0].id);
  t.ok(response.data[0].date_created);
});

test('database collections: list databases -> only mine', async t => {
  t.plan(8);
  await reset();

  const firstSession = await createUserAndSession();
  await createDatabase(firstSession.asHeaders);
  await createCollection(firstSession.asHeaders);

  const secondSession = await createUserAndSession();
  await createDatabase(secondSession.asHeaders);
  await createCollection(secondSession.asHeaders);

  const secondResponse = await axios(url + '/v1/databases/testing/collections', {
    method: 'get',
    validateStatus: () => true,
    headers: secondSession.asHeaders
  });

  t.equal(secondResponse.status, 200);
  t.equal(secondResponse.data.length, 1);
  t.equal(secondResponse.data[0].name, 'testing');
  t.equal(secondResponse.data[0].statistics.total_reads, 0);
  t.equal(secondResponse.data[0].statistics.total_writes, 0);
  t.equal(secondResponse.data[0].statistics.total_space, 0);
  t.ok(secondResponse.data[0].id);
  t.ok(secondResponse.data[0].date_created);
});
