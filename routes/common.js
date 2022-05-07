const router = require('koa-router')();

router.prefix('/common');

router.post('/upload', async (ctx, next) => {
  const filePath = ctx.request.files.files.filepath;
  const fileName = filePath.split('public').pop();
  var basicUrl = 'http://localhost:5001'; //为基础路径
  ctx.body = {
    filename: ctx.request.files.files.originalname,
    path: basicUrl + fileName,
  };
});

module.exports = router;
