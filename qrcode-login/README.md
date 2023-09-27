扫码登录是常用的功能，掘金、知乎、b 站等各大网站都有。

流程是在 pc 选择扫码登录的方式，用 APP 扫码，在 app 上登录之后进入登录确认页面。

可以点击确认登录或者取消，如果确认登录，那 pc 网站就会自动登录该账号。

它的实现原理是这样的：

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a7469b3869b47b386b9b894d5b947c2~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1620&h=1110&s=139485&e=png&b=fefcfc">


pc 端生成二维码，然后不断轮询二维码状态。

APP 里扫码拿到 qrcode_id，然后分别调用 scan、confirm、cancel 来修改二维码状态。

并且登录之后会把 token 带过去。

在 redis 里保存着二维码的状态和用户信息，然后这边确认之后，另一边就可以用 userInfo 生成 jwt 的 token，从而实现登录。

这就是扫码登录的实现原理。