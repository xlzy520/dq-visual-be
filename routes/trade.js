const router = require('koa-router')();
const trade = require('../controllers/trade');

router.prefix('/trade');

/**
 * 订单路由
 */

// 订单分页列表
router.post('/page', trade.page);
router.post('/add', trade.add);
router.post('/edit', trade.update);
router.post('/delete', trade.delete);
router.get('/tradeAmount', trade.tradeAmount);
router.get('/tradeAmountCount', trade.tradeAmountCount);
router.get('/exportMainTradeCount', trade.exportMainTradeCount);
router.get('/saleDetail', trade.saleDetail);
router.get('/economicBenefits', trade.economicBenefits);

module.exports = router;
