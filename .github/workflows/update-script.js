const fs = require('fs');

// 读取 manage.json（你的指令）
const managePath = 'manage.json';
const dataPath = 'data.json';

// 检查文件是否存在
if (!fs.existsSync(managePath)) {
    console.log('manage.json 不存在，跳过更新');
    process.exit(0);
}

if (!fs.existsSync(dataPath)) {
    console.log('data.json 不存在，创建空文件');
    fs.writeFileSync(dataPath, '{}');
}

const manage = JSON.parse(fs.readFileSync(managePath, 'utf8'));
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 如果没有 commands 字段或为空，直接退出
if (!manage.commands || manage.commands.length === 0) {
    console.log('没有需要执行的指令');
    process.exit(0);
}

console.log(`开始执行 ${manage.commands.length} 条指令...`);

// 执行每条指令
manage.commands.forEach((cmd, index) => {
    console.log(`执行指令 ${index + 1}: ${cmd.action}`);
    
    if (cmd.action === 'add') {
        // 添加链接
        if (!data[cmd.category]) {
            data[cmd.category] = [];
        }
        // 检查是否已存在相同名称的链接
        const exists = data[cmd.category].some(link => link.name === cmd.name);
        if (!exists) {
            data[cmd.category].push({ name: cmd.name, url: cmd.url });
            console.log(`  已添加: ${cmd.category} -> ${cmd.name}`);
        } else {
            console.log(`  跳过: ${cmd.name} 已存在`);
        }
        
    } else if (cmd.action === 'delete') {
        // 删除链接
        if (data[cmd.category]) {
            const originalLength = data[cmd.category].length;
            data[cmd.category] = data[cmd.category].filter(link => link.name !== cmd.name);
            if (data[cmd.category].length < originalLength) {
                console.log(`  已删除: ${cmd.category} -> ${cmd.name}`);
            } else {
                console.log(`  未找到: ${cmd.name}`);
            }
        } else {
            console.log(`  分类不存在: ${cmd.category}`);
        }
        
    } else if (cmd.action === 'delete_category') {
        // 删除整个分类
        if (data[cmd.category]) {
            delete data[cmd.category];
            console.log(`  已删除分类: ${cmd.category}`);
        } else {
            console.log(`  分类不存在: ${cmd.category}`);
        }
        
    } else if (cmd.action === 'edit') {
        // 编辑链接
        if (data[cmd.category]) {
            const linkIndex = data[cmd.category].findIndex(link => link.name === cmd.oldName);
            if (linkIndex !== -1) {
                if (cmd.newName) data[cmd.category][linkIndex].name = cmd.newName;
                if (cmd.newUrl) data[cmd.category][linkIndex].url = cmd.newUrl;
                console.log(`  已编辑: ${cmd.oldName} -> ${cmd.newName || cmd.oldName}`);
            } else {
                console.log(`  未找到要编辑的链接: ${cmd.oldName}`);
            }
        } else {
            console.log(`  分类不存在: ${cmd.category}`);
        }
    }
});

// 清理空分类（可选）
Object.keys(data).forEach(category => {
    if (data[category].length === 0) {
        delete data[category];
        console.log(`  已清理空分类: ${category}`);
    }
});

// 写回 data.json
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('更新完成！');
