const axios = require('axios');
const test = require('tape');

const { createUserAndSession } = require('../../../helpers/session');
const reset = require('../../../helpers/reset');

const gatewayUrl = 'http://localhost:8082';
const managerUrl = 'http://localhost:8081';

const createDatabase = (headers, data) =>
  axios(managerUrl + '/v1/databases', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: data || {
      name: 'testing'
    }
  });

const createCollection = (headers, data) =>
  axios(managerUrl + '/v1/databases/testing/collections', {
    method: 'post',
    validateStatus: () => true,
    headers,
    data: {
      name: 'testing'
    }
  });

test.skip('database collections: list logs', async t => {
  t.plan(1);
  await reset();

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);
  await createCollection(session.asHeaders);

  const recordResponse = await axios(gatewayUrl + '/testing/testing', {
    method: 'post',
    data: {

    },
    validateStatus: () => true,
    headers: session.asHeaders
  });

  console.log(recordResponse);

  const response = await axios(managerUrl + '/v1/databases/testing/collections/testing/logs', {
    method: 'get',
    validateStatus: () => true,
    headers: session.asHeaders
  });

  t.equal(response.data[0].a, 1);
});
