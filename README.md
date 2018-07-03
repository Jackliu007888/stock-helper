## a chrome extension for Chinese stocks / A 股股票助手--谷歌浏览器插件

![stock-01](http://oqzceoiaz.bkt.clouddn.com/stock-helper.png)
![stock-02](http://oqzceoiaz.bkt.clouddn.com/stock-show.png)
![stock-03](http://oqzceoiaz.bkt.clouddn.com/stock-up.png)

### 描述：

上次有个老哥在 v2ex 发了[为了早日解套 整了个上班机智盯盘的浏览器扩展](https://www.v2ex.com/t/452656#reply79)的帖子。我发了个评论就有 10 多个 star，有点惊喜。作为介绍，再更新下 README 吧。目前已申请谷歌网上应用商店，已审核通过，谷歌浏览器 翻墙后打开 https://chrome.google.com/webstore/detail/stock-helper/akcminhddckjghbaolhcoccbjlmcnclo?hl=zh-CN ，即可访问。

先说明下，目前两个分支，主分支带有挖矿脚本，占 cpu 40%。 simple 分支不带挖矿脚本，谷歌应用也是无挖矿脚本，release 也会标注那个带挖矿。
自己选择，不强求。

以下初衷：

上班没办法实时盯着股市怎么办？于是乎，写了个插件，辅助看股市。利用新浪的股票接口可以拿到实时股价。为了减少 dom 操作，利用 Vue@2.x 开发。为了少写点样式，引入 element-ui@2.x 。为了自动化构建、编译、开发等采用了 webpack 、 babel、gulp 、yo 一系列前端工具。不足之处欢迎指出。欢迎 Star,欢迎 Fork,欢迎 PR。

### 功能：

* 支持添加中国 A 股股票
* 支持设置成本价、持股数量
* 查看实时股价、涨跌幅、涨跌额、盈亏、今开、最高价、最低价、成本、持仓
* 支持按实时股价、涨跌幅、涨跌额、盈亏排序
* 支持按股票名称、股票代码模糊匹配
* 支持 svg 走势图
* 支持通过设置上限下限设置消息提醒（墙裂推荐）
* 支持自定义设置 ( [![Dr.Chan](https://avatars3.githubusercontent.com/u/10216331?s=20&v=4)](https://github.com/isdrchan) [Dr.Chan](https://github.com/isdrchan) )
* 支持查看动态更新进度条 ( [![Dr.Chan](https://avatars3.githubusercontent.com/u/10216331?s=20&v=4)](https://github.com/isdrchan) [Dr.Chan](https://github.com/isdrchan) )
* 支持自定义（手动）排序 ( [![Dr.Chan](https://avatars3.githubusercontent.com/u/10216331?s=20&v=4)](https://github.com/isdrchan) [Dr.Chan](https://github.com/isdrchan) )
* 支持滚动新闻列表 ( [![Dr.Chan](https://avatars3.githubusercontent.com/u/10216331?s=20&v=4)](https://github.com/isdrchan) [Dr.Chan](https://github.com/isdrchan) )
* 支持编辑成本、持仓 ( [![Dr.Chan](https://avatars3.githubusercontent.com/u/10216331?s=20&v=4)](https://github.com/isdrchan) [Dr.Chan](https://github.com/isdrchan) )
* 支持基金（样式可能奇葩）

### 股票接口：

* http://hq.sinajs.cn/list=* // 新浪财经 股票实时接口
* http://suggest3.sinajs.cn/suggest/* // 新浪财经 股票 suggest 接口
* http://vip.stock.finance.sina.com.cn/* //新浪财经 历史数据接口
* https://api-prod.wallstreetcn.com/* // 华尔街日报 动态消息

# Usage / 使用方法

1、在 release 里下载 app.ctx ,在谷歌浏览器打开开发者模式，拖动到谷歌浏览器

2、调试源码

git clone git@github.com:Jackliu007888/stock-helper.git

npm install / cnpm install

npm run dev / npm run build

add ./app to chrome extensions / 在谷歌浏览器打开开发者模式,添加/app 目录即可使用。

若您在股市赚钱了，可以给我来杯咖啡 :）

![award](http://oqzceoiaz.bkt.clouddn.com/award.jpg)
