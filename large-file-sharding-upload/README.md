当文件比较大的时候，文件上传会很慢，这时候一般我们会通过分片的方式来优化。

原理就是浏览器里通过 slice 来把文件分成多个分片，并发上传。

服务端把这些分片文件保存在一个目录下。

当所有分片传输完成时，发送一个合并请求，服务端通过 fs.createWriteStream 指定 start 位置，来把这些分片文件写入到同一个文件里，完成合并。

这样，我们就实现了大文件分片上传。


```js
// app.controller.ts
import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import * as fs from 'fs';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20, {
    dest: 'uploads',
  }))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    // console.log('body', body);
    // console.log('files', files );

    const fileName = body.name.match(/(.+)\-\d+$/)[1];
    const chunkDir = 'uploads/chunks_' + fileName;    

    if(!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    fs.renameSync(files[0].path, chunkDir + '/' + body.name);
    // fs.rmSync(files[0].path);
  }

  @Get('merge')
  merge(@Query('name') name: string) {
    const chunkDir = 'uploads/chunks_' + name;

    const files = fs.readdirSync(chunkDir);
    files.sort((a: string, b: string) => {
      const indexA = parseInt(a.split('-').pop());
      const indexB = parseInt(b.split('-').pop());
      return indexA - indexB;
    });

    let count = 0;
    let startPos = 0;                      
    files.map(file => {
      
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);
      stream.pipe(fs.createWriteStream('uploads/' + name, {
        start: startPos
      })).on('finish', () => {
        count ++;

        if(count === files.length) {
          fs.rm(chunkDir, { recursive: true }, () => {})
        }
      });

      startPos += fs.statSync(filePath).size;
    })
  }
}
```

```html
<!-- split.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>大文件分片</title>
    <script src="https://unpkg.com/axios@0.24.0/dist/axios.min.js"></script>
</head>
<body>
    <input id="fileInput" type="file"/>
    <script>
        const fileInput = document.querySelector('#fileInput');

        const chunkSize = 200 * 1024;

        fileInput.onchange =  async function () {

            const file = fileInput.files[0];

            console.log(file);

            const chunks = [];
            let startPos = 0;
            while(startPos < file.size) {
                chunks.push(file.slice(startPos, startPos + chunkSize));
                startPos += chunkSize;
            }

            const randomStr = Math.random().toString().slice(2, 8);
            const tasks = chunks.map((chunk, index) => {
                const data = new FormData();
                data.set('name', randomStr + '-' + file.name + '-' + index);
                data.append('files', chunk);
                return axios.post('http://localhost:3000/upload', data);
            })
            await Promise.all(tasks);
            axios.get('http://localhost:3000/merge?name=' + randomStr + '-' + file.name);
        }

    </script>
</body>
</html>
```
