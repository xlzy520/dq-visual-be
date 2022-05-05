const { DB } = require('../db');
const result = require('../utils/result');
const Joi = require('joi');

const tradeSchema = Joi.object({
  name: Joi.string()
    .required()
    .error((errors) => new Error('商品名称不能为空')),
  exportAmount: Joi.string()
    .required()
    .error((errors) => new Error('出口额不能为空')),
  exportRate: Joi.string()
    .required()
    .error((errors) => new Error('出口占比不能为空')),
  exportLastRate: Joi.string()
    .required()
    .error((errors) => new Error('出口同比不能为空')),
  importAmount: Joi.string()
    .required()
    .error((errors) => new Error('进口额不能为空')),
  importRate: Joi.string()
    .required()
    .error((errors) => new Error('进口占比不能为空')),
  importLastRate: Joi.string()
    .required()
    .error((errors) => new Error('进口同比不能为空')),
  year: Joi.string()
    .required()
    .error((errors) => new Error('年份不能为空')),
});

class Controller {
  static page(ctx) {
    const { page = 1, pageSize = 10 } = ctx.request.body;
    const tradeDB = DB().get('trade');
    const tradePage = tradeDB
      .sortBy('createTime')
      .pagination(page, pageSize)
      .value();
    ctx.body = result(tradePage);
  }

  static add(ctx) {
    const trade = ctx.request.body;
    const tradeDB = DB().get('trade');
    const { error } = tradeSchema.validate(trade);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      tradeDB.push(trade).write();
      ctx.body = result(null, '添加成功');
    }
  }

  static update(ctx) {
    const { id, ...rest } = ctx.request.body;
    const tradeDB = DB().get('trade');
    const { error } = tradeSchema.validate(rest);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      tradeDB.find({ id }).assign(rest).write();
      ctx.body = result(null, '更新成功');
    }
  }

  static delete(ctx) {
    const { id } = ctx.request.body;
    const tradeDB = DB().get('trade');
    tradeDB.remove({ id }).write();
    ctx.body = result(null, '删除成功');
  }

  static tradeAmount(ctx) {
    const { year } = ctx.request.body;
    const tradeDB = DB().get('tradeAmount');
    const data = tradeDB.find({ year }).value();
    ctx.body = result(data, '获取成功');
  }

  static tradeAmountCount(ctx) {
    const { year = 2016 } = ctx.request.body;
    const tradeDB = DB().get('不同类型电机出进口额的统计');
    const data = tradeDB.find({ year }).value();
    ctx.body = result(data, '获取成功');
  }

  static exportMainTradeCount(ctx) {
    const tradeDB = DB().get('2021年度我国电机出口主要贸易方式');
    const data = tradeDB.value();
    ctx.body = result(data, '获取成功');
  }
  static saleDetail(ctx) {
    const { year = 2016 } = ctx.request.body;
    const tradeDB = DB().get('电机企业近5年销售情况');
    const data = tradeDB.find({ year }).value();
    ctx.body = result(data, '获取成功');
  }
  static economicBenefits(ctx) {
    const tradeDB = DB().get('电机企业的经济效益图');
    const data = tradeDB.value();
    ctx.body = result(data, '获取成功');
  }
}

module.exports = Controller;
