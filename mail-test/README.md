邮件是常用的通讯方式，我们一般是通过邮箱客户端来收发邮件。

但是这样不够方便：

比如写邮件不能直接贴 html + css，不能写 markdown，收邮件不能按照规则自动下载附件、自动保存邮件内容。

这些需求我们都能通过代码来自己实现。

发邮件是基于 SMTP 协议，收邮件是基于 POP3 或 IMAP 协议。

node 分别有 nodemailer 包和 imap 包用来支持收发邮件的协议。

我们通过 nodemailer 发送了 html 的邮件，可以发送任何 html+css 的内容。

通过 imap 实现了邮件的搜索，然后用 mailparser来做了内容解析，然后把邮件内容和附件做了下载。

能够写代码来收发邮件之后，就可以做很多自动化的事情了：

比如定时自动发一些邮件，内容是从数据库查出来的，比如自动拉取邮件，根据一定的规则来保存邮件和附件内容等。

这就是 Node 里收发邮件的方式。


### 发邮件
```js
const nodemail = require('nodemailer');
const fs = require('fs');

const transporter = nodemail.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: 'xxxxxx@qq.com',
    pass: '你的密钥'
  }
})

async function main() {
  const info = await transporter.sendMail({
    from: 'xxxxxx@qq.com',
    to: "xxxxxx@qq.com",
    subject: "Hello 222",
    // text: "xxxxx 再来一次"
    html: fs.readFileSync('./test.html', 'utf-8')
  })

  console.log("邮件发送成功:", info.messageId);
}

main().catch(console.error);
```

### 收邮件
```js
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
```


