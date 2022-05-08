const router = require('koa-router')();

router.prefix('/common');

router.post('/upload', async (ctx, next) => {
  let files = ctx.request.files;
  let file = files.file;
  let path = '/public';
  if (!file) {
    file = files.files;
  }
  const filePath = file.filepath;
  const originalname = file.originalname || file.originalFilename;
  let fileName
  if (filePath.includes('\\')) {
    path = 'public\\';
    fileName =  '/'+filePath.split(path).pop();
  } else {
    fileName = filePath.split(path).pop();
  }
  console.log(filePath);

  let basicUrl = 'http://localhost:5001'; //为基础路径
  ctx.body = {
    filename: originalname,
    path: basicUrl + fileName,
  };
});

module.exports = router;
