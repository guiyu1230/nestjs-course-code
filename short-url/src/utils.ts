const base62 = require('base62/lib/ascii')
// const crypto = require('crypto');

// const data = '123456';
// const buff = Buffer.from(data);
// const base64data = buff.toString('base64');
// console.log(base64data);

// const res = base62.encode(123456);
// console.log(res);

// function md5(str) {
//   const hash = crypto.createHash('md5');
//   hash.update(str);
//   return hash.digest('hex');
// }

// console.log(md5('111222'))

export function generateRandomStr(len: number) {
  let str = '';
  for(let i = 0; i < len; i++) {
    const num = Math.floor(Math.random() * 62);
    const encode = base62.encode(num);
    console.log(num, encode);
    str += encode;
  }
  return str;
}

// console.log(generateRandomStr(6))
// console.log(crypto.randomUUID())
