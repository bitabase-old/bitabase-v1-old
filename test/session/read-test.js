const axios = require('axios');
const test = require('tape');

const reset = require('../helpers/reset');

const url = 'http://localhost:8081';

const createUser = (user) =>
  axios(url + '/v1/users', {
    method: 'post',
    validateStatus: () => true,
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  });

const createSession = (user) =>
  axios(url + '/v1/sessions', {
    method: 'post',
    validateStatus: () => true,
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  });

test('session: read a not existing session', async t => {
  t.plan(2);
  await reset();

  const response = await axios(url + '/v1/sessions/current', {
    method: 'get',
    validateStatus: () => true,
    headers: {
      'X-Session-Id': 'wrongid',
      'X-Session-Secret': 'wrongsecret'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });
});

test('session: read an existing session with wrong secret', async t => {
  t.plan(2);
  await reset();

  await createUser();
  const session = (await createSession()).data;

  const response = await axios(url + '/v1/sessions/current', {
    method: 'get',
    validateStatus: () => true,
    headers: {
      'X-Session-Id': session.sessionId,
      'X-Session-Secret': 'wrongsecret'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });
});

test('session: read an existing session with correct details', async t => {
  t.plan(4);
  await reset();

  const user = (await createUser()).data;
  const session = (await createSession()).data;

  const response = await axios(url + '/v1/sessions/current', {
    method: 'get',
    validateStatus: () => true,
    headers: {
      'X-Session-Id': session.sessionId,
      'X-Session-Secret': session.sessionSecret
    }
  });

  t.equal(response.status, 200);

  t.equal(response.data.sessionId, session.sessionId);
  t.equal(response.data.user.id, user.id);
  t.notOk(response.data.user.password);
});
