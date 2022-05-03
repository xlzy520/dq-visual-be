const low = require('lowdb');

const fileAsync = require('lowdb/adapters/FileAsync');

let db;

const createDB = async () => {
  const adapter = new fileAsync('db.json');
  db = await low(adapter);
  db.defaults({ tasks: [], users: [] }).write();
};

const getDB = () => db;

module.exports = {
  createDB,
  DB: getDB,
};
