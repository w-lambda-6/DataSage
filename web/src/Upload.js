import { useState } from "react";
import { Button, Modal, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const UploadButton = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Handle the modal visibility
    const handleShowModal = () => {
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
    };

    // Handle file selection
    const handleChange = (info) => {
        // Limit file selection to 1 file
        if (info.fileList.length > 1) {
            message.error("You can only upload one file at a time.");
            setFileList([info.fileList[info.fileList.length - 1]]);
        } else {
            setFileList(info.fileList);
        }
    };

    // Validate file type (only .csv and .xls)
    const beforeUpload = (file) => {
        const isCSV = file.type === "text/csv";
        const isXLS = file.type === "application/vnd.ms-excel";
        if (!isCSV && !isXLS) {
            message.error("You can only upload .csv or .xls files!");
            return false;
        }
        return true;
    };

    // Upload the file to the backend
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.error("Please select a file to upload.");
            return;
        }
        const file = fileList[0].originFileObj;

        // Create FormData to send the file
        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const response = await axios.post("/api/fileAdd", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setLoading(false);
            message.success("File uploaded successfully!");
            setIsModalVisible(false); // Close the modal on successful upload
            setFileList([]); // Clear file list after upload
        } catch (error) {
            setLoading(false);
            message.error("Failed to upload the file.");
        }
    };

    return (
        <div style={{ float: "right", display: "block", width: "100px" }}>
            <Button
                style={{ backgroundColor: "transparent", color: "white" }}
                size="large"
                onClick={handleShowModal}
            >
                Upload
            </Button>

            {/* Modal for file upload */}
            <Modal
                title="Upload a File"
                visible={isModalVisible}
                onCancel={handleCancelModal}
                footer={null}
                closable={true}
            >
                <Upload
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    fileList={fileList}
                    showUploadList={false} // Hide the list of uploaded files
                    accept=".csv,.xls" // Allow only .csv and .xls
                >
                    <Button icon={<PlusOutlined />} style={{ marginBottom: 10 }}>
                        Select File
                    </Button>
                </Upload>

                {fileList.length > 0 && (
                    <div>
                        <strong>File Selected:</strong> {fileList[0].name}
                    </div>
                )}

                <Button
                    type="primary"
                    loading={loading}
                    onClick={handleUpload}
                    style={{ marginTop: 10 }}
                >
                    {loading ? "Uploading..." : "Upload"}
                </Button>
            </Modal>
        </div>
    );
};

export default UploadButton;