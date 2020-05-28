const { promisify } = require('util');
const rqlite = require('rqlite-fp');
const righto = require('righto');

const url = 'http://localhost:4001';

module.exports = function (callback) {
  const connection = righto(rqlite.connect, url);
  const cleanedDatabase = righto.all([
    righto(rqlite.execute, connection, 'DELETE FROM database_users'),
    righto(rqlite.execute, connection, 'DELETE FROM databases'),
    righto(rqlite.execute, connection, 'DELETE FROM sessions'),
    righto(rqlite.execute, connection, 'DELETE FROM users'),
    righto(rqlite.execute, connection, 'DELETE FROM collections')
  ]);

  return promisify(cleanedDatabase)();
};
