const { DB } = require('../db');
const result = require('../utils/result');
const Joi = require('joi');

const OrderSchema = Joi.object({
  shopName: Joi.string()
    .required()
    .error((errors) => new Error('店铺名称不能为空')),
  username: Joi.string()
    .required()
    .error((errors) => new Error('用户名不能为空')),
  address: Joi.string()
    .required()
    .error((errors) => new Error('地址不能为空')),
  shopAddress: Joi.string()
    .required()
    .error((errors) => new Error('店铺地址不能为空')),
  price: Joi.number()
    .required()
    .error((errors) => new Error('价格不能为空')),
  PaymentStatus: Joi.string()
    .required()
    .error((errors) => new Error('支付状态不能为空')),
});

class OrderController {
  static page(ctx) {
    const { page = 1, pageSize = 10 } = ctx.request.body;
    const OrderDB = DB().get('orders');
    const ordersPage = OrderDB.sortBy('createTime')
      .pagination(page, pageSize)
      .value();
    ctx.body = result(ordersPage);
  }

  static add(ctx) {
    const order = ctx.request.body;
    const ordersDB = DB().get('orders');
    const { error } = OrderSchema.validate(order);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      ordersDB.push(order).write();
      ctx.body = result(null, '添加成功');
    }
  }

  static update(ctx) {
    const { id, ...rest } = ctx.request.body;
    const ordersDB = DB().get('orders');
    const { error } = OrderSchema.validate(rest);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      ordersDB.find({ id }).assign(rest).write();
      ctx.body = result(null, '更新成功');
    }
  }

  static delete(ctx) {
    const { id } = ctx.request.body;
    const ordersDB = DB().get('orders');
    ordersDB.remove({ id }).write();
    ctx.body = result(null, '删除成功');
  }
}

module.exports = OrderController;