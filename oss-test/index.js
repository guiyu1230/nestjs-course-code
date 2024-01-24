const OSS = require('ali-oss');

require('dotenv').config();

const client = new OSS({
  region: 'oss-cn-shanghai',
  bucket: 'gui-333',
  accessKeyId: process.env.accessKeyId,
  accessKeySecret: process.env.accessKeySecret
})

async function put() {
  try {
    const result = await client.put('cat2.png', './public/1111.jpg')
    console.log(result);
  } catch(e) {
    console.log(e);
  }
}

put();
