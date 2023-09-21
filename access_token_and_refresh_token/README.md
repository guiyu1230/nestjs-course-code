这节我们实现了基于 access_token 和 refresh_token 的无感刷新登录状态，也就是无感续签。

access_token 用于身份认证，refresh_token 用于刷新 token，也就是续签。

在登录接口里同时返回 access_token 和 refresh_token，access_token 设置较短的过期时间，比如 30 分钟，refresh_token 设置较长的过期时间，比如 7 天。

当 access_token 失效的时候，可以用 refresh_token 去刷新，服务端会根据其中的 userId 查询用户数据，返回新 token。

在前端代码里，可以在登录之后，把 token 放在 localstorage 里。

然后用 axios 的 interceptors.request 给请求时自动带上 authorization 的 header。

用 intercetpors.response 在响应是 401 的时候，自动访问 refreshToken 接口拿到新 token，然后再次访问失败的接口。

我们还支持了并发请求时，如果 token 过期，会把请求放到队列里，只刷新一次，刷新完批量重发请求。

这就是 token 无感刷新的前后端实现，是用的特别多的一种方案。