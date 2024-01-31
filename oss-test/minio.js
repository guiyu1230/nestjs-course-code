const Minio = require('minio');
const fs = require('fs');

require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: '192.168.197.77',
  port: 9000,
  useSSL: false,
  accessKey: process.env.minio_accessKeyId,
  secretKey: process.env.minio_accessKeySecret
})

function put() {
  minioClient.fPutObject('aaa', '497760668506042314.jpg', 'C:/Users/guiyu/Desktop/UI图/497760668506042314.jpg', function(err) {
    if(err) return console.log(err);
    console.log('上传成功');
  })
}

// put();

function get() {
  minioClient.getObject('aaa', '497760668506042314.jpg', (err, stream) => {
    if(err) return console.log(err);
    stream.pipe(fs.createWriteStream('./public/497760668506042314.jpg'))
  })
}

get();
