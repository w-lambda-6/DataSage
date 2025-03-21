import React, {useState, useEffect} from "react";
import { Layout, List, Card, Rate, message } from "antd";
import { Link } from "react-router-dom";
import axios from 'axios';




const {Content} = Layout;
const {Meta} = Card;

// body component
const Body = ({windowHeight}) => {
    return(
        <Content style={{minHeight:windowHeight}}>
            <Files/>
        </Content>
    );
}

// file listing component
const Files = ()=>{
    const [files, setFiles] = useState([]);

    const getFiles = () => {
        axios.get('/api/fileList', {params:{}}).then((res)=>{
            console.log("Fetched Files:", res.data.data); // Debugging
            if (res.data.code !== 0){
                message.error(res.data.message);
                return;
            }
            setFiles(res.data.data);
        }).catch((error)=>{
           message.error(error.message);
        });
    };

    useEffect(() => {
        getFiles()
    }, []);

    return (
        <div style={{marginLeft:"65px", marginTop:"20px"}}>
            <List
                grid={{column:4}}
                dataSource={files}
                renderItem={(item)=>(
                    <List.Item>
                        <Link target="_blank" to={`/detail?title=${encodeURIComponent(item.title)}`}>
                            <Card style={{width:300}}>
                                <Meta title={item.title}/>
                            </Card>
                        </Link>
                    </List.Item>
                )}
            />
        </div>
    );
}


export default Body;