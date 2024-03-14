import React from 'react';
import { RouterProvider, createBrowserRouter, RouteObject } from 'react-router-dom';
import { Register } from './page/register/Register';
import { Login } from './page/login/Login';
import { UpdatePassword } from './page/update_password/UpdatePassword';
import { ErrorPage } from './page/error/ErrorPage';
import { Index } from './page/index/Index';
import { UpdateInfo } from './page/update_info/UpdateInfo';
import './App.css';


// function Aaa() {
//   return <div>aaa</div>
// }

// function Bbb() {
//   return <div>bbb</div>
// }

// function Layout() {
//   return <div>
//     <div><Link to="/aaa">to aaa</Link></div>
//     <div><Link to="/bbb">to bbb</Link></div>
//     <div>
//       <Outlet />
//     </div>
//   </div>
// }

// function ErrorPage() {
//   return <div>error</div>;
// }

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index></Index>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'update_info',
        element: <UpdateInfo />
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
const router = createBrowserRouter(routes);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;
