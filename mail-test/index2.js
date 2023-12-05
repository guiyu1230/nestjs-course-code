const Imap = require('imap');
const { MailParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

const imap = new Imap({
  user: 'xxxxxx@qq.com',
  password: '你的密钥',
  host: 'imap.qq.com',
  port: 993,
  tls: true
})

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err) => {
    imap.search([['SEEN'], ['SINCE', new Date('2023-07-10 19:00:00').toLocaleString()]], (err, result) => {
      if(!err) {
        console.log(result);
        handleResults(result);
      } else {
        throw err;
      }
    })
  })
})

// results 数组- 邮件id的集合  [1410, 1411, 1412, ...]
function handleResults(results) {
  imap.fetch(results, {
    markSeen: false,
    bodies: '', // ''表示查询 header + body 
    struct: true
  }).on('message', msg => {
    const mailparser = new MailParser();

    msg.on('body', stream => {

      const info = {};
      stream.pipe(mailparser);
      // 监听headers信息
      mailparser.on('headers', headers => {
        info.theme = headers.get('subject');
        info.form = headers.get('from').value[0].address;
        info.mailName = headers.get('from').value[0].name;
        info.to = headers.get('to').value[0].address;
        info.datetime = headers.get('date') && headers.get('date').toLocaleString()
      });
      // 监听body信息
      mailparser.on('data', data => {
        // 下载html文件
        if (data.type === 'text') {
          info.html = data.html;
          info.text = data.text;
          
          const filePath = path.join(__dirname, 'mails', info.theme + '.html');
          fs.writeFileSync(filePath, info.html || info.text);
        }
        // 下载pdf png资源
        if (data.type === 'attachment') {
          const filePath = path.join(__dirname, 'files', data.filename);
          const ws = fs.createWriteStream(filePath);
          data.content.pipe(ws);
        }
      })
    })
  })
}

imap.connect();
