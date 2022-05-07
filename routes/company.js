const router = require('koa-router')();
const company = require('../controllers/company');

router.prefix('/company');

/**
 * 订单路由
 */

// 订单分页列表
router.post('/page', company.page);
router.post('/add', company.add);
router.post('/edit', company.update);
router.post('/detail', company.detail);
router.post('/delete', company.delete);

module.exports = router;
