import React, {useState, useEffect} from "react";
import { Layout, List, Typography, Modal, Button, message } from "antd";
import axios from "axios";





const { Content } = Layout;

const PromptHistory = ({ windowHeight }) => {
    const [prompts, setPrompts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [fullPrompt, setFullPrompt] = useState("");

    const getPrompts = () =>{
        axios.get('/api/history', {params:{}}).then((res)=>{
            if (res.data.code !== 0){
                message.error(res.data.message);
                return;
            }
            setPrompts(res.data.data);
        }).catch((error)=>{
           message.error(error.message);
        });
    };

    useEffect(()=>{
        getPrompts();
    },[]);

    const handlePromptClick = (prompt) => {
        setFullPrompt(prompt);
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    return (
        <Content style={{ minHeight: windowHeight, padding: "40px 15%" }}>
            <Typography.Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
                Prompt History
            </Typography.Title>
            <List
                bordered
                itemLayout="horizontal"
                dataSource={prompts}
                renderItem={(item) => (
                    <List.Item onClick={() => handlePromptClick(item)} style = {{cursor:"pointer"}}>
                        <Typography.Text
                            style={{
                                fontSize: "16px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%"
                            }}
                        >
                            {item}
                        </Typography.Text>
                    </List.Item>
                )}
                style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
            />

            {/*Modal to show the full prompt*/}
            <Modal
                title = "Full prompt"
                open = {modalVisible}
                onCancel = {handleCancel}
                footer = {[
                    <Button key="Back" onClick={handleCancel}>Close</Button>
                ]}
            >
                <Typography.Text style={{ fontSize: "16px" }}>
                    {fullPrompt}
                </Typography.Text>
            </Modal>
        </Content>
    );
};

export default PromptHistory;