Excel 的导入导出是后台管理系统的常见功能，我们一般用 exceljs 来实现。

excel 文件分为 workbook、worksheet、row、cell 这 4 层，解析和生成都是按照这个层次结构来。

解析就是 readFile 之后，遍历 worksheet、row，拿到 cell 中的数据 。

生成就是 addWorkSheet、addRow 添加数据，然后 writeFile 来写入文件。

如果是在浏览器里，就把 readFile 换成 load，把 writeFile 换成 writeBuffer 就好了。

浏览器里生成 excel 之后，可以通过 a 标签触发下载，设置 download 属性之后，触发点击就好了。

这样，我们就分别在 node 和浏览器里完成了 excel 的解析和生成。

### node端exceljs解析
- `sheet.getSheetValues` 文件转成数组识别
- `workbook.xlsx.writeFile('./data2.xlsx')` 数组转成文件
```js
// xlsx文件转成数组
async function main() {
  const workbook = new Workbook();

  const workbook2 = await workbook.xlsx.readFile('./data.xlsx');

  workbook2.eachSheet((sheet, index1) => {
    console.log('工作表' + index1);

    const value = sheet.getSheetValues();
    // 转成可以识别的数组
    console.log(value);
  })
}
// 将数组转成xlsx文件
async function output() {
  const workbook = new Workbook();
  
  const worksheet = workbook.addWorksheet('guang111');
  
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 20 },
    { header: '姓名', key: 'name', width: 30 },
    { header: '出生日期', key: 'birthday', width: 30},
    { header: '手机号', key: 'phone', width: 50 }
  ];

  const data = [
    { id: 1, name: '光光', birthday: new Date('1994-07-07'), phone: '13255555555' },
    { id: 2, name: '东东', birthday: new Date('1994-04-14'), phone: '13222222222' },
    { id: 3, name: '小刚', birthday: new Date('1995-08-08'), phone: '13211111111' }
  ]
  worksheet.addRows(data);

  worksheet.eachRow((row, rowIndex) => {
    row.eachCell(cell => {
      if(rowIndex === 1) {
          cell.style = {
              font: {
                  size: 10,
                  bold: true,
                  color: { argb: 'ffffff' }
              },
              alignment: { vertical: 'middle', horizontal: 'center' },
              fill: {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: '000000' }
              },
              border: {
                  top: { style: 'dashed', color: { argb: '0000ff' } },
                  left: { style: 'dashed', color: { argb: '0000ff' } },
                  bottom: { style: 'dashed', color: { argb: '0000ff' } },
                  right: { style: 'dashed', color: { argb: '0000ff' } }
              }
          }
      } else {
          cell.style = {
              font: {
                  size: 10,
                  bold: true,
              },
              alignment: { vertical: 'middle', horizontal: 'left' },
              border: {
                  top: { style: 'dashed', color: { argb: '0000ff' } },
                  left: { style: 'dashed', color: { argb: '0000ff' } },
                  bottom: { style: 'dashed', color: { argb: '0000ff' } },
                  right: { style: 'dashed', color: { argb: '0000ff' } }
              }
          }
      }
    })
  })

  workbook.xlsx.writeFile('./data2.xlsx');
}
```

### 浏览器端端exceljs解析
 - `workbook.xlsx.writeBuffer`数组转成arrayBuffer;
 - arrayBuffer转成文件
```js
async function main() {
    const { Workbook } = ExcelJS;

    const workbook = new Workbook();

    const worksheet = workbook.addWorksheet('guang111');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: '姓名', key: 'name', width: 30 },
        { header: '出生日期', key: 'birthday', width: 30},
        { header: '手机号', key: 'phone', width: 50 }
    ];

    const data = [
        { id: 1, name: '光光', birthday: new Date('1994-07-07'), phone: '13255555555' },
        { id: 2, name: '东东', birthday: new Date('1994-04-14'), phone: '13222222222' },
        { id: 3, name: '小刚', birthday: new Date('1995-08-08'), phone: '13211111111' }
    ]
    worksheet.addRows(data);

    worksheet.eachRow((row, rowIndex) => {
      row.eachCell(cell => {
          if(rowIndex === 1) {
              cell.style = {
                  font: {
                      size: 10,
                      bold: true,
                      color: { argb: 'ffffff' }
                  },
                  alignment: { vertical: 'middle', horizontal: 'center' },
                  fill: {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: '000000' }
                  },
                  border: {
                      top: { style: 'dashed', color: { argb: '0000ff' } },
                      left: { style: 'dashed', color: { argb: '0000ff' } },
                      bottom: { style: 'dashed', color: { argb: '0000ff' } },
                      right: { style: 'dashed', color: { argb: '0000ff' } }
                  }
              }
          } else {
              cell.style = {
                  font: {
                      size: 10,
                      bold: true,
                  },
                  alignment: { vertical: 'middle', horizontal: 'left' },
                  border: {
                      top: { style: 'dashed', color: { argb: '0000ff' } },
                      left: { style: 'dashed', color: { argb: '0000ff' } },
                      bottom: { style: 'dashed', color: { argb: '0000ff' } },
                      right: { style: 'dashed', color: { argb: '0000ff' } }
                  }
              }
          }
      })
  })

    const arraybuffer = new ArrayBuffer(10 * 1024 * 1024);
    const res = await workbook.xlsx.writeBuffer(arraybuffer);

    download(res.buffer);
}

function download(arrayBuffer) {
  const link = document.createElement('a');

  const blob = new Blob([arrayBuffer]);
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = 'guang.xlsx';

  document.body.appendChild(link);

  link.click();
  link.addEventListener('click', () => {
      link.remove();
  });
}

main();
```
