好食期支付宝小程序

注意事项：

- 实现细线，部分安卓机器不显示，可以使用3rpx
- 只有自己页面在使用的模块，不用抽离独立的 components，想用模板，可以自己页面使用 template，不要抽离 components 过度，组件抽取，有好处也有坏处，好处是共用，坏处是以后维护要考虑很多情况了
- 不具备独立性、稳定性的，不值得抽离为components，如果一个结构，大体是稳定的、生命周期比较长的、便于复用的，适合抽离 template，跨pages 的，就可以抽出为 components


H5跳转小程序

```js
alipay://platformapi/startApp?appId=xxx&page=x/yz&query=number%3D1
```

## 常见问题

- ！！！当前小程序已经打开A页面的情况，再次进入还是A页面
  - 开发版本，从 `alipays://` 协议打开小程序，响应的是指定页（无论当前是否已经打开过某一页面）
  - 生产版本，如果已经打开A页面，再次进入，还是A页面，而不是入口页面
  - 期望
    - 开发版本和生产版本表现一致（因为表现不一致，无法从开发版，判断生产版本的问题，有些直接无法复现问题）
    - 入口进去，可控是否显示为入口页面
    - 是否可以和APP逻辑一致，配置进入A页面，会先经过首页，再进去A页面，这样用户可以操作返回
    - 入口场景参数，scene 都有哪些
  - 入口主要包含 `alipays://` 以及小程序搜索入口
- ！！！发布版本，保活机制引起的问题（目前保活多长时间）
  - 处理bug版本更新等，用户不杀程序并不会获得更新，这里存在很大问题
    - 如果发现bug，即使回滚，也无法让用户立即消除此bug影响，用户没杀死进程，无法体验到调整的版本
    - 解决办法
      - 期望能有个更新机制，以某种可控方式触发更新
      - 项目内内部实现公告功能，通知用户问题，及解决办法，如杀死程序再进来
  - 如果已经打开详情页，无论哪里进来，都是详情页，无法方便的浏览首页等功能
    - 比如模板消息，分享链接等
- ！页面深度问题，目前流程上，容易被打断，特别是订单初始化页面
  - 个人中心->我的优惠券列表->点使用到可用优惠券商品列表->商品详情->确认订单->选择优惠券
  - 分享页->首页->【活动专题】->详情->订单初始化->待收货列表->订单详情
- 代码模块复用，多个小程序，每个小程序都要有登录流程，基础相关的都要有一份，复用不方便
  - 是否有小程序间模块共享机制
- ！小程序生产版本缺少调试跟踪手段
- ！管理平台子账户权限控制？目前控制只能公司管理员处理，开发者很多操作设置不方便（数据跟踪、发布管理、开发设置）
- ！！审核响应时间可以再快点，微信小程序快的吃个午饭回来就审核通过了，慢的半天也会通过了
- 入口启动参数，是否出官方标准参数格式
  - 场景需求，当前无论小程序是否打开，要获得当前打开方式的渠道信息，目前获取参数数据位置不一致
    - 分享打开后，获取渠道信息，在page的onLoad参数里
    - 推广入口打开后，获取渠道信息 在app.js的onShow参数内
    - 小程序间跳转，获取渠道信息 在app.js的onShow参数内referrerInfo.extraData下
    - 短信打开，获取渠道信息（同推广入口）
    - 模板消息打开
- ！关注生活号可以回调吗，提示用户关注成功了，然后做一些奖励性的提示或推荐
- 真机远程调试
- 小程序间跳转，A跳到B，支持可以返回操作，直接退出B小程序，好处是小程序间跳转，返回操作更方便（目前只能点关闭返回）
- IDE 使用不方便
  - 切换分支或拉取代码，IDE都要关闭重新开一下
  - 有些写错，直接没提示 如axml
- web-view后台相关业余域名设置，还没有

- 一套H5方案，支持转化小程序 一套编码处处运行
