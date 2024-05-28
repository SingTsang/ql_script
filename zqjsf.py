import asyncio
import aiohttp
import random
import hashlib
import logging
import datetime
import os
import time
from urllib.parse import parse_qs
from datetime import datetime

""""
export zqurl='xxxxxxx'
抓这个https://user.youth.cn/v1/user/userinfo.json?xxxxxx

"""

# 禁用 SSL 证书验证（不推荐用于生产环境）
# ssl_context = ssl.create_default_context(cafile=certifi.where())
# ssl_context.check_hostname = False
# ssl_context.verify_mode = ssl.CERT_NONE

class zq:
    def __init__(self):
        self.sessions = aiohttp.ClientSession()
        self.headers = {
            'Usear-Agent': 'Mozilla/5.0 (Linux; Android 13; M2012K11AC Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/104.0.5112.97 Mobile Safari/537.36 hap/1.10/xiaomi com.miui.hybrid/1.10.0.0 com.youth.kandianquickapp/2.7.6 ({"packageName":"com.miui.home","type":"shortcut","extra":{"original":{"packageName":"com.miui.quickappCenter","type":"url","extra":{"scene":""}},"scene":"api"}})',
            'Host': 'user.youth.cn',
            'Accept-Encoding': 'gzip',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
        }
        logging.basicConfig(level=logging.INFO, format='%(message)s')
        self.logger = logging.getLogger(__name__)
        # self.num = 1
        self.conti = True

    async def close(self):
        await self.sessions.close()

    async def create_sign(self, string1):
        new_md5 = hashlib.md5()
        new_md5.update(string1.encode('utf-8'))
        secret = new_md5.hexdigest().lower()
        return secret

    async def request(self, url, method='get', data=None):
        try:
            async with getattr(self.sessions, method)(url, headers=self.headers, data=data) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"请求失败状态码：{response.status}")
                    return await response.json()
        except Exception as e:
            self.logger.error(e)
            return None

    async def task_complete_with_semaphore(self, param, banner_id, title, semaphore):
        async with semaphore:  # 用Semaphore来控制并发数
            await self.task_complete(param, banner_id, title)

    async def userinfo(self, pa):
        today = datetime.now()
        day = today.strftime("%-m.%-d")
        url = f"https://user.youth.cn/v1/user/userinfo.json?{pa}"
        res = await self.request(url)
        if res['success'] == True:
            self.logger.info(
                f"用户：{res['items']['nickname']} 豆子：{res['items']['score']} 钱包：{res['items']['money']}")
            if res['items']['is_sign'] == False:
                self.logger.info(f"用户：{res['items']['nickname']} 尚未签到")
                await self.sign(pa)
            else:
                self.logger.info("今天已签到")

    async def sign(self, pa):
        timestamp = int(time.time() * 1000)
        param = pa + f'v={timestamp}&f=1'
        key1 = param.replace('&', '') + 'UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc'
        sign = await self.create_sign(key1)
        # self.logger.info(sign)
        url = f'https://user.youth.cn/FastApi/Task/sign.json?{param}&sign={sign}'
        res = await self.request(url)
        if res['success'] == True:
            self.logger.info("签到成功")
        else:
            self.logger.info(f"{res['message']}")

    async def task_center(self, pa):
        timestamp = int(time.time() * 1000)
        param = pa + f'v={timestamp}&f=1&from=tab'
        key = param.replace('&', '') + 'UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc'
        sign = await self.create_sign(key)
        url = f'https://user.youth.cn/FastApi/NewTaskSimple/getTaskList.json?{param}&sign={sign}'
        res = await self.request(url)
        if res['success'] == True:
            for item in res['items']['daily']:
                if self.conti is True:
                    if item['status'] == 0 and 'banner_id' in item:
                        await self.task_complete(param, item['banner_id'], item['title'])
                    else:
                        self.logger.info(f"任务：{item['title']}完成了或没写")
                else:
                    self.logger.info("检测到青豆不再增加，停止任务")
        else:
            self.logger.info(res)

    async def article_list(self, pa):
        url = f'https://user.youth.cn/FastApi/article/lists.json?op=1&{pa}'
        res = await self.request(url)
        if res['success'] == True:
            for item in res['items']:
                self.logger.info(f"title：{item['title']}")
                await asyncio.sleep(random.randint(30, 35))
                await self.article_complete(item['signature'])

    async def article_complete(self, signature):
        '''
        '''
        self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self.headers['Host'] = 'user.youth.cn'
        self.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        url = 'https://user.youth.cn/FastApi/article/complete.json'
        key = f'channel=c6004os_version=33signature={signature}' + 'jdvylqcGGHHJZrfw0o2DgAbsmBCCGUapF1YChc'
        sign = await self.create_sign(key)
        data = f'signature={signature}&os_version=33&channel=c6004&sign={sign}'
        res = await self.request(url, 'post', data)
        if res['success'] == True:
            self.logger.info(f"获得{res['items']['read_score']}")
        else:
            self.logger.info(res)

    async def task_complete(self, param, task_id, title):
        self.logger.info(f"正在执行{title}")
        self.headers['Host'] = 'user.youth.cn'
        self.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self.headers['Connection'] = 'keep-alive'
        self.headers['Accept-Encoding'] = 'gzip'
        parsed_params = parse_qs(param)
        uid = parsed_params.get('uid', [None])[0]
        token_id = parsed_params.get('token_id', [None])[0]
        openudid = parsed_params.get('openudid', [None])[0]
        key = f'app_version=2.7.6channel=c6004is_wxaccount=1openudid={openudid}task_id={task_id}token_id={token_id}uid={uid}UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc'
        sign = await self.create_sign(key)
        # print(sign)
        data = f'app_version=2.7.6&channel=c6004&sign={sign}&task_id={task_id}&openudid={openudid}&uid={uid}&token_id={token_id}&is_wxaccount=1'
        urls = 'https://user.youth.cn/v1/Nameless/adlickstart.json'
        res1 = await self.request(urls, 'post', data)
        if res1['success'] == True:
            await self.action(data, res1['items']['read_num'])
        else:
            self.logger.info(res1)

    async def action(self, data, num):
        for i in range(0, (6 - num)):
            url = 'https://user.youth.cn/v1/Nameless/bannerstatus.json'
            res = await self.request(url, 'post', data)
            if res['success'] == True:
                self.logger.info(f"阅读id:{res['items']['banner_id']}第{i + 1}次")
                if i + 1 != 6 - num:
                    await asyncio.sleep(random.randint(12, 15))
        end_url = 'https://user.youth.cn/v1/Nameless/adlickend.json'
        res3 = await self.request(end_url, 'post', data)
        if res3['success'] == True:
            if res3['items']['score'] == 0:
                self.conti = False
                self.logger.info(f"任务id:{res3['items']['banner_id']} 获得:{res3['items']['score']}豆")
            # self.logger.info(res3)
        else:
            self.logger.info(res3)

    async def kkz(self, param):
        """
        """
        params = parse_qs(param)
        uid = params.get('uid', [None])[0]
        token_id = params.get('token_id', [None])[0]
        openudid = params.get('openudid', [None])[0]
        key = f"app_version=2.7.6channel=c6004is_wxaccount=1openudid={openudid}token_id={token_id}uid={uid}UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc"
        sign = await self.create_sign(key)
        data = f'app_version=2.7.6&channel=c6004&openudid={openudid}&uid={uid}&token_id={token_id}&is_wxaccount=1&sign={sign}'
        url = f"https://user.youth.cn/v1/Nameless/getTaskBrowse.json?{data}"
        res = await self.request(url)
        if res['success'] == True:
            # tasks = []
            # semaphore = asyncio.Semaphore(self.num)
            for item in res['items']['list']:
                if self.conti is True:
                    if item['status'] != 2:
                        await self.task_complete(param, item['banner_id'], item['title'])
                        # tasks.append(self.task_complete_with_semaphore(param, item['banner_id'], item['title'], semaphore))
                    else:
                        self.logger.info(f"已完成{item['banner_id']}：{item['title']} --end")
                else:
                    self.logger.info("检测到金币不再增加，停止")
                    break
            # await asyncio.gather(*tasks)
        else:
            self.logger.info(res)

    async def withdraw(self):
        """
       此处的data修改为你的提现请求body
        """
        url = 'https://user.youth.cn/v1/Withdraw/wechat.json'
        data = ''
        res = await self.request(url, 'post', data)
        if res['success'] == True:
            self.logger.info(f"提现{res['message']}！")
        else:
            self.logger.info(res['message'])

    async def share(self, param, article):
        """
        """
        now = datetime.now()
        hour = now.hour
        if hour == 12:
            self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            self.headers['Host'] = 'user.youth.cn'
            self.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
            params = parse_qs(param)
            uid = params.get('uid', [None])[0]
            token_id = params.get('token_id', [None])[0]
            openudid = params.get('openudid', [None])[0]
            url = "https://user.youth.cn/FastApi/article/shareEnd.json"
            data = f'app_version=2.7.6&stype=WEIXIN&custom=native&channel=c6004&openudid={openudid}&article_id={article}&uid={uid}&token_id={token_id}&device_platform=android&active_channel=c6004&is_wxaccount=1'
            # print(data)
            res = await self.request(url, 'post', data)
            if res['success'] == True:
                self.logger.info(f"{res['message']}")
                await self.withdraw()
            else:
                self.logger.info(res)

    async def reward(self, param, action):
        self.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        self.headers['Host'] = 'user.youth.cn'
        self.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        parsed_params = parse_qs(param)
        uid = parsed_params.get('uid', [None])[0]
        token_id = parsed_params.get('token_id', [None])[0]
        openudid = parsed_params.get('openudid', [None])[0]
        url = 'https://user.youth.cn/FastApi/CommonReward/toGetReward.json'
        key = f'action={action}active_channel=c6004app_version=2.7.6channel=c6004f=1from=2is_wxaccount=1openudid={openudid}token_id={token_id}uid={uid}UHLHlqcHLHLH9dPhlhhLHLHGF2DgAbsmBCCGUapF1YChc'
        sign = await self.create_sign(key)
        # print(sign)
        data = f'uid={uid}&token_id={token_id}&app_version=2.7.6&openudid={openudid}&channel=c6004&is_wxaccount=1&active_channel=c6004&f=1&action={action}&from=2&sign={sign}'
        res = await self.request(url, 'post', data)
        if res['success'] == True:
            self.logger.info(res)
        else:
            self.logger.info(res)

    async def run(self):
        url = os.getenv('zqurl')
        user_list = url.split('@')
        for user in user_list:
            await self.userinfo(user)
            await self.share(user, '49309699')  # 自己改分享id
            await self.task_center(user)
            await self.kkz(user)
            for box in ['time_reward', 'box_one', 'box_three', 'box_five']:
                await self.reward(user, box)
            await self.article_list(user)  # 文章加豆，我觉得没必要开
        await self.close()


async def main():
    zqfa = zq()
    await zqfa.run()


if __name__ == '__main__':
    asyncio.run(main())
