const Koa = require('koa');
const app = new Koa(); // 第一步:创建实例
const cors = require('koa-cors');
const views = require('koa-views');
const json = require('koa-json');
const jwt = require('jsonwebtoken');
const koajwt = require('koa-jwt');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');

const { createDB } = require('./db');
createDB();

// const attendance = require('./routes/attendance')
const users = require('./routes/users');
const order = require('./routes/order');
const trade = require('./routes/trade');
const category = require('./routes/category');
const company = require('./routes/company');

const SECRET = 'secret'; // demo，可更换

// error handler
onerror(app);

app.use(cors());

// middlewares 第二步:app.use()传入中间件
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  }),
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  }),
);

// logger
app.use(async (ctx, next) => {
  await next().catch((err) => {
    if (err.message === 'jwt expired') {
      ctx.body = {
        code: 401,
        msg: '登录过期，请重新登录',
        success: false,
      };
    } else {
      throw err;
    }
  });
});

// 获取token，判断是否登录
app.use(async (ctx, next) => {
  var token = ctx.headers.authorization;
  if (!token) {
    await next();
  } else {
    // 把用户信息放在全局，方便直接获取
    const userInfo = jwt.verify(token.split(' ')[1], SECRET);
    ctx.state = {
      userInfo,
    };
    await next();
  }
});

// 中间件对token进行验证
app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        msg: '登录过期，请重新登录',
        success: false,
      };
    } else {
      throw err;
    }
  });
});

app.use(
  koajwt({ secret: SECRET }).unless({
    // 登录，注册接口不需要验证
    path: [/^\/user\/login/, /^\/user\/register/],
  }),
);

// routes
app.use(users.routes(), users.allowedMethods()); // 用户模块路由
app.use(order.routes(), order.allowedMethods()); // 订单模块路由
app.use(trade.routes(), trade.allowedMethods()); // 贸易统计模块路由
app.use(category.routes(), category.allowedMethods()); // 分类模块路由
app.use(company.routes(), company.allowedMethods()); // 企业模块路由

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
