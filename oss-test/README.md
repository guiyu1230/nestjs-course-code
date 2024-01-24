## 使用OSS上传方案

上传文件一般不会直接存在服务器目录下，这样不好扩展，一般我们会用阿里云的 OSS，它会自己做弹性扩展，所以存储空间是无限的。

OSS 对象存储是在一个 bucket 桶下，存放多个文件。

它是用 key-value 存储的，没有目录的概念，阿里云 OSS 的目录只是用元信息来模拟实现的。

我们在测试了在控制台的文件上传，也测试过了 node 里用 ali-oss 包来上传、在网页里直传 OSS 这三种上传方式。

不管在哪里上传，都需要 acessKeyId 和 acessKeySecret。

这个是阿里云的安全策略，因为直接用用户名密码，一旦泄漏就很麻烦，而 acessKey 泄漏了也可以禁用。而且建议用 RAM 子用户的方式生成 accessKey，这样可以最小化权限，进一步减少泄漏的风险。

客户端直传 OSS 的方式不需要消耗服务器的资源，但是会有泄漏 acessKey 的风险，所以一般都是用服务端生成临时的签名等信息，然后用这些信息来上传。

这种方案就是最完美的 OSS 上传方案了。

掌握了这些，就完全足够应对工作中的 OSS 使用了。

### 最简单得上传方案

- `accessKeyId` 为账户id
- `accessKeySecret` 为账户密钥
- 使用`ali-oss SDK`来上传

推荐创建使用子账户的`accessKeyId`和`accessKeySecret`来代替主账户

```js
const OSS = require('ali-oss')

const client = new OSS({
    region: 'oss-cn-beijing',
    bucket: 'guang-333',
    accessKeyId: '',
    accessKeySecret: '',
});

async function put () {
  try {
    const result = await client.put('cat.png', './mao.png');
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

put();
```

### 大文件分片

- `accessKeyId` 为账户id
- `accessKeySecret` 为账户密钥
- 使用`ali-oss SDK`来上传

```js
const OSS = require('ali-oss');
const path = require("path");

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'yourregion',
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // 填写存储空间名称。
  bucket: 'yourbucketname'
});


const progress = (p, _checkpoint) => {
  // Object的上传进度。
  console.log(p); 
  // 分片上传的断点信息。
  console.log(_checkpoint); 
};

const headers = {  
  // 指定Object的存储类型。
  'x-oss-storage-class': 'Standard', 
  // 指定Object标签，可同时设置多个标签。
  'x-oss-tagging': 'Tag1=1&Tag2=2', 
  // 指定初始化分片上传时是否覆盖同名Object。此处设置为true，表示禁止覆盖同名Object。
  'x-oss-forbid-overwrite': 'true'
}

// 开始分片上传。
async function multipartUpload() {
  try {
    // 依次填写Object完整路径（例如exampledir/exampleobject.txt）和本地文件的完整路径（例如D:\\localpath\\examplefile.txt）。Object完整路径中不能包含Bucket名称。
    // 如果本地文件的完整路径中未指定本地路径（例如examplefile.txt），则默认从示例程序所属项目对应本地路径中上传文件。
    const result = await client.multipartUpload('exampledir/exampleobject.txt', path.normalize('D:\\localpath\\examplefile.txt'), {
      progress,
      // headers,
      // 指定meta参数，自定义Object的元信息。通过head接口可以获取到Object的meta数据。
      meta: {
        year: 2020,
        people: 'test',
      },
    });
    console.log(result);
    // 填写Object完整路径，例如exampledir/exampleobject.txt。Object完整路径中不能包含Bucket名称。
    const head = await client.head('exampledir/exampleobject.txt');
    console.log(head);
  } catch (e) {
    // 捕获超时异常。
    if (e.code === 'ConnectionTimeoutError') {
      console.log('TimeoutError');
      // do ConnectionTimeoutError operation
    }
    console.log(e);
  }
}

multipartUpload();
```

### 生成零时授权token

```js
const OSS = require('ali-oss')

async function main() {

    const config = {
        region: process.env.region,
        bucket: process.env.bucket,
        accessKeyId: process.env.accessKeyId,
        accessKeySecret: process.env.accessKeySecret,
    }

    const client = new OSS(config);
    
    const date = new Date();
    
    date.setDate(date.getDate() + 1);
    
    const res = client.calculatePostSignature({
        expiration: date.toISOString(),
        conditions: [
            ["content-length-range", 0, 1048576000], //设置上传文件的大小限制。      
        ]
    });
    
    console.log(res);
    
    const location = await client.getBucketLocation();
    
    const host = `http://${config.bucket}.${location.location}.aliyuncs.com`;

    console.log(host);
}

main();

```


```js
// 仅一天有效
{
  OSSAccessKeyId: 'LTAI5tA1FHEYVBFwEzxiz9L6',
  Signature: 'Xz9VIm46+cR6E5molH7UlQSd5bU=',
  policy: 'eyJleHBpcmF0aW9uIjoiMjAyNC0wMS0yNVQwNzo1MToyNS44OTFaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ==',
  host: 'http://gui-333.oss-cn-shanghai.aliyuncs.com'
}
```


