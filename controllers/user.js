const bcrypt = require('bcryptjs'); // 密码加密
const jwt = require('jsonwebtoken'); // 签发token给前端
const secret = require('../config/secret');
// const userModel = require('../modules/user');
const statusCode = require('../utils/status-code');
const { DB } = require('../db');
const result = require('../utils/result');
const error_msg = require('../utils/error_msg');
const Joi = require('joi');
const uuid4 = require('uuid4');

const UserSchema = Joi.object({
  username: Joi.string()
    .required()
    .error((errors) => new Error('用户名不能为空')),
  password: Joi.string()
    .required()
    .error((errors) => new Error('密码不能为空')),
});

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
      ctx.response.status = 200;
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
        const id = uuid4();
        const newUser = {
          id,
          username,
          password: hash,
        };
        usersDB.push(newUser).write();
        // 签发token
        const userToken = {
          username,
          id,
        };

        // 储存token失效有效期1小时
        const token = jwt.sign(userToken, secret.sign, { expiresIn: '2d' });
        ctx.response.status = 200;
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
    // let userList = ctx.request.body;
    // if (userList) {
    //     const data = await userModel.findAllUserList();

    //     ctx.response.status = 200;
    //     ctx.body = statusCode.SUCCESS_200('查询成功', data)
    // } else {

    //     ctx.response.status = 412;
    //     ctx.body = statusCode.ERROR_412('获取失败')

    // }
    let data = await userModel.findAllUserList();

    ctx.response.status = 200;
    ctx.body = statusCode.SUCCESS_200('查询成功', data);
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
      ctx.response.status = 200;
      ctx.body = result(null, error.message, false);
    } else {
      const usersDB = DB().get('users');
      const { username, password } = userParams;
      const user = usersDB.find({ username }).value();
      if (user) {
        // 查询用户密码是否正确
        if (bcrypt.compareSync(password, user.password)) {
          const userToken = {
            username,
            id: user.id,
          };
          // 签发token
          const token = jwt.sign(userToken, secret.sign, { expiresIn: '1h' });

          ctx.response.status = 200;
          ctx.body = result(
            {
              id: user.id,
              username,
              token: token,
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
    let userInfo = await userModel.getUserInfo(ctx.state.user.phone);
    if (userInfo) {
      ctx.body = result(userInfo, '查询成功');
    } else {
      ctx.body = result(null, error_msg.USER_INFO_NOT_EXIST, false);
    }
  }

  static async getQuestion(ctx, next) {
    const { phone } = ctx.request.body;
    const userInfo = await userModel.findUserByPhone(phone);
    if (userInfo) {
      const question = userInfo.question;
      ctx.body = result(
        {
          question,
        },
        '查询成功',
      );
    } else {
      ctx.body = result(null, error_msg.phone_not_exist, false);
    }
  }

  static async resetPassword(ctx, next) {
    let { phone, answer, newPassword } = ctx.request.body;
    if (!newPassword) {
      ctx.body = result(null, error_msg.password_null, false);
    }
    const userInfo = await userModel.findUserByPhone(phone);
    if (userInfo) {
      if (answer === userInfo.answer) {
        const salt = bcrypt.genSaltSync(); // 密码加密的计算强度默认10级
        const hash = bcrypt.hashSync(newPassword, salt);
        await userModel.resetPassword(userInfo, hash);
        ctx.body = result();
      } else {
        ctx.body = result(null, error_msg.answer_error, false);
      }
    } else {
      ctx.body = result(null, error_msg.phone_not_exist, false);
    }
  }
}

module.exports = UserController;
