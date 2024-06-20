// let zqkdToken = process.env["zqkdToken"]
let zqkdToken = "uid=1041026647&token=1IvDz8sOpqFrgOEXR%2F14IWORVxQ7H5ogHdSaScd9JUZb4R%2F1x7k%2B0HS1s6ZZExjBI2jFMw7ge84gTwFKRhgR7g&token_id=f3f8ef01b1c15c87e1732033c102ba99&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718893050747&f=1&from=tab&sign=5e6ff60eb3b86c3f19c7c977fb324b5e"

let userList = []

let tasks = []

main().catch((error) => {
    console.error('发生错误:', error);
}).finally(() => {
    console.log('程序执行完毕');
});


async function main() {
    await loadDependencies()

    // 检查环境变量
    if (!(await checkEnv())) return;
    parseUserInfo()
    for (const [index, user] of userList.entries()) {
        await timedReward(user)
        await taskList(user)
        if (tasks) {
            console.log(`账号[${index + 1}]开始执行日常任务`)
            for (const task of tasks) {
                if (task.status === 1) {
                    await receiveReward(user)
                }
            }
            for (const task of tasks) {
                if (task.action === "read_article") {
                    console.log("开始执行任务=" + task.title)
                    await timePointSharing(user)
                    await shareArticleList(user)
                }
            }
        }

        // 查询是否能够提现
        const userMessage = await userInfo(user)
        if (userMessage.money >= 0.3){
            console.log("开始提现")
            await withdrawalTask(user)
        } else {
            console.log("提现金额不足0.3,无法提现")
        }
    }
}

// uid=1041026647&token=1IvDz8sOpqFrgOEXR%2F14IWORVxQ7H5ogHdSaScd9JUZb4R%2F1x7k%2B0HS1s6ZZExjBI2jFMw7ge84gTwFKRhgR7g&app_version=2.8.4
// uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBI2jFMw7ge84gTwFKRhgR7g&app_version=2.8.4

async function taskList(user) {
    let url = `https://user.youth.cn/FastApi/NewTaskSimple/getTaskList.json?uid=${user.uid}&token=${user.token}&app_version=2.8.4`
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.android.launcher","type":"shortcut","extra":{"original":{"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}},"scene":"dialog"}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/taskcenter2/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718865012083',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
        }
    };
    const data = await got.get(url, options).json()
    if (data.success === true) {
        tasks = data.items.daily
        console.log("获取任务列表成功")
    } else {
        console.log("获取任务列表失败" + data.message)
    }
}

async function receiveReward(user) {
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.android.launcher","type":"shortcut","extra":{"original":{"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}},"scene":"dialog"}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Origin': 'https://user.youth.cn',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/taskcenter2/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718870371584',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form:{
            'uid': `${user.uid}`,
            'action': 'read_thirty_minute'
        }
    };
    const data = await got.post(`https://user.youth.cn/FastApi/CommonReward/toGetReward.json`, options).json()
    if (data.success === true && data.items) {
        console.log("领取奖励成功=" + data.items.score + "青豆")
    } else {
        console.log("领取奖励失败" + data.message)
    }
}

async function timePointSharing(user) {
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/hotShare/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718873077831',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
        }
    };
    const data = await got.get(`https://user.youth.cn/FastApi/HotForward/getInfo.json?uid=${user.uid}`, options).json()
    if (data.success === true && data.items) {
        const list = data.items.task_list
        for (const item of list) {
            if (item.status === 1) {
                await getTimePointSharing(user, item)
            }
        }
    } else {
        console.log("查询分享奖励失败" + data.message)
    }
}

async function getTimePointSharing(user) {
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Origin': 'https://user.youth.cn',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/hotShare/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718873077831',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'uid': `${user.uid}`,
            'action': 'beread_extra_reward_two'
        }
    };
    const data = await got.post("https://user.youth.cn/FastApi/CommonReward/toGetReward.json", options).json()
    if (data.success === true && data.items) {
        console.log(data.items.title + "=" + data.items.score + "青豆")
    } else {
        console.log("领取分享奖励失败" + data.message)
    }
}

async function shareArticleList(user) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjkuMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*'
        }
    };
    const data = await got.get(`https://user.youth.cn/FastApi/article/lists.json?uid=${user.uid}`, options).json()
    if (data.success === true && data.items) {
        const list = data.items
        for (const item of list) {
            console.log("等待30秒")
            await delay(30000)
            await getShareArticleList(user, item)
        }
    } else {
        console.log("查询分享奖励失败" + data.message)
    }
}

async function withdrawalTask(user) {
    // 查询提现文章列表
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjkuMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*'
        }
    };
    const data = await got.get(`https://user.youth.cn/FastApi/article/lists.json?uid=${user.uid}`, options).json()
    if (data.success === true && data.items) {
        // 默认分享第一个文章
        await shareEnd(user, data.items[0])
    } else {
        console.log("获取提现分享文章失败" + data.message)
    }
}

async function shareEnd(user, item) {
    // 查询提现文章列表
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjkuMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*',
            'Content-Type': 'multipart/form-data; boundary=--------------------------904249534908886404906997',
        },
        form: {
            'article_id': `${item.article_id}`,
            'uid': `${user.uid}`
        }
    };
    const data = await got.post(`https://user.youth.cn/FastApi/article/shareEnd.json`, options).json()
    if (data.success === true && data.withdraw) {
        console.log("提现分享任务成功")
        await withdraw(user)
    } else {
        console.log("获取提现分享文章失败" + data.message)
    }
}

async function withdraw(user) {
    // 查询提现文章列表
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjkuMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*',
            'Content-Type': 'multipart/form-data; boundary=--------------------------904249534908886404906997',
        },
        form: {
            'article_id': `${item.article_id}`,
            'uid': `${user.uid}`
        }
    };
    const data = await got.post(`https://user.youth.cn/FastApi/article/shareEnd.json`, options).json()
    if (data.success === true && data.withdraw) {
        console.log("提现分享任务成功")
    } else {
        console.log("获取提现分享文章失败" + data.message)
    }
}

async function getShareArticleList(user, item) {
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Origin': 'https://user.youth.cn',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/hotShare/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718873077831',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'signature': `${item.signature}`,
            'sign': `${createSign(user, item)}`,
            'uid': `${user.uid}`
        }
    };
    const data = await got.post("https://user.youth.cn/FastApi/article/complete.json", options).json()
    if (data.success === true && data.items) {
        console.log(item.title + "=" + data.items.read_score + "青豆")
    } else {
        console.log("领取分享奖励失败" + data.message)
    }
}

async function timedReward(user) {
    let url = "https://user.youth.cn/FastApi/HotForward/getDialog.json"
    const options = {
        headers: {
            'Host': 'user.youth.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.android.launcher","type":"shortcut","extra":{"original":{"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}},"scene":"dialog"}})',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': '*/*',
            'Origin': 'https://user.youth.cn',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://user.youth.cn/h5/fastAppWeb/hotShare/index.html?uid=1041026647&token=1IvDz8sOpqFrgOEXR/14IWORVxQ7H5ogHdSaScd9JUZb4R/1x7k+0HS1s6ZZExjBtPF3Uozg1FG+JeBlax18jw==&token_id=2ea2ce7ef90bba6e4a55e057853f41cb&app_version=2.8.4&openudid=b0bdc272999fb431&channel=c6010&device_id=41000412&device_model=LE2110&device_brand=ONEPLUS&resolution=1080*2400&os_version=33&is_wxaccount=1&active_channel=c6010&access=wifi&v=1718865986494',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: user
    };
    const data = await got.post(url, options).json()
    if (data.success === true) {
        if (data.items) {
            console.log(data.items.title + data.items.score + "青豆")
        } else {
            console.log("该时段定时红包奖励已经领取过")
        }
    } else {
        console.log("领取定时红包奖励失败" + data.message)
    }
}

async function userInfo(user) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 hap/1.1.3.2/oneplus com.nearme.instant.platform/com.nearme.instant.platform com.youth.kandianquickapp/2.8.4 ({"packageName":"com.nearme.quickapp.center","type":"quickApp","extra":{}})',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'user.youth.cn',
            'Connection': 'Keep-Alive',
            'If-Modified-Since': 'Thu, 20 Jun 2024 10:39:41 GMT',
            'TAP-GSLB': '0,0',
            'Route-Data': 'MQE5NDQwNQE4LjkuMAFMRTIxMTABT25lUGx1cwFDTgE=',
            'Accept': '*/*'
        }
    };
    const data = await got.get(`https://user.youth.cn/v1/user/userinfo.json?uid=${user.uid}`, options).json()
    if (data.success === true) {
        return data.items
    } else {
        console.log("领取定时红包奖励失败" + data.message)
    }
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

function createSign(user, item) {
    const input = `signature=${item.signature}uid=${user.uid}jdvylqcGGHHJZrfw0o2DgAbsmBCCGUapF1YChc`;
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

function parseUserInfo() {
    // 将查询字符串解析为对象
    const pairs = zqkdToken.split('&');
    const result = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key !== "sign" && key !== "app_version") {
            result[decodeURIComponent(key)] = value; // 保留原始编码的值
        }
    });
    userList.push(sortObjectByKeys(result))
}

function sortObjectByKeys(obj) {
    const sortedKeys = Object.keys(obj).sort(); // 获取所有键并按字母顺序排序
    const sortedObj = {}; // 新建一个空对象存储排序后的键值对

    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key]; // 按排序后的键顺序插入键值对
    });

    return sortedObj; // 返回排序后的对象
}

function signature(user) {
    const encode = objectToQueryString(user)
    console.log("key=" + encode)
    return crypto.createHash('md5').update(encode).digest('hex')
}

function objectToQueryString(obj) {
    return Object.keys(obj)
        .filter(key => key !== 'abc') // 过滤掉键为 'abc' 的键值对
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('');
}

async function loadDependencies() {
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        // 浏览器环境
        console.log("浏览器运行环境")
        const gotModule = await import('got');
        const cryptoModule = await import('crypto');

        window.got = gotModule.default;
        window.crypto = cryptoModule.default;
    } else {
        console.log("其他运行环境")
        const gotModule = await import('got');
        const cryptoModule = await import('crypto');
        global.got = gotModule.default;
        global.crypto = cryptoModule.default;

        // Node.js 环境
        // global.got = require('got');
        // global.crypto = require('crypto');
    }
}
