const OSS = require('ali-oss');
const ossConf = require('./oss')
const recursive = require('recursive-readdir')
const fs = require('fs')
let client = new OSS({
    region: ossConf.region,
    accessKeyId: ossConf.AccessKey,
    accessKeySecret: ossConf.SECRET,
    bucket: ossConf.bucket,
    timeout: 300000,
});
(async function() {
    console.log('开始同步OSS=============================')
    let list = await getList();
    const reactFile = list.filter(file => /^fabricjs\/.*/.test(file.name))
    // 删除旧文件
    for (let i = 0; i < reactFile.length; i++) {
        await client.delete(reactFile[i].name)
        console.log('删除文件'+reactFile[i].name);
    }
    // 上传新的
    recursive('_site',async function (err,files) {
        console.log(`共有${files.length}个文件`);
        for (let index = 0; index < files.length; index++) {
            const filePath = files[index];
            const file = fs.readFileSync(filePath);
            const filename = filePath.replace('_site/','fabricjs/')
            console.time();
            await putObject(file, filename);
            console.timeEnd()
            console.log('第'+(index+1)+'文件上传成功'+ filename);
        }
        // process.exit();
    })
})()

async function putObject (file,fileDir) {
    try {
        // object-key可以自定义为文件名（例如file.txt）或目录（例如abc/test/file.txt）的形式，实现将文件上传至当前Bucket或Bucket下的指定目录。
        return client.put(fileDir, file);
    } catch (e) {
        console.log(e);
    }
}
async function getList() {
    let res = await client.list()
    return res.objects || [];
}
