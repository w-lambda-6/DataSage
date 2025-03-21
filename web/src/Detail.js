import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { Row, Layout, Col, Input, Modal, Button, message, Spin, Table } from 'antd';
import axios from "axios";

const { Content } = Layout;
const { TextArea } = Input;

const Detail = ({ windowHeight }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');  // Stores text response
    const [tableData, setTableData] = useState(null);  // Stores table response
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);  // Loading state

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const fileName = searchParams.get("title") || "Unknown File";

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    }

    const handleQueryKeyPress = async (e) => {
        if (e.key === 'Enter' && query.trim() !== '') {
            try {
                setLoading(true);
                const response = await axios.post('/api/promptAdd',
                    { prompt: query.trim(), title: fileName },
                    { headers: { "Content-Type": "application/json" } }
                );

                setLoading(false);

                if (response.data.code !== 0) {
                    message.error(response.data.message);
                    return;
                }

                const { type, data } = response.data.data;

                if (type === 'string' || type === 'number' || type === 'chart') {
                    setResponse(data);
                    setTableData(null); // Clear table data
                } else if (type === 'dataframe') {
                    const parsedData = JSON.parse(data);
                    const columns = Object.keys(parsedData).map(key => ({
                        title: key,
                        dataIndex: key,
                        key: key,
                    }));

                    const numRows = Math.min(5, Object.keys(parsedData[columns[0].title]).length);
                    const formattedTableData = Array.from({ length: numRows }).map((_, rowIndex) => {
                        let row = { key: rowIndex };
                        columns.forEach(col => {
                            row[col.dataIndex] = parsedData[col.dataIndex][rowIndex];
                        });
                        return row;
                    });

                    setTableData({ columns, data: formattedTableData });
                    setResponse(''); // Clear text response
                } else {
                    message.error('Unknown response type.');
                    return;
                }

                setAiModalVisible(true);
            } catch (error) {
                setLoading(false);
                message.error("Failed to send query. Please try again.");
                console.error("API Error:", error);
            }
        } else if (query.trim() === '') {
            message.error('Query cannot be empty.');
        }
    };

    const handleAiCancel = () => {
        setAiModalVisible(false);
    }

    return (
        <Content style={{ minHeight: windowHeight }}>
            <div style={{ paddingTop: "10px" }}>
                <Row style={{ textAlign: "center", display: "inline" }}>
                    <h1>{fileName}</h1>
                </Row>
            </div>
            <div style={{ marginTop: "20px" }}>
                <Row>
                    <Col span={8} offset={8}>
                        <Row style={{ marginTop: "20px" }}>
                            <Col span={4}><h3>Query:</h3></Col>
                            <Col span={20}>
                                <TextArea
                                    value={query}
                                    onChange={handleQueryChange}
                                    onKeyPress={handleQueryKeyPress}
                                    placeholder="Enter your query to the AI"
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
            {/* Modal for displaying AI response */}
            <Modal
                title="AI Response"
                open={aiModalVisible}
                onCancel={handleAiCancel}
                footer={[
                    <Button key="Back" onClick={handleAiCancel}>Close</Button>
                ]}
                width={tableData ? 800 : 500} // Adjust width for tables
            >
                {loading ? (
                    <Spin size="large" />
                ) : (
                    tableData ? (
                        <Table
                            dataSource={tableData.data}
                            columns={tableData.columns}
                            pagination={false}
                            scroll={{
                                x: 'max-content',  // Horizontal scrolling for wide tables
                            }}
                        />
                    ) : (
                        <div>{response}</div>
                    )
                )}
            </Modal>
        </Content>
    );
}

export default Detail;