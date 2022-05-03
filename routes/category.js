const router = require('koa-router')();
const category = require('../controllers/category');

router.prefix('/category');

/**
 * 订单路由
 */

// 订单分页列表
router.post('/page', category.page);
router.post('/add', category.add);
router.post('/update', category.update);
router.post('/detail', category.detail);
router.post('/delete', category.delete);

module.exports = router;
