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

test('database collections: update a collection -> no session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/databases/unknown/collections/unknown', {
    method: 'put',
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

test('database collections: update a collection -> no database', async t => {
  t.plan(1);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases/unknown/collections/unknown', {
    method: 'put',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 404);
});

test('database collections: update a collection -> no post body', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();

  const response = await axios(url + '/v1/databases/unknown/collections/unknown', {
    method: 'put',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.equal(response.data.error, 'no post body was provided');
});

test('database collections: update existing collection', async t => {
  t.plan(5);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const createdCollection = await axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await axios(url + '/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection',
      presenters: ['{...body one: 1}']
    }
  });

  const readCollection = await axios(url + '/v1/databases/testing/collections/testingcollection', {
    method: 'get',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(createdCollection.status, 201);

  t.ok(createdCollection.data.id);
  t.ok(updatedCollection.data.presenters, 'presenters returned from update');
  t.equal(createdCollection.data.name, 'testingcollection');

  t.ok(readCollection.data.presenters, 'presenters existed when read collection again');
});

test('database collections: update existing collection can not change name', async t => {
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

  const updatedCollection = await axios(url + '/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollectionchanged',
      presenters: ['{...body one: 1}']
    }
  });

  t.equal(updatedCollection.status, 400);
  t.ok(updatedCollection.data.name, 'name can not be changed');
});

test('database collections: update existing collection and sync server successfully', async t => {
  t.plan(4);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const createdCollection = await axios(url + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await axios(url + '/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    validateStatus: () => true,
    headers: session.asHeaders,
    data: {
      name: 'testingcollection',
      presenters: ['{...body one: 1}']
    }
  });

  t.equal(createdCollection.status, 201);

  t.ok(createdCollection.data.id);
  t.ok(updatedCollection.data.presenters, 'presenters returned from update');
  t.equal(createdCollection.data.name, 'testingcollection');
});
