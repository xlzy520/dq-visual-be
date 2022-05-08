const bcrypt = require('bcryptjs'); // 密码加密
const jwt = require('jsonwebtoken'); // 签发token给前端
const secret = require('../config/secret');
const statusCode = require('../utils/status-code');
const { DB } = require('../db');
const result = require('../utils/result');
const error_msg = require('../utils/error_msg');
const Joi = require('joi');

const UserSchema = Joi.object({
  username: Joi.string()
    .required()
    .error((errors) => new Error('用户名不能为空')),
  password: Joi.string()
    .required()
    .error((errors) => new Error('密码不能为空')),
  createTime: Joi.date(),
  updateTime: Joi.date(),
});

const generateToken = (username, id) => {
  const token = jwt.sign({ username, id }, secret.sign, {
    expiresIn: '2d',
  });
  return token;
};

class UserController {
  /**
   * 创建用户
   * @param ctx
   * @returns {Promise<void>}
   */
  static async register(ctx, next) {
    const userParams = ctx.request.body;

    const { error } = UserSchema.validate(userParams);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      const usersDB = DB().get('users');
      const { username, password } = userParams;
      // 查询用户名是否重复
      const user = usersDB.find({ username }).value();
      if (user) {
        ctx.body = result(null, error_msg.USER_EXIST, false);
      } else {
        const salt = bcrypt.genSaltSync(); // 密码加密的计算强度默认10级
        const hash = bcrypt.hashSync(password, salt);
        // 创建用户
        const newUser = {
          username,
          password: hash,
        };
        usersDB.push(newUser).write();
        const id = usersDB.find({username}).value().id
        // 签发token
        const token = generateToken(username, id);
        ctx.body = result(
          {
            token,
          },
          '创建用户成功',
        );
      }
    }
  }

  static async getUserList(ctx, next) {
    const usersDB = DB().get('users');
    const users = usersDB.value();
    ctx.body = statusCode.SUCCESS_200('查询成功', users);
  }

  /**
   * 登录
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async login(ctx, next) {
    const userParams = ctx.request.body;

    const { error } = UserSchema.validate(userParams);
    if (error) {
      ctx.body = result(null, error.message, false);
    } else {
      const usersDB = DB().get('users');
      const { username, password } = userParams;
      const user = usersDB.find({ username }).value();
      if (user) {
        // 查询用户密码是否正确
        if (bcrypt.compareSync(password, user.password)) {
          // 签发token
          const token = generateToken(username, user.id,);
          ctx.body = result(
            {
              id: user.id,
              username,
              token,
            },
            '登录成功',
          );
        } else {
          ctx.body = result(null, '用户名或密码错误', false);
        }
      } else {
        ctx.body = result(null, '用户名或密码错误', false);
      }
    }
  }

  static async getUserInfo(ctx, next) {
    let userInfo = ctx.state.userInfo;
    if (userInfo) {
      ctx.body = result(userInfo, '查询成功');
    } else {
      ctx.body = result(null, error_msg.USER_INFO_NOT_EXIST, false);
    }
  }

  static async resetPassword(ctx, next) {
    let { id, newPassword, password } = ctx.request.body;
    if (!newPassword || !password) {
      ctx.body = result(null, error_msg.password_null, false);
      return;
    }
    if (!id) {
      ctx.body = result(null, "用户ID为空", false);
      return;
    }
    const usersDB = DB().get('users');
    const user = usersDB.find({ id }).value();
    if (bcrypt.compareSync(password, user.password)) {
      const salt = bcrypt.genSaltSync(); // 密码加密的计算强度默认10级
      const hash = bcrypt.hashSync(newPassword, salt);
      usersDB.find({ id }).assign({ password: hash }, ctx).write();
      ctx.body = result(null, '修改密码成功');
    } else {
      ctx.body = result(null, error_msg.answer_error, false);
    }
  }
}

module.exports = UserController;
