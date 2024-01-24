const OSS = require('ali-oss');

require('dotenv').config();

async function main() {
  const config = {
    region: 'oss-cn-shanghai',
    bucket: 'gui-333',
    accessKeyId: process.env.accessKeyId,
    accessKeySecret: process.env.accessKeySecret
  }

  const client = new OSS(config);

  const date = new Date();

  date.setDate(date.getDate() + 1);

  const res = client.calculatePostSignature({
    expiration: date.toISOString(), //请求有效期
    conditions: [
      ["content-length-range", 0, 1048576000], //设置上传文件的大小限制。      
    ]
  })

  console.log(res);

  const location = await client.getBucketLocation();

  const host = `http://${config.bucket}.${location.location}.aliyuncs.com`;

  console.log(host);
}

main();
