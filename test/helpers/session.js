const axios = require('axios');

const url = 'http://localhost:8001';

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

const createUserAndSession = async () => {
  await createUser();
  const session = await createSession();
  return {
    asHeaders: {
      'X-Session-Id': session.data.sessionId,
      'X-Session-Secret': session.data.sessionSecret
    },
    ...session.data
  };
};

module.exports = {
  createUser,
  createSession,
  createUserAndSession
};
