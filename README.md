# RepeatBot

用于重复你说过的话。提取一句话中的特定语素，并添加设定的词尾。

```
https://weibo.com/2259906485/KlNGLtiQm
```

![](https://wx3.sinaimg.cn/mw690/002sWkUBgy1gruf7dc5m1j60tc134nd802.jpg)

## 更新说明

```
# 2021-08-13
创建仓库，编写README并提交。
```

## 主要命令

### 主菜单

|    命令   |                       说明                       |
|-----------|--------------------------------------------------|
| /help     | 显示帮助                                         |
| /start    | 启动                                             |
| /stop     | 停止                                             |
| /change   | 更改词尾                                         |
| /status   | 当前状态                                         |
| /debugon  | 开启调试模式，在调试模式下机器人将对所有回话生效 |
| /debugoff | 关闭调试模式                                     |
| /setrange | 设置适用的联系人和群聊                           |

### /setrange菜单

注意，联系人/群聊的匹配使用部分匹配的方式，即只要联系人/群聊的名字中的一部分等于设定的关键词，则触发机器人回复。

|    命令    |    说明    |
|------------|------------|
| /addtalker | 添加联系人 |
| /addroom   | 添加群聊   |
| /deltalker | 删除联系人 |
| /delroom   | 删除群聊   |

## 部署方法

可参考以下链接。在启动前替换ding-dong-bot.ts为本仓库的代码即可。

```
https://paytonguan.github.io/blog/posts/Subscription-Use.html?highlight=wechaty#nodejs%E7%89%88
```

## 代码详解

算法：将一句话分词后从后往前遍历，直至遇到第一个动词，加上词尾。

### examples/ding-dong-bot.ts

|    变量    |  类型  |          说明          |
|------------|--------|------------------------|
| EndString  | String | 要添加的词尾           |
| talkerlist | Array  | 机器人适用的联系人列表 |
| roomlist   | Array  | 机器人适用的群聊列表   |

## 项目依赖

|    依赖   |          说明         |
|-----------|-----------------------|
| Wechaty   | 微信机器人框架        |
| nodejieba | jieba分词库的nodejs版 |
