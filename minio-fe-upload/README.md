# 前端直传文件到minio

# minio 本地化部署oss服务

私有部署，这种就可以自己搭一个 OSS 服务。

### docker安装
```sh
docker pull bitnami/minio

docker run -d --name minio \
-p 9000:9000 -p 9001:9001 \
-v /home/guiyu/minio:/bitnami/nimio/data \
-e "MINIO_ROOT_USER=guiyu" \
-e "MINIO_ROOT_PASSWORD=guiyu1234" \
-e "MINIO_SERVER_URL=http://127.0.0.1:9000"  \
bitnami/minio
```

## 创建nest上传服务服务
```sh
nest new minio-fe-upload

npm install --save minio

nest g module minio
```
### 创建minio功能模块
```js
// minio.module.ts
import { Global, Module } from '@nestjs/common';
import * as Minio from 'minio';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: MINIO_CLIENT,
            async useFactory() {
                const client = new Minio.Client({
                        endPoint: 'localhost',
                        port: 9000,
                        useSSL: false,
                        accessKey: '',
                        secretKey: ''
                    })
                return client;
            }
          }
    ],
    exports: [MINIO_CLIENT]
})
export class MinioModule {}
```
## minio 上传功能
- `minioClient.fPutObject`上传
- `minioClient.presignedPutObject`获取带有凭证的资源链接
```ts
// app.module.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { MINIO_CLIENT } from './minio/minio.module';
import * as Minio from 'minio';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(MINIO_CLIENT)
  private minioClient: Minio.Client;

  @Get('test')
  async test() {
    try {
      await this.minioClient.fPutObject('aaa', 'hello.json', './package.json');
      return 'http://localhost:9000/aaa/hello.json';
    } catch(e) {
      console.log(e);
      return '上传失败';
    }
  }

  @Get('presignedUrl')
  async presignedUrl(@Query('name') name: string) {
      return this.minioClient.presignedPutObject('aaa', name, 3600);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
### 前端访问页面
- 通过前端直传资源到minio服务, 只让服务端做签名
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <input type="file" id="selector" multiple>
    <button onclick="upload()">Upload</button>
    <div id="status">No uploads</div>

    <script type="text/javascript">
        function upload() {
            var files = document.querySelector("#selector").files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                retrieveNewURL(file, (file, url) => {
                    uploadFile(file, url);
                });
            }
        }

        function retrieveNewURL(file, cb) {
            fetch(`/presignedUrl?name=${file.name}`).then((response) => {
                response.text().then((url) => {
                    cb(file, url);
                });
            }).catch((e) => {
                console.error(e);
            });
        }

        function uploadFile(file, url) {
            if (document.querySelector('#status').innerText === 'No uploads') {
                document.querySelector('#status').innerHTML = '';
            }
            fetch(url, {
                method: 'PUT',
                body: file
            }).then(() => {
                document.querySelector('#status').innerHTML += `<br>Uploaded ${file.name}.`;
            }).catch((e) => {
                console.error(e);
            });
        }
    </script>
</body>
</html>
```

### 总结
前面我们实现过阿里云 OSS 的前端直传文件，只要在服务端做预签名，前端就可以不用 accessKey 实现文件上传。

这节我们实现了 minio 的前端文件直传，也是通过服务端做预签名，然后前端直接传 minio 就行。

一般我们不会直接上传文件到应用服务器，或者传阿里云 OSS 或者传 minio。