const router = require('koa-router')();
const trade = require('../controllers/trade');

router.prefix('/trade');

/**
 * 订单路由
 */

// 订单分页列表
router.post('/page', trade.page);
router.post('/add', trade.add);
router.post('/update', trade.update);
router.post('/delete', trade.delete);
router.get('/tradeAmount', trade.tradeAmount);
router.get('/exportMain', trade.exportMain);

module.exports = router;
