这节我们实现了管理端的登录和用户管理页面。

和用户端的一样，都是通过 axios interceptor 自动添加 header 和自动 refresh token。

这里涉及到三级路由，第一级展示上面的 header，第二级展示左侧的 menu，第三级才是具体的页面。

使用 table 组件来渲染列表，通过 useEffect 在 pageNo、pageSize 改变的时候自动重发请求。

这样，这两个页面的前后端代码都完成了。

## 新建react项目
```sh
npx create-react-app --template=typescript meeting_room_booking_system_frontend_admin

npm run start

npm install --save react-router-dom

npm install --save axios

npm install antd --save
```

### 登录逻辑实现
- 应用使用`BrowserRouter`模式
- 实现了登陆页面`/login`页面.  调用了`http://localhost:3005/user/admin/login`接口
- 实现了登录逻辑.缓存了`access_token`、`refresh_token`和`user_info`字段
- 添加了`axios`拦截器功能和登陆过期`refresh`刷新功能`http://localhost:3005/user/refresh`
```js
// 登录逻辑和缓存添加
const navigate = useNavigate();

const onFinish = useCallback(async (values: LoginUser) => {
    const res = await login(values.username, values.password);

    const { code, message: msg, data} = res.data;
    if(res.status === 201 || res.status === 200) {
        message.success('登录成功');

        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('user_info', JSON.stringify(data.userInfo));

        setTimeout(() => {
            navigate('/');
        }, 1000);
    } else {
        message.error(data || '系统繁忙，请稍后再试');
    }
}, []);
```
```js
// axios拦截器功能
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
### 会议室系统-后台管理
- 三级路由添加
- 用户列表页配置
```js
// 路由配置
const routes = [
  {
    path: "/",
    element: <Index></Index>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Menu></Menu>,
        children: [
          {
            path: 'user_manage',
            element: <UserManage/>
          }
        ]
      }
    ]
  },
  {
    path: "login",
    element: <Login />,
  }
];

// menu页
import { Outlet } from "react-router-dom";
import { Menu as AntdMenu, MenuProps } from 'antd';
import './menu.css';

const items: MenuProps['items'] = [
    {
        key: '1',
        label: "会议室管理"
    },
    {
        key: '2',
        label: "预定管理"
    },
    {
        key: '3',
        label: "用户管理"
    },
    {
        key: '4',
        label: "统计"
    }
];

export function Menu() {
    return <div id="menu-container">
        <div className="menu-area">
            <AntdMenu
                defaultSelectedKeys={['3']}
                items={items}
            />
        </div>
        <div className="content-area">
            <Outlet></Outlet>
        </div>
    </div>
}
```

- 条件搜索、分页、用户信息查询
- 实现用户信息`/user_manage`页面.  调用了`http://localhost:3005/user/list`接口
- 按`username, nickName, email, pageNo, pageSize`等条件查询
- 实现用户冻结功能. 调用了`http://localhost:3005/user/freeze`接口
```js
import { Badge, Button, Form, Image, Input, Table, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import './UserManage.css';
import { ColumnsType } from "antd/es/table";
import { freeze, userSearch } from "../../interfaces/interfaces";
import { useForm } from "antd/es/form/Form";

interface SearchUser {
    username: string;
    nickName: string;
    email: string;
}

interface UserSearchResult {
    id: number,
    username: string;
    nickName: string;
    email: string;
    headPic: string;
    createTime: Date;
    isFrozen: boolean;
}


export function UserManage() {
    const [pageNo, setPageNo] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [userResult, setUserResult] = useState<UserSearchResult[]>();
    const [num, setNum] = useState(0);

    const columns: ColumnsType<UserSearchResult> = useMemo(() => [
        {
            title: '用户名',
            dataIndex: 'username'
        },
        {
            title: '头像',
            dataIndex: 'headPic',
            render: value => {
                return value ? <Image
                        width={50}
                        src={`http://localhost:3005/${value}`}
                /> : '';
            }
        },
        {
            title: '昵称',
            dataIndex: 'nickName'
        },
        {
            title: '邮箱',
            dataIndex: 'email'
        },
        {
            title: '注册时间',
            dataIndex: 'createTime'
        },
        {
            title: '状态',
            dataIndex: 'isFrozen',
            render: (_, record) => (
                record.isFrozen ? <Badge status="success">已冻结</Badge> : ''
            )
        },
        {
            title: '操作',
            render: (_, record) => (
                <a href="#" onClick={() => {freezeUser(record.id)}}>冻结</a>
            )
        }
    ], []);
    
    const freezeUser = useCallback(async (id: number) => {
        const res = await freeze(id);
    
        const { data } = res.data;
        if(res.status === 201 || res.status === 200) {
            message.success('冻结成功');
            setNum(Math.random())
        } else {
            message.error(data || '系统繁忙，请稍后再试');
        }
    }, []);

    const searchUser = useCallback(async (values: SearchUser) => {
        const res = await userSearch(values.username,values.nickName, values.email, pageNo, pageSize);

        const { data } = res.data;
        if(res.status === 201 || res.status === 200) {
            setUserResult(data.users.map((item: UserSearchResult) => {
                return {
                    key: item.username,
                    ...item
                }
            }))
        } else {
            message.error(data || '系统繁忙，请稍后再试');
        }
    }, []);

    const [form ]  = useForm();

    useEffect(() => {
        searchUser({
            username: form.getFieldValue('username'),
            email: form.getFieldValue('email'),
            nickName: form.getFieldValue('nickName')
        });
    }, [pageNo, pageSize, num]);

    const changePage = useCallback(function(pageNo: number, pageSize: number) {
        setPageNo(pageNo);
        setPageSize(pageSize);
    }, []);


    return <div id="userManage-container">
        <div className="userManage-form">
            <Form
                form={form}
                onFinish={searchUser}
                name="search"
                layout='inline'
                colon={false}
            >
                <Form.Item label="用户名" name="username">
                    <Input />
                </Form.Item>

                <Form.Item label="昵称" name="nickName">
                    <Input />
                </Form.Item>

                <Form.Item label="邮箱" name="email" rules={[
                    { type: "email", message: '请输入合法邮箱地址!'}
                ]}>
                    <Input/>
                </Form.Item>

                <Form.Item label=" ">
                    <Button type="primary" htmlType="submit">
                        搜索用户
                    </Button>
                </Form.Item>
            </Form>
        </div>
        <div className="userManage-table">
            <Table columns={columns} dataSource={userResult} pagination={ {
                current: pageNo,
                pageSize: pageSize,
                onChange: changePage
            }}/>
        </div>
    </div>
}
```

### 会议室系统-后台管理-用户信息修改和密码修改

这节我们实现了管理端的用户信息修改和密码修改的页面。

首先添加了一个和管理页面平级的二级路由，然后添加了两个组件。

这两个页面都是表单，涉及到回显数据、发送验证码、上传文件、更新接口。

这也是管理系统的常见功能。

下节开始，我们就开始写会议室管理的功能了。

- 添加了`/user/info_modify`和`/user/password_modify`页面
- 添加了`/user/info`、`/user/admin/update`、`/user/update/captcha`和`/user/update_password/captcha`接口
