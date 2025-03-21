import React, {use, useState} from 'react';
import {Header} from "antd/es/layout/layout";
import {Menu} from "antd";
import UploadButton from "./Upload"
import {useNavigate} from 'react-router-dom'




const Head = () => {
    // history path to be updated
    const [menus, setMenus] = useState([{title:"Home", path:"/"}, {title:"History", path:"/history"}]);
    const navigate = useNavigate();

    const MenuClick = (event)=>{
        navigate(event.item.props.path);
    }

    return (
        <Header style={{
            backgroundColor: 'black'
        }}>
            <div style={{
                    color:"white", fontSize:"35px",
                    float:"left", width:"120px",
                    display:"block", fontWeight: "bold"
                }}> DataSage </div>

                <div style={{
                    marginLeft:"50px",
                    float:"left",
                    display:"block",
                    width:"400px"
                }}>
                    <Menu style={{
                        backgroundColor:"transparent",
                        fontSize:"16px",
                        color:"rgba(255,255,255,.55)",
                        fontWeight:"bold"
                    }}
                    mode = "horizontal"
                    defaultSelectedKeys = {['Home']}
                    items = {menus.map((item)=>{
                        const key = item.title;
                        return {key, label: `${item.title}`, path:item.path};
                    })}
                    onClick={MenuClick}
                    />
                </div>
                <UploadButton/>
        </Header>
    )
}

export default Head;