import React from 'react';
import { RouterProvider, createBrowserRouter, RouteObject } from 'react-router-dom';
import { Register } from './page/register/Register';
import { Login } from './page/login/Login';
import { UpdatePassword } from './page/update_password/UpdatePassword';
import { ErrorPage } from './page/error/ErrorPage';
import { Index } from './page/index/Index';
import { UpdateInfo } from './page/update_info/UpdateInfo';
import { Menu } from './page/menu/Menu';
import { MeetingRoomList } from './page/meeting_room_list/MeetingRoomList';
import { BookingHistory } from './page/booking_history/BookingHistory';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import './App.css';


const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index></Index>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'update_info',
        element: <UpdateInfo />
      },
      {
        path: '/',
        element: <Menu/>,
        children: [
          {
            path: '/',
            element: <MeetingRoomList/>
          },
          {
            path: 'meeting_room_list',
            element: <MeetingRoomList/>
          },
          {
            path: 'booking_history',
            element: <BookingHistory/>
          }
        ]
      }
    ]
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "update_password",
    element: <UpdatePassword />,
  }
];
export const router = createBrowserRouter(routes);

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App;
