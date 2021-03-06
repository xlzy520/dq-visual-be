const router = require('koa-router')();
const Order = require('../controllers/order');

router.prefix('/order');

/**
 * 订单路由
 */

// 订单分页列表
router.post('/page', Order.page);
router.post('/add', Order.add);
router.post('/edit', Order.update);
router.post('/detail', Order.detail);
router.post('/delete', Order.delete);

module.exports = router;
