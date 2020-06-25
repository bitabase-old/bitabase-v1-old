const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../../helpers/session');
const reset = require('../../helpers/reset');

const url = 'http://localhost:8001';

const createDatabase = (headers, data) =>
  axios(url + '/v1/databases', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing'
    }
  });

test('database collections: create a new collection -> no session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/databases/unknown/collections', {
    method: 'post',
    validateStatus: () => true,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });
});

test('database collections: create a new collection -> no database', async t => {
  t.plan(1);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases/unknown/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 404);
});

test('database collections: create a new collection -> no post body', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases/unknown/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.equal(response.data.errors.body, 'no post body was provided');
});

test('database collections: create a new collection', async t => {
  t.plan(3);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const response = await axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  t.equal(response.status, 201);

  t.ok(response.data.id);
  t.equal(response.data.name, 'testingcollection');
});

test('database collections: create a new collection -> duplicate', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  await axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const secondCollection = await axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  t.equal(secondCollection.status, 422);
  t.equal(secondCollection.data.errors.name, 'collection name already exists');
});
