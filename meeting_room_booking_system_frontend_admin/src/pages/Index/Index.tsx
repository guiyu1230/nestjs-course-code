import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import './index.css';

export function Index() {

    const [headPic, setHeadPic] = useState();

    useEffect(() => {
        const userInfo = localStorage.getItem('user_info');
        if(userInfo) {
            const info = JSON.parse(userInfo);
            setHeadPic(info.headPic);
        } else {
            window.location.href = '/login';
        }
    }, []);

    return <div id="index-container">
        <div className="header">
            <Link to="/" className="sys_name">
                <h1>会议室预定系统-后台管理</h1>
            </Link>
            <Link to="/user/info_modify">
                {
                    headPic ? <img src={headPic} width={40} height={40} className="icon"/> : <UserOutlined className="icon"/>
                }
            </Link>
        </div>
        <div className="body">
            <Outlet></Outlet>
        </div>
    </div>
}
