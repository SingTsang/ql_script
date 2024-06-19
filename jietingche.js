// import got from "got"
const got = require("got")

let jieTingCheToken = process.env["jieTingCheToken"]
// let jieTingCheToken = "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0MDI1MjVjNjNmMmY0MmIyYWUyMGE5MDcxYWU4NDMxNiIsInN1YiI6IntcInVzZXJTb3VyY2VcIjpcIkFQUFwiLFwib3NUeXBlXCI6XCJBTkRST0lEXCIsXCJkZXZpY2VJZFwiOlwiM2Q3NWZjODRjNGNiOTA0MzgyZWVmYWU3NzAyNDQ1MDlcIn0iLCJpYXQiOjE3MTY1NTg4MzcsImV4cCI6MTcxOTE1MDgzN30.Xtkq89hjaAw7JBLUUx3lYvC7ML12A5fj87rwxkQhsjo"

main().catch(() => {}).finally(() => {});

async function main() {
    // 检查环境变量
    if (!(await checkEnv())) return;

    console.log('\n自动领取联东U谷停车场优惠券');

    await listUserTask();
}

//日常-任务列表
async function listUserTask() {
    const reqBody = '{"applictionType":"APP","applictionVersion":"60206","dataSourceType":"原生","deviceId":"3d75fc84c4cb904382eefae770244509","deviceName":"OnePlus 9","eventName":"PreferentialReceiveClick","eventProperty":"{\\"PageEventName\\":\\"ParkingDetail\\",\\"Code\\":\\"CPP230303000073737\\"}","eventType":"activity","event_start_time":1716558842414,"latitude":22.962975446861773,"longitude":113.02319111244557,"netType":"NET_WIFI","nonce":"1716558842415-1986972922","opSystem":"OS_ANDROID","opSystemVersion":"ANDROID 13","phoneModel":"OnePlus_LE2110","productName":"捷停车APP","productVersion":"V6.2.6","screenResolution":"1080*2400","serviceProviders":"中国电信","signType":"MD5","timestamp":"1716558842415","token":"eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0MDI1MjVjNjNmMmY0MmIyYWUyMGE5MDcxYWU4NDMxNiIsInN1YiI6IntcInVzZXJTb3VyY2VcIjpcIkFQUFwiLFwib3NUeXBlXCI6XCJBTkRST0lEXCIsXCJkZXZpY2VJZFwiOlwiM2Q3NWZjODRjNGNiOTA0MzgyZWVmYWU3NzAyNDQ1MDlcIn0iLCJpYXQiOjE3MTY1NTg4MzcsImV4cCI6MTcxOTE1MDgzN30.Xtkq89hjaAw7JBLUUx3lYvC7ML12A5fj87rwxkQhsjo","userId":"402525c63f2f42b2ae20a9071ae84316","sign":"70E08635B4578BEADEB4359E8699678D"}'
    const url = "https://sytgate.jslife.com.cn/data-report-gateway/syt-data-report/receive"
    const data = await got.post(url, {
        headers: {
            'UC_ID': '3d75fc84c4cb904382eefae770244509',
            'Host': 'sytgate.jslife.com.cn',
            'Connection': 'Keep-Alive',
            'User-Agent': 'okhttp/4.10.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': '*/*'
        },
        body: reqBody
    }).json()
    if (data.success === true) {
        console.log(`领取优惠卷成功`)
    } else {
        console.log(`领取优惠卷失败：${data.message}`)
    }
}

async function checkEnv() {
    if (!jieTingCheToken) {
        console.log('找不到jieTingCheToken')
        return false
    }
    return true
}
