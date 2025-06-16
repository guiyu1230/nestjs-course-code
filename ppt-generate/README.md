## 动态生成ppt
- 使用puppeteer爬取教育网站获取大学列表信息
- 数据太多，使用sse来流式返回数据
- 使用pptxgenjs来生成pptx大学信息

### 创建项目
```bash
nest new ppt-generate

npm install --save puppeteer

npm install --save pptxgenjs
```

### 使用puppeteer爬取信息。使用observer流式返回
```js
// 1. puppeteer爬取信息
// 2. sse observer流式返回数据
async function getData(observer: Subscriber<Record<string, any>>) {
  // 创建无头浏览器
  const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
          width: 0,
          height: 0
      }
  });
  // 创建页面
  const page = await browser.newPage();
  // 访问链接
  await page.goto('https://www.icourse163.org/university/view/all.htm');
  // 等待元素渲染
  await page.waitForSelector('.u-usitys');
  // 遍历元素获取关键信息
  const universityList: Array<Record<string, any>> = await page.$eval('.u-usitys', el => {
      return [...el.querySelectorAll('.u-usity')].map(item => {
        return {
          name: item.querySelector('img').alt,
          img: item.querySelector('img').src,
          link: item.getAttribute('href')
        }
    })
  });

  for(let i = 0; i < universityList.length; i ++) {
    const item = universityList[i];
    // 访问详情页
    await page.goto('https://www.icourse163.org' + item.link);
    // 等待元素渲染
    await page.waitForSelector('.m-cnt');
    // 获取关键信息
    const content = await page.$eval('.m-cnt p', el => el.textContent);
    item.desc = content;
    // 流式返回数据
    observer.next({data: item});

  }

  await browser.close();

  cache = universityList;
}

return  new Observable((observer) => {
  getData(observer);
});
```

### 生成pptx
```js
const pptxgen = require('pptxgenjs');

const ppt = new pptxgen();
// 创建分页
const slide  = ppt.addSlide();
// 分页添加文字
slide.addText('北京大学', { x: '10%', y: '10%', color: '#ff0000', fontSize: 30,  align: ppt.AlignH.center,});
// 分页添加图片
slide.addImage({ 
    path: "https://nos.netease.com/edu-image/F78C41FA9703708FB193137A688F7195.png?imageView&thumbnail=150y150&quality=100", 
    x: '42%',
    y: '25%',
});
// 分页添加文字
slide.addText(`文字内容`, 
    { x: '10%', y: '60%', color: '#000000', fontSize: 14,}
);
// 生产pptx文件
ppt.writeFile({
    fileName: '中国所有大学.pptx'
})
```

### 总结
```js
// 创建无头浏览器
const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
        width: 0,
        height: 0
    }
});
// 创建页面
const page = await browser.newPage();
// 访问链接
await page.goto('https://www.icourse163.org/university/view/all.htm');
// 等待元素渲染
await page.waitForSelector('.u-usitys');

// 遍历元素获取关键信息
const content = await page.$eval('.u-usitys', el => el.textContent)
// 流式返回数据
observer.next({data: content});

// 使用pptxgenjs生成pptx
const pptxgen = require('pptxgenjs');

const ppt = new pptxgen();
// 创建分页
const slide  = ppt.addSlide();
// 分页添加文字
slide.addText(content, { x: '10%', y: '10%', color: '#ff0000', fontSize: 30,  align: ppt.AlignH.center,});
// 生产pptx文件
ppt.writeFile({
    fileName: '中国所有大学.pptx'
})
```

