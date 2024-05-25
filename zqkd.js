/*
APP：全球购骑士特权
提现需要关注微信公众号，在公众号里申请提现
青龙：
捉https://market.chuxingyouhui.com/promo-bargain-api/activity/mqq/api/indexTopInfo的包
然后填在blackJSON里面，注意按照JSON格式填写。用青龙面板的环境变量或者外面用双引号的，字符串内需要用\"转义
export blackJSON='{"black-token":"", "token":"", "User-Agent":"", "appId":""}'
*/
// import got from "got"
// import crypto from "crypto"
const got = require("got")
const crypto = require('crypto');

// let zqkdToken = process.env["zqkdToken"]
let zqkdToken = "1IvDz8sOpqFrgOEXR%2F14IWORVxQ7H5ogHdSaScd9JUZb4R%2F1x7k%2B0HS1s6ZZExjBtPF3Uozg1FG%2BJeBlax18jw%3D%3D"
let zqkdTokenId = "2ea2ce7ef90bba6e4a55e057853f41cb"

main().catch((error) => {
    console.error('发生错误:', error);
}).finally(() => {
    console.log('程序执行完毕');
});


async function main() {
    // let sign = createSign("a0VgYDjKbLX9JAQ8xN13w0bdGIXDdpmr1ny7owBpOq43kWlG6M")
    // console.log(sign)
    // return
    // 检查环境变量
    if (!(await checkEnv())) return;

    // 分享100青豆
    await shareTask()

    for (let i = 0; i <= 5; i++) {
        let result = await task()
        if (result === false){
            return
        }
    }
    console.log(`完成任务`)
}

async function task(index){
    let articles = await articleList()

    if (!articles) {
        console.log("文章列表为空")
        return false
    }

    for (const item of articles) {
        let result = await complete(item.signature)
        if (result === false) {
            return false
        }
        console.log("等待30秒")
        await delay(30000)
    }

    console.log(`第${index}列文章列表完成`)
}

async function shareTask() {
    const body = {
        'uid': '1041026647',
        'token': '1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw',
        'token_id': '2ea2ce7ef90bba6e4a55e057853f41cb',
        'app_version': '2.8.4',
        'openudid': 'b0bdc272999fb431',
        'channel': 'c6010',
        'device_id': '41000412',
        'device_model': 'LE2110',
        'device_brand': 'ONEPLUS',
        'resolution': '1080*2400',
        'os_version': '33',
        'is_wxaccount': '1',
        'active_channel': 'c6010',
        'access': 'wifi',
        'v': '1716645725995',
        'request_time': '1716645893',
        'action': 'beread_extra_reward_two',
        'from': '3',
        'f': '1',
        'sign': '541d24f8feef7e112f5ed106ac772bd1'
    };
    let url = "https://user.youth.cn/FastApi/CommonReward/toGetReward.json"
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.1/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Origin': 'https://user.youth.cn',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/hotShare/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1716645725995',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: body
    };
    const data = await got.post(url, options).json()
    if (data.success === true) {
        console.log("分享成功+100青豆")
    } else {
        console.log(data.message)
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function complete(signature) {
    const body = {
        'access': 'wifi',
        'app_version': '2.8.4',
        'device_id': '41000412',
        'device_model': 'LE2110',
        'signature': `${signature}`,
        'os_version': '33',
        'channel': 'c6010',
        'sign': `${createSign(signature)}`,
        'resolution': '1080*2400',
        'openudid': 'b0bdc272999fb431',
        'token': '1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==',
        'uid': '1041026647',
        'token_id': '2ea2ce7ef90bba6e4a55e057853f41cb',
        'device_brand': 'ONEPLUS',
        'active_channel': 'c6010',
        'is_wxaccount': '1'
    };
    let url = "https://user.youth.cn/FastApi/article/complete.json"
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.1/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.heytap.market","type":"sdk","extra":{}})',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjguMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept': '*/*'
        },
        form: body
    };
    const data = await got.post(url, options).json()
    if (data.success === true) {
        console.log("阅读文章成功=" + signature)
        return true
    } else {
        console.log("任务完成失败")
        return false
    }

}

function createSign(signature) {
    const input = 'access=wifiactive_channel=c6010app_version=2.8.4channel' +
        '=c6010device_brand=ONEPLUSdevice_id=41000412device_model=LE2110is_wxaccount' +
        '=1openudid=b0bdc272999fb431os_version=33resolution=1080*2400signature' +
        `=${signature}` +
        'token_id' +
        '=2ea2ce7ef90bba6e4a55e057853f41cbuid=1041026647UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc';
    return crypto.createHash('md5').update(input).digest('hex')
}

async function checkEnv() {
    if (!zqkdToken) {
        console.log('找不到zqkdToken')
        return false
    }
    return true
}

async function articleList() {
    const url = "https://user.youth.cn/FastApi/article/lists.json?catid=0" +
        "&video_catid=1453&op=0&behot_time=1716614374230" +
        "&uid=1041026647" +
        `&token=${zqkdToken}` +
        `&token_id=${zqkdTokenId}&` +
        "app_version=2.8.4&openudid=b0bdc272999fb431" +
        "&channel=c6010&device_id=41000412" +
        "&device_model=LE2110" +
        "&device_brand=ONEPLUS" +
        "&resolution=1080*2400" +
        "&os_version=33&is_wxaccount=1" +
        "&active_channel=c6010" +
        "&access=wifi"
    const data = await got.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.1/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.heytap.market","type":"sdk","extra":{}})',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjguMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*'
        }
    }).json()
    if (data.success === true) {
        console.log("请求文章列表成功")
        return data.items
    } else {
        console.log("请求文章列表失败=" + data.message)
        return null
    }
}

