const low = require('lowdb');

const fileAsync = require('lowdb/adapters/FileAsync');
const uuid4 = require('uuid4');
const result = require('./utils/result');
const { filterParams } = require('./utils');

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
    search: (data, params) => {
      // const validParams = filterParams(params);
      const keys = Object.keys(params);
      return data.filter((item) => {
        return keys.every((key) => {
          const value = params[key];
          if (!value) {
            return true;
          }
          return new RegExp(params[key]).test(item[key]);
        });
      });
    },
  });
};

const getDB = () => db;

module.exports = {
  createDB,
  DB: getDB,
};
