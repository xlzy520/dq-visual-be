const { DB } = require('../db');
const result = require('../utils/result');
const Joi = require('joi');
const { filterParams } = require('../utils/index');

const CompanySchema = Joi.object({
  name: Joi.string()
    .required()
    .error((errors) => new Error('企业名称name不能为空')),

  address: Joi.string()
    .required()
    .error((errors) => new Error('企业地址address不能为空')),
  profit: Joi.string()
    .required()
    .error((errors) => new Error('企业利润profit不能为空')),
  phone: Joi.string()
    .required()
    .error((errors) => new Error('联系电话phone不能为空')),
  year: Joi.string()
    .required()
    .error((errors) => new Error('利润年份year不能为空')),
  createTime: Joi.date(),
  updateTime: Joi.date(),
});

class Controller {
  static page(ctx) {
    const { pageNum = 1, pageSize = 10, ...rest } = ctx.request.body;
    const companyDB = DB().get('company');
    const companyPage = companyDB
      .search(rest)
      .sortBy('createTime')
      .pagination(pageNum, pageSize)
      .value();
    ctx.body = result(companyPage);
  }

  static add(ctx) {
    const company = ctx.request.body;
    const companyDB = DB().get('company');
    const { error } = CompanySchema.validate(company);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      companyDB.push(company).write();
      ctx.body = result(null, '添加成功');
    }
  }

  static update(ctx) {
    const { id, ...rest } = ctx.request.body;
    const companyDB = DB().get('company');
    const { error } = CompanySchema.validate(rest);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      companyDB.find({ id }).assign(rest).write();
      ctx.body = result(null, '更新成功');
    }
  }

  static detail(ctx) {
    const { id } = ctx.request.body;
    const companyDB = DB().get('company');
    const data = companyDB.find({ id }).value();
    ctx.body = result(data, '查询成功');
  }

  static delete(ctx) {
    const { id } = ctx.request.body;
    const companyDB = DB().get('company');
    companyDB.remove({ id }).write();
    ctx.body = result(null, '删除成功');
  }
}

module.exports = Controller;
