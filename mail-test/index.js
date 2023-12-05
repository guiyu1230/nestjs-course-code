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

// console.log(fs.readFileSync('./test.html', 'utf-8'))
