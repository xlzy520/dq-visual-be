const { DB } = require('../db');
const result = require('../utils/result');
const Joi = require('joi');

const CategorySchema = Joi.object({
  name: Joi.string()
    .required()
    .error((errors) => new Error('电机名称不能为空')),
});

class Controller {
  static page(ctx) {
    const { page = 1, pageSize = 10, ...rest } = ctx.request.body;
    const categoryDB = DB().get('category');
    const pageData = categoryDB
      .filter(rest)
      .sortBy('createTime')
      .pagination(page, pageSize)
      .value();
    ctx.body = result(pageData);
  }

  static add(ctx) {
    const category = ctx.request.body;
    const categoryDB = DB().get('category');
    const { error } = CategorySchema.validate(category);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      categoryDB.push(category).write();
      ctx.body = result(null, '添加成功');
    }
  }

  static update(ctx) {
    const { id, ...rest } = ctx.request.body;
    const categoryDB = DB().get('category');
    const { error } = CategorySchema.validate(rest);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      categoryDB.find({ id }).assign(rest).write();
      ctx.body = result(null, '更新成功');
    }
  }

  static detail(ctx) {
    const { id } = ctx.request.body;
    const categoryDB = DB().get('category');
    const data = categoryDB.find({ id }).value();
    ctx.body = result(data, '查询成功');
  }

  static delete(ctx) {
    const { id } = ctx.request.body;
    const categoryDB = DB().get('category');
    categoryDB.remove({ id }).write();
    ctx.body = result(null, '删除成功');
  }
}

module.exports = Controller;
