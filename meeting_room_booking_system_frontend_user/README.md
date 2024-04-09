### 新建react项目
```sh
npx create-react-app --template=typescript meeting_room_booking_system_frontend_user

npm run start

npm install --save react-router-dom

npm install --save axios
```
- 应用使用`BrowserRouter`模式
- 实现了登陆页面`/login`页面.  调用了`http://localhost:3005/user/login`接口
- 实现了注册页面`/register`页面. 调用了`http://localhost:3005/user/register`和`http://localhost:3005/user/register-captcha`接口

这节我们打通了前后端，加上了登录、注册、首页等页面。

首先，引入了 React Router 来做路由，引入了 antd 来做 UI 组件库。

然后，引入了 axios 来发请求。

我们先在 postman 里测试了一遍接口，之后在页面里用 axios 调用了下。

组件里的函数，如果作为参数的话，需要添加 useCallback，这样避免每次都创建新的函数导致不必要的渲染。

经测试，发送邮件验证码正常，注册之后数据库也多了记录，登录成功之后 localStorage 也有了用户信息。

这样，注册登录就实现了完整的前后端功能。

下节，我们继续写其他页面。

### 2. 实现修改密码和修改用户信息接口

- 2.1 实现修改密码页面`/update_password`, 调用了`/user/update_password/captcha`和`/user/update_password`接口
- 2.2 实现修改用户信息接口`/update_info`, 调用了`/user/info`、`/user/update`、`/user/update/captcha`和`/user/upload`等接口
- 2.3 将邮箱地址放在 jwt 里，然后在 LoginGuard 里取出来注入 controller. 通过`@UserInfo('email')`取出邮箱
- 2.4 实现`axios`携带`jwt token`逻辑以及登陆过期续登操作`/user/refresh`
- 2. 实现上传接口`/user/upload`实时上传头像 [会议室预订系统-后端模块-上传头像](../meeting_room_booking_system_backend/README.md)
```js
import { message } from "antd";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3005/',
    timeout: 3000
});

axiosInstance.interceptors.request.use(function (config) {
    const accessToken = localStorage.getItem('access_token');

    if(accessToken) {
        config.headers.authorization = 'Bearer ' + accessToken;
    }
    return config;
})

interface PendingTask {
    config: AxiosRequestConfig
    resolve: Function
  }
let refreshing = false;
const queue: PendingTask[] = [];

axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if(!error.response) {
        return Promise.reject(error);
      }
      let { data, config } = error.response;

      if(refreshing) {
        return new Promise((resolve) => {
          queue.push({
            config,
            resolve
          });
        });
      }

      if (data.code === 401 && !config.url.includes('/user/refresh')) {
        refreshing = true;
        const res = await refreshToken();
        refreshing = false;
        if(res.status === 200) {

          queue.forEach(({config, resolve}) => {
              resolve(axiosInstance(config))
          })

          return axiosInstance(config);
        } else {
          message.error(res.data);

          setTimeout(() => {
              window.location.href = '/login';
          }, 1500);
        }
      } else {
        return error.response;
      }
    }
)

async function refreshToken() {
  const res = await axiosInstance.get('/user/refresh', {
    params: {
      refresh_token: localStorage.getItem('refresh_token')
    }
  });
  localStorage.setItem('access_token', res.data.access_token || '');
  localStorage.setItem('refresh_token', res.data.refresh_token || '');
  return res;
}
```

### 3. 添加会议室预定系统
- 3.1 实现会议室预定页面`/meeting_room_list`, 调用了`/meeting-room/list`接口,支持分页和条件筛选
