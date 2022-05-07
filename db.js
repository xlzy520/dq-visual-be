const low = require('lowdb');

const fileAsync = require('lowdb/adapters/FileAsync');
const uuid4 = require('uuid4');
const result = require('./utils/result');

let db;

const createDB = async () => {
  const adapter = new fileAsync('db.json');
  db = await low(adapter);
  db.defaults({ tasks: [], users: [], orders: [] }).write();
  db._.mixin({
    push: (data, values) => {
      data.push({
        ...values,
        id: uuid4(),
        createTime: Date.now(),
        updateTime: Date.now(),
      });
    },
    assign: (data, values, ctx) => {
      if (!data) {
        ctx.body = result(null, '数据不存在', false);
      } else {
        Object.assign(data, {
          ...values,
          updateTime: Date.now(),
        });
        ctx.body = result(null, '更新成功');
      }
    },
    pagination: (data, page, limit) => {
      const start = (page - 1) * limit;
      const end = page * limit;
      return {
        list: data.slice(start, end),
        total: data.length,
      };
    },
  });
};

const getDB = () => db;

module.exports = {
  createDB,
  DB: getDB,
};
