/*
APP：全球购骑士特权
提现需要关注微信公众号，在公众号里申请提现
青龙：
捉https://market.chuxingyouhui.com/promo-bargain-api/activity/mqq/api/indexTopInfo的包
然后填在blackJSON里面，注意按照JSON格式填写。用青龙面板的环境变量或者外面用双引号的，字符串内需要用\"转义
export blackJSON='{"black-token":"", "token":"", "User-Agent":"", "appId":""}'
*/
// import got from "got"
const got = require("got")

const $ = new Env('全球购骑士特权')
const jsname = '全球购骑士特权'
const notifyFlag = 1; //0为关闭通知，1为打开通知,默认为1
const logDebug = 0

//const notify = $.isNode() ? require('./sendNotify') : '';
let notifyStr = ''

let blackJSON = ($.isNode() ? (process.env.blackJSON) : ($.getval('blackJSON'))) || ''
// let blackJSON = "{\"black-token\":\"eyJhbGciOiJIUzI1NiJ9.eyJjYXJkX251bWJlciI6MTY2NjE1NjMxLCJob2xkZXIiOiLlhbPlv5fplJAiLCJ1c2VyX2lkIjo1MzI1OTMxLCJwaG9uZSI6IjEzMDc4NDIyMTYzIn0.9SFf5j7zsDmLHqG6WNDOJ5pc45jVFgxzOebX9OFpY0k\", \"token\":\"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMTQxNjgwNzQ1NjI3MTI4NDEzIiwiYm9keSI6IntcImlkZW50aWZpZXJcIjpcIjE2NjYxNTYzMVwiLFwibmlja25hbWVcIjpcIuWFs-W_l-mUkFwiLFwic2V4XCI6MCxcInVzZXJJZFwiOjExNDE2ODA3NDU2MjcxMjg0MTN9IiwicmFuIjotMTc3MzQ1MjU0OX0.1rq3pnV6dQ-s5C12cvIzfhCnmGwLV1V2jV2mUxM2sSjDDg3nUjiyl7sh0ijoPTNlSWf_7av4W6BlNDsmJguLNg\", \"User-Agent\":\"ZZCAndroid/black/2.31.0/oppo (Android; Android 13; OnePlus; LE2110; Build/TP1A.220905.001; zh) MUID/ZfpWQh9cS5wDAM+5TwIdQDoA\", \"appId\":\"1194494896220667904\"}"
let blackArr = []

let userIdx = 0
let reqTime = ''
let userSign = ''
let redPacketId = ''
let fruitId = ''
let userFruitId = ''
let activityId = ''
let redPacketCount = 0
let waterCount = 0
let fertilizerCount = 0
let clickTreeTimes = 1
let signRetryCount = 0
let totalMoney = 0

var todayDate = formatDateTime(new Date());
let bussinessInfo = '{}'

let rndtime = "" //毫秒

///////////////////////////////////////////////////////////////////

!(async () => {
    //检查环境变量
    if (!(await checkEnv())) {
        return
    }
    console.log('\n提现需要关注微信公众号，在公众号里申请提现')
    for (userIdx = 0; userIdx < blackArr.length; userIdx++) {
        console.log(`\n===== 开始用户${userIdx + 1} 勋章任务 =====`)
        await listUserTask()
    }
    for (userIdx = 0; userIdx < blackArr.length; userIdx++) {
        await userInfo()
    }
    await showmsg()
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

//获取签到状态
async function querySignStatus() {
    const url = 'https://market.chuxingyouhui.com/promo-bargain-api/activity/weekSign/api/v1_0/calendar?appId=' + blackArr[userIdx]['appId']
    const data = await got.get(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'Origin': 'https://m.black-unique.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'black-token': blackArr[userIdx]['black-token'],
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'token': blackArr[userIdx]['token'],
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        },
    }).json()
    if (data.code === 200) {
        if (data.data && data.data.calendar && Array.isArray(data.data.calendar)) {
            for (let i = 0; i < data.data.calendar.length; i++) {
                let signItem = data.data.calendar[i]
                if (signItem.isToday === true) {
                    if (signItem.signStyle === 0) {
                        await doSign()
                    } else {
                        console.log(`\n今日已签到\n`)
                    }
                }
            }
        }
    } else {
        console.log(`\n获取签到状态失败：${data.msg}\n`)
    }
}

//签到
async function doSign() {
    const reqBody = `{}`
    const encodeBody = encodeURIComponent(reqBody)
    const url = 'https://market.chuxingyouhui.com/promo-bargain-api/activity/weekSign/api/v1_0/sign?appId=' + blackArr[userIdx]['appId']
    const data = await got.post(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'request-body': encodeBody,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'token': blackArr[userIdx]['token'],
            'Content-Type': 'application/json;charset=utf-8',
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'black-token': blackArr[userIdx]['black-token'],
            'Referer': 'https://m.black-unique.com/',
            'Connection': 'keep-alive',
        },
        body: reqBody
    }).json()
    if (logDebug) console.log(data);
    if (data.code === 200) {
        console.log(`\n签到成功获得：${data.data.reward}金币，已连续签到${data.data.continuouslyDay}天\n`)
    } else {
        console.log(`\n签到失败：${data.msg}\n`)
    }
}

//日常-任务列表
async function listUserTask() {
    rndtime = Math.round(new Date().getTime())
    const reqBody = `{"activityType":13}`
    const encodeBody = encodeURIComponent(reqBody)
    const url = "https://market.chuxingyouhui.com/promo-bargain-api/activity/task/api/list_user_task"
    const data = await got.post(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'request-body': encodeBody,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'token': blackArr[userIdx]['token'],
            'Content-Type': 'application/json;charset=utf-8',
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'black-token': blackArr[userIdx]['black-token'],
            'Referer': 'https://m.black-unique.com/',
            'Connection': 'keep-alive',
        },
        body: reqBody
    }).json()
    if (data.code === 200) {
        if (data.data && Array.isArray(data.data)) {
            for (let i = 0; i < data.data.length; i++) {
                let taskItem = data.data[i]
                if (taskItem.status === 0 && taskItem.finishedTimes < taskItem.totalTimes) {
                    if (taskItem.taskType.indexOf('RECEIVE_MEDAL') > -1 && (rndtime < taskItem.receiveStartTime || rndtime > taskItem.receiveEndTime)) {
                        //非整点领勋章时间
                        console.log("非整点领勋章时间")
                    } else if (taskItem.taskTitle === "抖音1分购") {
                        console.log("跳过抖音一分购")
                    } else if (taskItem.taskTitle === "3元3件") {
                        console.log("跳过3元3件")
                    } else if (taskItem.taskType.indexOf('SHOPPING') > -1) {
                        //跳过购物任务
                        console.log("跳过购买商品")
                    } else {
                        await doTask(taskItem.taskType, taskItem.userTaskId, taskItem.taskTitle)
                    }
                }

            }
        }
    } else {
        console.log(`查询任务列表失败：${data.msg}`)
    }
}

//日常-完成任务
async function doTask(taskType, userTaskId, taskTitle) {
    const reqBody = `{"activityType":13,"taskType":"${taskType}","userTaskId":"${userTaskId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    const url = "https://market.chuxingyouhui.com/promo-bargain-api/activity/task/api/doTask"
    const data = await got.post(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'request-body': encodeBody,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'token': blackArr[userIdx]['token'],
            'Content-Type': 'application/json;charset=utf-8',
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'black-token': blackArr[userIdx]['black-token'],
            'Referer': 'https://m.black-unique.com/',
            'Connection': 'keep-alive',
        },
        body: reqBody
    }).json()
    if (data.code === 200) {
        console.log(`完成任务【${data.data.taskTitle}】：获得${data.data.rewardScore}勋章`)
    } else {
        console.log(`完成任务【${taskTitle}】失败：${data.msg}`)
    }
}

//通知
async function showmsg() {

    const notifyBody = jsname + "运行通知\n\n" + notifyStr

    if (notifyFlag != 1) {
        console.log(notifyBody);
    }

    if (notifyFlag == 1) {
        $.msg(notifyBody);
        //if ($.isNode()){await notify.sendNotify($.name, notifyBody );}
    }
}

async function getRewrite() {
    if ($request.url.indexOf("mqq/api/indexTopInfo?appId=") > -1) {
        let blackCk = {"black-token": "", "token": "", "User-Agent": "", "appId": ""}
        let msgStr = ''

        let matchItem = $request.url.match(/appId=([\w]+)/)
        blackCk['appId'] = matchItem[1]
        msgStr += `获取到appId: ${blackCk['appId']}\n`

        blackCk['black-token'] = $request.headers['black-token']
        msgStr += `获取到black-token: ${blackCk['black-token']}\n`

        blackCk['token'] = $request.headers['token']
        msgStr += `获取到token: ${blackCk['token']}\n`

        blackCk['User-Agent'] = $request.headers['User-Agent']
        msgStr += `获取到User-Agent: ${blackCk['User-Agent']}\n`

        if (blackCk['black-token']) {
            if (blackJSON) {
                if (blackJSON.indexOf(blackCk['black-token']) == -1) {
                    blackJSON = blackJSON + '@' + JSON.stringify(blackCk)
                    const numUser = blackJSON.split('@')
                    msgStr = `获取到第${numUser.length}个账户ck\n` + msgStr
                    $.setdata(blackJSON, 'blackJSON')
                    $.msg(msgStr)
                } else {
                    $.log('检测到重复的账户ck')
                }
            } else {
                msgStr = `获取到第一个账户ck\n` + msgStr
                $.setdata(JSON.stringify(blackCk), 'blackJSON')
                $.msg(msgStr)
            }
        }
    }
}

async function checkEnv() {
    if (blackJSON) {
        for (let users of blackJSON.split('@')) {
            blackArr.push(JSON.parse(users))
        }
    } else {
        console.log('未找到blackJSON')
        return false
    }

    if (blackArr.length == 0) {
        console.log('未找到有效的blackJSON')
        return false
    }
    console.log(`共找到${blackArr.length}个用户`)
    return true
}

//==========================================================================
//加密接口
async function getSignInfo(type, timeout = 5000) {
    signRetryCount++
    const url = `http://cxyh.sijia.fun/?type=${type}&token=${blackArr[userIdx]['token']}`
    const data = await got.post(url, {
        headers: {
            'Host': 'cxyh.sijia.fun',
            'Connection': 'keep-alive',
        },
    }).json()
    if (logDebug) console.log(data);
    if (data.success === true) {
        reqTime = data.requests_time
        userSign = data.sign
        redPacketId = data.redPacketId ? data.redPacketId : ''
    }
}

//获取视频信息
async function getBussinessInfo(adId, activityType, bussinessType, version) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"adId":"${adId}","activityType":${activityType},"bussinessType":"${bussinessType}","version":"${version}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/video/api/v1_0/getBussinessInfo',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            bussinessInfo = result.data ? JSON.stringify(result.data) : '{}'
                        } else {
                            console.log(`获取视频信息失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//存钱罐状态
async function queryPiggyInfo() {
    const url = 'https://market.chuxingyouhui.com/promo-bargain-api/activity/golden/api/queryUserAccountInfo?appId=' + blackArr[userIdx]['appId']
    const data = await got.post(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'Origin': 'https://m.black-unique.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'black-token': blackArr[userIdx]['black-token'],
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'token': blackArr[userIdx]['token'],
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        },
    }).json()
    if (logDebug) console.log(data);
    if (data.code === 200) {
        if (parseFloat(data.data.goldenAmount) < parseFloat(data.data.dayCeil)) {
            if (parseFloat(data.data.piggyAmount) >= 1) {
                await getBussinessInfo(946088114, 7, 'GOLDEN_CLICK', 'v3')
                await clickPiggy()
            }
        } else {
            console.log(`\n存钱罐提取已达到当天上限：${data.data.dayCeil}\n`)
        }
    } else {
        console.log(`\n查询存钱罐状态失败：${data.msg}\n`)
    }
}

//提取存钱罐金币
async function clickPiggy() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"appId":"${blackArr[userIdx]['appId']}","extraReq":${bussinessInfo}}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/activity/golden/api/v1_0/click',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`\n提取存钱罐金币成功，金币余额${result.data.goldenAmount}\n`)
                        } else {
                            console.log(`\n提取存钱罐金币失败：${result.msg}\n`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//查询翻牌领提现额度
async function getUserFlopRecord() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"appId":"${blackArr[userIdx]['appId']}","queryDay":"${todayDate}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/activity/flop/api/getUserFlopRecord',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            if (result.data && result.data.recordList && Array.isArray(result.data.recordList)) {
                                for (let i = 0; i < result.data.recordList.length; i++) {
                                    let recordItem = result.data.recordList[i]
                                    if (!recordItem.status) {
                                        await getBussinessInfo(946087990, 12, 'WITHDRAWAL_WATCH_VIDEO', 'v3')
                                        await userFlop(recordItem.serialNumber)
                                    }
                                }
                            }
                        } else {
                            console.log(`查询翻牌状态失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//翻牌领提现额度
async function userFlop(serialNumber) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"appId":"${blackArr[userIdx]['appId']}","serialNumber":${serialNumber},"flopDay":"${todayDate}","extraReq":${bussinessInfo}}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/activity/flop/api/flop',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`翻牌获得提现额度：${result.data.amount}元`)
                        } else {
                            console.log(`翻牌获得提现额度失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//定点红包列表
async function listRedPacket() {
    const curTime = new Date()
    const currentHour = curTime.getHours()
    let isGetRedTime = ((currentHour < 23) && (currentHour > 6)) ? 1 : 0
    const url = "https://fanxian-api.chuxingyouhui.com/api/redPacketIncome/v1_0/listRedPacket"
    const data = await got.post(url, {
        headers: {
            'Host': 'fanxian-api.chuxingyouhui.com',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'newcomer': 'true',
            'Accept-Encoding': 'gzip, deflate, br',
            'token': blackArr[userIdx]['token'],
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'Content-Length': '0',
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
        }
    }).json()
    if (logDebug) console.log(data);
    if (data.code === 200) {
        if (isGetRedTime === 1 && data.data && data.data.redPacketList && Array.isArray(data.data.redPacketList)) {
            redPacketCount = 0
            for (let i = 0; i < data.data.redPacketList.length; i++) {
                let redItem = data.data.redPacketList[i]
                if (redItem.money > 0) {
                    redPacketCount++
                }
                if (redItem.status == 2 && redItem.money == 0 && redPacketCount < 7) {
                    signRetryCount = 0
                    await getSignInfo('open')
                    await openRedPacket()
                }
            }
        }
    } else {
        console.log(`查询红包列表失败：${result.msg}`)
    }
}

//开定点红包
async function openRedPacket() {
    const url = `https://pyp-api.chuxingyouhui.com/api/knightCard/redPacket/v1_0/openRedPacket`
    const data = await got.post(url, {
        headers: {
            'Host': 'pyp-api.chuxingyouhui.com',
            'Accept': 'application/json, text/plain, */*',
            'ymd': '0',
            'newcomer': 'true',
            'token': blackArr[userIdx]['token'],
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: `{"click":false,"sign":"${userSign}","ts":"${reqTime}"}`
    }).json()
    if (logDebug) console.log(data);
    if (data.code === 200) {
        console.log(`打开红包获得：${data.data.money}现金`)
        signRetryCount = 0
        await getSignInfo('boom')
        await boomRedPacket()
    } else {
        console.log(`打开红包失败：${data.msg}`)
    }
}

//定点红包翻倍
async function boomRedPacket() {
    const url = 'https://fanxian-api.chuxingyouhui.com/api/redPacket/increase/v1_0/boom'
    const data = await got.post(url, {
        headers: {
            'Host': 'fanxian-api.chuxingyouhui.com',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'token': blackArr[userIdx]['token'],
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://m.black-unique.com',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: `{"redPacketId":"${redPacketId}","sign":"${userSign}","ts":"${reqTime}"}`,
    }).json()

    if (logDebug) console.log(data);
    if (data.code === 200) {
        console.log(`红包翻倍获得：${data.data.redPacketIncreaseAmount}现金`)
    } else {
        console.log(`红包翻倍失败：${data.msg}`)
    }
}

//果园状态
async function userFruitDetail() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime()/1000)
    const reqBody = `{"appId":"${blackArr[userIdx]['appId']}","isMiniProgram":false}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/userFruitDetail',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Connection': 'keep-alive',
            },
            body: reqBody,
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`你现在种的水果是 ${result.data.fruitName} ${result.data.specification}，${result.data.progressWord}`)
                            console.log(`今天已浇水${result.data.wateredTimes}次，剩余水滴数量：${result.data.remainAmount}`)
                            fruitId = result.data.fruitId
                            userFruitId = result.data.userFruitId
                            activityId = result.data.activityId
                            if (result.data.canReceiveStatus == 1 && result.data.canReceiveAmount > 0) {
                                await receiveWaterDrop('TOMORROW_REWARD', 'null', '每日水滴')
                            }
                            if (result.data.gardenStageRewardResp && result.data.gardenStageRewardResp.status == 1) {
                                await fruitStageReward()
                            }
                            if (result.data.remainAmount >= 10) {
                                waterCount = 0
                                console.log(`开始浇水，请等候......`)
                                await wateringFruit()
                                console.log(`浇水结束，本次共浇水${waterCount}次`)
                            }
                        } else {
                            console.log(`查询果园状态失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园水果进度奖励
async function fruitStageReward() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime()/1000)
    const reqBody = `{"userFruitId":"${userFruitId}","appId":"${blackArr[userIdx]['appId']}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/receiveStageReward',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Connection': 'keep-alive',
            },
            body: reqBody,
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`领取水果进度奖励：${result.data.rewardNum}水滴`)
                        } else {
                            console.log(`领取水果进度奖励失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园浇水
async function wateringFruit() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime()/1000)
    const reqBody = `{"userFruitId":"${userFruitId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/watering',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Connection': 'keep-alive',
            },
            body: reqBody,
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            if (result.data.level && !result.data.remindType) {
                                if (result.data.upgrade == true) {
                                    console.log(`果树升级到 ${result.data.level} 获得：${result.data.upgradeReward}水滴`)
                                }
                                waterCount++
                                await wateringFruit()
                            }
                        } else {
                            console.log(`浇水失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园水滴任务
async function waterTaskList() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime()/1000)
    const reqBody = `{"activityId":"${activityId}","userFruitId":"${userFruitId}","clientType":1}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/userTaskList',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Connection': 'keep-alive',
            },
            body: reqBody,
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            if (result.data && result.data.taskList && Array.isArray(result.data.taskList)) {
                                for (let i = 0; i < result.data.taskList.length; i++) {
                                    let taskItem = result.data.taskList[i]
                                    if (taskItem.taskType.indexOf('CLICK_DO_TASK') > -1 ||
                                        taskItem.taskType.indexOf('WATCH_VIDEO') > -1 ||
                                        taskItem.taskType.indexOf('APP_LOGIN') > -1) {
                                        if (taskItem.status == 0) {
                                            await doWaterTask(taskItem.taskType, taskItem.taskId, taskItem.title)
                                        } else if (taskItem.status == 1) {
                                            await receiveWaterDrop(taskItem.taskType, taskItem.userTaskId, taskItem.title)
                                        }
                                    } else if (taskItem.taskType.indexOf('EVERY_DAY_WATERING_REWARD') > -1 ||
                                        taskItem.taskType.indexOf('OPEN_CHEST') > -1) {
                                        if (taskItem.status == 1) {
                                            await receiveWaterDrop(taskItem.taskType, taskItem.userTaskId, taskItem.title)
                                        }
                                    } else {
                                        if (taskItem.status == 0) {
                                            await receiveWaterDrop(taskItem.taskType, taskItem.userTaskId, taskItem.title)
                                        }
                                    }
                                }
                            }
                        } else {
                            console.log(`获取果园水滴任务失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园-完成水滴任务
async function doWaterTask(taskType, taskId, taskTitle) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"userFruitId":"${userFruitId}","taskType":"${taskType}","taskId":"${taskId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/doTask',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`完成水滴任务【${taskTitle}】成功`)
                        } else {
                            console.log(`完成水滴任务【${taskTitle}】失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园-领取水滴
async function receiveWaterDrop(taskType, userTaskId, taskTitle) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"userFruitId":"${userFruitId}","taskType":"${taskType}","userTaskId":${userTaskId}}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/receiveWaterDrop',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`领取水滴任务【${taskTitle}】奖励：${result.data.reward}水滴`)
                        } else {
                            console.log(`领取水滴任务【${taskTitle}】奖励失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园肥料任务
async function nutrientTaskList() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime()/1000)
    const reqBody = `{"activityId":"${activityId}","userFruitId":"${userFruitId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/getUserNutrientTaskList',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Connection': 'keep-alive',
            },
            body: reqBody,
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            if (result.data && result.data.gardenFertilizerTaskDtoList && Array.isArray(result.data.gardenFertilizerTaskDtoList)) {
                                for (let i = 0; i < result.data.gardenFertilizerTaskDtoList.length; i++) {
                                    let taskItem = result.data.gardenFertilizerTaskDtoList[i]
                                    if (taskItem.taskType.indexOf('ORDER_FOR_FERTILIZER') == -1 && taskItem.status != 2) {
                                        await doNutrientTask(taskItem.taskType, taskItem.taskId, taskItem.title)
                                    }
                                }
                            }
                        } else {
                            console.log(`获取果园肥料任务失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园-完成肥料任务
async function doNutrientTask(taskType, taskId, taskTitle) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"taskId":"${taskId}","userFruitId":"${userFruitId}","taskType":"${taskType}","source":2}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/doTaskForNutrient',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`完成肥料任务【${taskTitle}】成功`)
                        } else {
                            console.log(`完成肥料任务【${taskTitle}】失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园肥料状态
async function userFertilizerDetail(taskType, taskId, taskTitle) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"activityId":"${activityId}","userFruitId":"${userFruitId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/getUserFertilizerTool',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            fertilizerCount = 0
                            if (result.data.userSmallFertilizerTool.remainNum > 0 || result.data.userFertilizerTool.remainNum > 0) {
                                for (let i = 0; i < result.data.userSmallFertilizerTool.remainNum; i++) {
                                    await useFertilizer(result.data.userSmallFertilizerTool.userToolIds)
                                }
                                for (let i = 0; i < result.data.userFertilizerTool.remainNum; i++) {
                                    await useFertilizer(result.data.userFertilizerTool.userToolIds)
                                }
                                console.log(`施肥结束，本次共施肥${waterCount}次`)
                            }
                        } else {
                            console.log(`获取果园肥料状态失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园施肥
async function useFertilizer(userToolId) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"userFruitId":"${userFruitId}","userToolId":"${userToolId}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/useFertilizer',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            //施肥成功
                        } else {
                            console.log(`施肥失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园-摇树得优惠券
async function getTreeCoupon() {
    console.log(`\n开始摇树${clickTreeTimes}次得优惠券`)
    for (let i = 0; i < clickTreeTimes; i++) {
        await clickTree()
    }
}

//果园-点击树
async function clickTree() {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"userFruitId":"${userFruitId}","appId":"${blackArr[userIdx]['appId']}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/clickTree',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            if (result.data.hasReward == true) {
                                await receiveReward(result.data.rewardId, result.data.rewardName, result.data.rewardInfo)
                            }
                        } else {
                            console.log(`果园点击树失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//果园-获得树干奖励
async function receiveReward(rewardId, rewardName, rewardInfo) {
    let caller = printCaller()
    //rndtime = Math.round(new Date().getTime())
    const reqBody = `{"rewardId":"${rewardId}","userFruitId":"${userFruitId}","appId":"${blackArr[userIdx]['appId']}"}`
    const encodeBody = encodeURIComponent(reqBody)
    return new Promise((resolve) => {
        let url = {
            url: 'https://market.chuxingyouhui.com/promo-bargain-api/garden/api/v1_0/receiveReward',
            headers: {
                'Host': 'market.chuxingyouhui.com',
                'request-body': encodeBody,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'token': blackArr[userIdx]['token'],
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://m.black-unique.com',
                'User-Agent': blackArr[userIdx]['User-Agent'],
                'black-token': blackArr[userIdx]['black-token'],
                'Referer': 'https://m.black-unique.com/',
                'Connection': 'keep-alive',
            },
            body: reqBody
        };
        $.post(url, async (err, resp, data) => {
            try {
                if (err) {
                    console.log("Fucntion " + caller + ": API请求失败");
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    if (safeGet(data)) {
                        let result = JSON.parse(data);
                        if (logDebug) console.log(result);
                        if (result.code == 200) {
                            console.log(`获得优惠券：${rewardName} -- ${rewardInfo}`)
                        } else {
                            console.log(`获取优惠券失败：${result.msg}`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

//查询账户信息
async function userInfo() {
    console.log(`\n========= 账户${userIdx + 1} 信息 =========`)
    notifyStr += `========= 账户${userIdx + 1} 信息 =========\n`
    await getUserInfo()
    await userRebateInfo()
    await userTopInfo()
}

//查询现金余额
async function userRebateInfo() {
    const url = 'https://pyp-api.chuxingyouhui.com/api/app/userCenter/v1/info'
    const data = await got.get(url, {
        headers: {
            'Host': 'pyp-api.chuxingyouhui.com',
            'Accept': '*/*',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'token': blackArr[userIdx]['token'],
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'black-token': blackArr[userIdx]['black-token'],
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        },
    }).json()
    if (data.code === 200) {
        totalMoney = 0
        console.log(`【骑士卡号】：${data.data.userPointsResp.cardNo}`)
        notifyStr += `【骑士卡号】：${data.data.userPointsResp.cardNo}\n`
        console.log(`【现金余额】：${data.data.currencyBlanceResp.commission}元`)
        notifyStr += `【现金余额】：${data.data.currencyBlanceResp.commission}元\n`
        totalMoney += data.data.currencyBlanceResp.commission
    } else {
        console.log(`查询现金余额失败：${data.msg}`)
        notifyStr += `查询现金余额失败：${data.msg}\n`
    }
}

//查询勋章余额
async function userTopInfo() {
    const url = 'https://market.chuxingyouhui.com/promo-bargain-api/activity/mqq/api/indexTopInfo?appId=' + blackArr[userIdx]['appId']
    const data = await got.get(url, {
        headers: {
            'Host': 'market.chuxingyouhui.com',
            'Origin': 'https://m.black-unique.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'black-token': blackArr[userIdx]['black-token'],
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'token': blackArr[userIdx]['token'],
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        },
    }).json()
    if (data.code === 200) {
        console.log(`【勋章余额】：${data.data.score} ≈ ${data.data.score / 10000}元`)
        notifyStr += `【勋章余额】：${data.data.score} ≈ ${data.data.score / 10000}元\n`
        totalMoney += Math.floor(data.data.score / 10000)
        totalMoney = Math.floor(totalMoney * 100) / 100
        console.log(`【可提现余额】：${totalMoney}元`)
        notifyStr += `【可提现余额】：${totalMoney}元\n`
    } else {
        console.log(`查询勋章余额失败：${data.msg}`)
        notifyStr += `查询勋章余额失败：${data.msg}\n`
    }
}

//查询勋章余额
async function getUserInfo() {
    const url = "https://facade-api.black-unique.com/user/common/v1/getUserInfo"
    const data = await got.get(url, {
        headers: {
            'Host': 'facade-api.black-unique.com',
            'Origin': 'https://m.black-unique.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'black-token': blackArr[userIdx]['black-token'],
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': blackArr[userIdx]['User-Agent'],
            'Referer': 'https://m.black-unique.com/',
            'token': blackArr[userIdx]['token'],
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        },
    }).json()
    if (logDebug) console.log(data);
    if (data.code === 0) {
        console.log(`【用户手机】：${data.data.phone}`)
        notifyStr += `【用户手机】：${data.data.phone}\n`
    } else {
        console.log(`查询用户手机失败：${data.msg}`)
        notifyStr += `查询用户手机失败：${data.msg}\n`
    }
}

////////////////////////////////////////////////////////////////////
function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

function printCaller() {
    return (new Error()).stack.split("\n")[2].trim().split(" ")[1]
}

function formatDateTime(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return `${y}-${m}-${d}`;
}

function Env(t, e) {
    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
            let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
            h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
