const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../../../helpers/session');
const reset = require('../../../helpers/reset');

const managerUrl = 'http://localhost:8081';
const gatewayUrl = 'http://localhost:8082';

const createDatabase = (headers, data) =>
  axios(managerUrl + '/v1/databases', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing'
    }
  });

const createCollection = (headers, database, data) =>
  axios(managerUrl + `/v1/databases/${database.name}/collections`, {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing'
    }
  });

test.only('database records: create a new record', async t => {
  t.plan(2);
  await reset();

  const session = await createUserAndSession();
  const database = await createDatabase(session.asHeaders);
  const collection = await createCollection(session.asHeaders, database.data);

  const insertedRecord = await axios({
    method: 'post',
    data: { testField: 'testValue' },
    baseURL: gatewayUrl + '/testing',
    headers: {
      host: 'testing.bitabase.test'
    },
    validateStatus: () => true
  });

  console.log(database.data)
  console.log(collection.data)
  console.log(insertedRecord.data)

  t.equal(insertedRecord.status, 422);
  console.log(insertedRecord.data)
});
