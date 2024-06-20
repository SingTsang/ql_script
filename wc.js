let wangchao = process.env["wangchao"]

// let wangchao = "667234746ab0c819a2f1a1e6#667234746ab0c819a2f1a1e7#00000000-69ba-ad9c-0000-00004cddb023#72912973#fZ9xj5xivqlmj1lMhnGkjQCk6oxtqKK24E-QINb01ULJfhVGGjWMfQKeWnqMIt26wFTPi1g2jUn9xFWDI1c45LK9WssfhqLJfFYei-XXSR_9lesi0-XfWAB2EI2GoqW9feXt-2DnKn-V3Ogn-I7FBNW1fAb_OOtr1OWs-4VgqpklQejgCaHvV0Icxr61cNiRFib7hGwffziRba_1CZNXV8sNjNNfGImtDNc1zRd97w9Xwbj3CR9-esQpc52_CLIAMFKfynKveiCA-_A7jvp9vh9ceBUsBgRBz_1CcAUd4Qte3Ctxe2tVUZKdeLg7UNABAglpKpFilyjPeSn-25PNGgYTcAm06gOOogQnqbVa_sdF2wm-25PNGgSR-0-4_55vT"

let userList = []

let articles = []

let JSESSIONID = ""
let ACTIVITY_JSESSIONID = ""

main().catch(() => {
}).finally(() => {
});

async function main() {
    await loadDependencies()

    if (!(await checkEnv())) return;

    console.log('\n望潮每日抽奖');

    for (const user of userList) {

        await login(user)

        await listUserArticle(user)
        if (!articles) {
            return
        }

        let allRead = true
        for (const item of articles) {
            allRead = allRead && item.isRead
        }
        if (!allRead) {
            for (const item of articles) {
                await readArticle(item, user)
                console.log("等待5秒")
                await delay(5000)
            }
        }

        await activityLogin(user)

        if (!ACTIVITY_JSESSIONID) {
            return
        }

        await finishActivity(user)

        await userAwardRecordUpgrade(user)
    }
}

async function login(user) {
    const url = `https://xmt.taizhou.com.cn/prod-api/user-read/app/login?id=${user[0]}&sessionId=${user[1]}&deviceId=${user[2]}`
    const data = await got.get(url, {
        headers: {
            'Host': 'xmt.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        }
    })
    const id = parseJSESSIONID(data.rawHeaders)
    if (!id) {
        console.log("获取JSESSIONID失败")
        return
    }
    JSESSIONID = id
    console.log("JSESSIONID=" + JSESSIONID)
}

async function listUserArticle(user) {
    if (!JSESSIONID) {
        console.log("结束=listUserArticle")
        return
    }

    const url = `https://xmt.taizhou.com.cn/prod-api/user-read/list/${getFormattedDate()}`
    const data = await got.get(url, {
        headers: {
            'Host': 'xmt.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Cookie': `cookie=${user[3]}; tfstk=${user[4]}; JSESSIONID=${JSESSIONID}`
        }
    }).json()
    if (data.code !== 200) {
        console.log(`请求文章列表失败：${data.message}`)
        return
    }
    articles = data.data.articleIsReadList
    console.log(`请求文章列表成功`)
}

async function readArticle(item, user) {
    if (item.isRead === true) {
        console.log("已经阅读=" + item.title)
        return
    }
    const time = new Date().getTime()
    const url = `https://xmt.taizhou.com.cn/prod-api/already-read/article?articid=${item.id}&timestamp=${time}&signature=${signature(item.id, time)}`
    const data = await got.get(url, {
        headers: {
            'Host': 'xmt.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Cookie': `cookie=${user[3]}; tfstk=${user[4]}; JSESSIONID=${JSESSIONID}`
        }
    }).json()
    if (data.code !== 200) {
        console.log(`阅读文章失败：${data.message}`)
        return
    }
    console.log(`阅读文章成功=` + item.title)
}

async function activityLogin(user) {
    const url = `https://srv-app.taizhou.com.cn/tzrb/user/loginWC?accountId=${user[0]}&sessionId=${user[1]}`
    const data = await got.get(url, {
        headers: {
            'Host': 'srv-app.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://srv-app.taizhou.com.cn/luckdraw-ra-1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
        }
    })
    const id = parseActivitySession(data.rawHeaders)
    if (!id) {
        console.log(`活动登录失败：${data.message}`)
        return
    }

    ACTIVITY_JSESSIONID = id
    console.log(`活动登录成功`)
}

async function finishActivity(user) {
    const url = `https://srv-app.taizhou.com.cn/tzrb/userAwardRecordUpgrade/saveUpdate`
    const data = await got.post(url, {
        headers: {
            'Host': 'srv-app.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'Origin': 'https://srv-app.taizhou.com.cn',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://srv-app.taizhou.com.cn/luckdraw-ra-1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Cookie': `JSESSIONID=${ACTIVITY_JSESSIONID}; tfstk=${user[4]}.`,
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'activityId': '67',
            'sessionId': 'undefined',
            'sig': 'undefined',
            'token': 'undefined'
        }
    }).json()
    if (data.code !== 200) {
        console.log(`保存失败：${data.message}`)
        return
    }
    console.log(`保存活动成功`)
}

async function userAwardRecordUpgrade(user) {
    const url = `https://srv-app.taizhou.com.cn/tzrb/userAwardRecordUpgrade/pageList?pageSize=10&pageNum=1&activityId=67`
    const data = await got.get(url, {
        headers: {
            'Host': 'srv-app.taizhou.com.cn',
            'Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; LE2110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            'Accept': '*/*',
            'X-Requested-With': 'com.shangc.tiennews.taizhou',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://srv-app.taizhou.com.cn/luckdraw-ra-1/',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Cookie': `JSESSIONID=${ACTIVITY_JSESSIONID}; tfstk=${user[4]}.`
        }
    }).json()
    if (data.code !== 200) {
        console.log(`抽奖失败：${data.message}`)
        return
    }
    console.log(`抽奖活动完成=` + data.data.records[0].awardName)
}

function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let day = today.getDate();
    day = day < 10 ? '0' + day : day;
    return '' + year + month + day;
}

async function checkEnv() {
    if (!wangchao) {
        console.log('找不到wangchao')
        return false
    }
    const user = wangchao.split("&")
    for (const [index, item] of user.entries()) {
        const split = item.split("#")
        if (split.length !== 5) {
            console.log(`账号${index + 1}规则错误`)
            return false
        }
        userList.push(split)
    }

    return true
}

function parseJSESSIONID(headers) {
    // 将 headers 数组转换为对象
    const headersObj = {};
    for (let i = 0; i < headers.length; i += 2) {
        headersObj[headers[i]] = headers[i + 1];
    }
    // 从 Set-Cookie 头中提取 JSESSIONID
    const setCookie = headersObj['Set-Cookie'];
    let jsessionid = null;
    if (setCookie) {
        const jsessionidMatch = setCookie.match(/JSESSIONID=([^;]+)/);
        if (jsessionidMatch) {
            jsessionid = jsessionidMatch[1];
        }
    }
    return jsessionid
}

function signature(id, time) {
    const encodeContent = "&&" + id + "&&TlGFQAOlCIVxnKopQnW&&" + time
    return crypto.createHash('md5').update(encodeContent).digest('hex');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseActivitySession(headers) {
    for (let i = 0; i < headers.length; i += 2) {
        if (headers[i] === 'Set-Cookie') {
            const cookieValue = headers[i + 1];
            const jsessionidMatch = cookieValue.match(/JSESSIONID=([^;]+)/);
            if (jsessionidMatch) {
                return jsessionidMatch[1];
            }
        }
    }
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

