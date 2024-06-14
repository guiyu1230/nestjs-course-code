const fs = require('fs');
const path = require('path');

// 读取Markdown文件 将里面的链接文件内容复制到新的文件夹里
const markdownFilePath = 'README.md'; // 请将这里替换为你的Markdown文件路径
const markdownContent = fs.readFileSync(markdownFilePath, 'utf-8');

// 正则表达式匹配Markdown文件中的链接
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
let match;
let index = 0;

// 创建目标文件夹
const targetFolder = path.join(__dirname, 'template');
if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
}

// // 处理每个链接
while ((match = linkRegex.exec(markdownContent)) !== null) {
    index++;
    const linkText = match[1];  // 链接文本
    const linkPath = match[2];  // 链接路径
    // 读取链接指向的文件内容
    const filePath = path.join(__dirname, linkPath);
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // 写入内容到目标文件夹中
        const targetFilePath = path.join(targetFolder, `${index}-${linkText}.md`);
        fs.writeFileSync(targetFilePath, fileContent, 'utf-8');
        console.log(`File written: ${targetFilePath}`);
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}
console.log('All files have been processed.');
