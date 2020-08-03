const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../../../helpers/session');
const reset = require('../../../helpers/reset');

const managerUrl = 'http://localhost:8001';
const gatewayUrl = 'http://localhost:8002';

const createDatabase = (headers, data) =>
  axios(managerUrl + '/v1/databases', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing001'
    }
  });

const createCollection = (headers, database, data) =>
  axios(managerUrl + `/v1/databases/${database.name}/collections`, {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing001',
      schema: {
        knownColumn: ['required', 'string']
      }
    }
  });

test('database records: create a new record with invalid data', async t => {
  t.plan(1);
  await reset();

  const session = await createUserAndSession();
  const database = await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders, database.data);

  const insertedRecord = await axios({
    method: 'post',
    data: { unknownColumn: 'testValue' },
    baseURL: gatewayUrl + '/testing001',
    headers: {
      host: 'testing001.bitabase.test'
    },
    validateStatus: () => true
  });

  t.equal(insertedRecord.status, 422);
});

test('database records: create a new record', async t => {
  t.plan(1);
  await reset();

  const session = await createUserAndSession();
  const database = await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders, database.data);

  const insertedRecord = await axios({
    method: 'post',
    data: { knownColumn: 'testValue' },
    baseURL: gatewayUrl + '/testing001',
    headers: {
      host: 'testing001.bitabase.test'
    },
    validateStatus: () => true
  });

  t.equal(insertedRecord.status, 201);
});
