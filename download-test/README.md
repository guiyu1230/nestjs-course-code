## 大文件流式下载
- `'Content-Disposition', `attachment; filename="guang.json"``
- 该属性会触发自动下载行为
- `res.end(content)`是全下载。会返回`content-length`
```js
@Get('download')
download(@Res() res: Response) {
  const content = fs.readFileSync('package.json');
  res.set('Content-Disposition', `attachment; filename="guang.json"`);
  res.end(content);
}
```

- `'Content-Disposition', `attachment; filename="guang.json"``
- 该属性会触发自动下载行为
- 流式下载。会有`transfer-encoding:chunked`属性
```js
@Get('download2')
@Header('Content-Disposition', `attachment; filename="guang.json"`)
download2(@Res() res: Response) {
  const stream = fs.createReadStream('package.json');

  stream.pipe(res);
}
```
- `'Content-Disposition', `attachment; filename="guang.json"``
- 该属性会触发自动下载行为
- `new StreamableFile`: nest的流处理api（推荐）
```js
@Get('download3')
download3() {
  const stream = fs.createReadStream('package.json');
  return new StreamableFile(stream, {
    type: 'text/plain',
    disposition: `attachment; filename="guang.json"`
  })
}
```