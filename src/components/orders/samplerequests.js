import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Avatar, Card, Descriptions, message } from "antd";
import "./samplerequests.css";
import { samplerequests } from "../../utils/axios";

function Samplerequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSampleRequests = async () => {
      try {
        setLoading(true);
        const response = await samplerequests.get("/");
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching sample requests:", error);
        message.error("Failed to fetch sample requests");
      } finally {
        setLoading(false);
      }
    };

    fetchSampleRequests();
  }, []);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const showDetails = (req) => {
    setSelectedRequest(req);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span className="sample-id">#{id.slice(-6)}</span>,
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar>{record.userId?.name?.charAt(0) || "U"}</Avatar>
          <div>
            <div>{record.userId?.name || "Unknown User"}</div>
            <div className="user-email">{record.userId?.email || "N/A"}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Dimensions",
      key: "dimensions",
      render: (_, record) => (
        <span>
          {record.size?.length} × {record.size?.width} × {record.size?.height}{" "}
          {record.size?.unit}
        </span>
      ),
    },
    {
      title: "Notification",
      dataIndex: "notification",
      key: "notification",
      render: (notif) => (
        <Tag color={notif ? "green" : "volcano"}>
          {notif ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "File",
      dataIndex: "file",
      key: "file",
      render: (file) =>
        file ? (
          <a href={file} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "No File"
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <button className="view-btn" onClick={() => showDetails(record)}>
          View
        </button>
      ),
    },
  ];

  return (
    <div className="sample-requests-container">
      <h2>Sample Requests</h2>

      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />

      {detailVisible && selectedRequest && (
        <div className="detail-modal">
          <Card
            title={`Sample Request Details (#${selectedRequest._id.slice(-6)})`}
            extra={
              <button onClick={() => setDetailVisible(false)}>Close</button>
            }
            style={{ width: "100%" }}
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Product">
                {selectedRequest.product}
              </Descriptions.Item>
              <Descriptions.Item label="Material">
                {selectedRequest.material}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selectedRequest.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Dimensions">
                {selectedRequest.size?.length} × {selectedRequest.size?.width} ×{" "}
                {selectedRequest.size?.height} {selectedRequest.size?.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                ${selectedRequest.price}
              </Descriptions.Item>
              <Descriptions.Item label="Notification">
                <Tag color={selectedRequest.notification ? "green" : "volcano"}>
                  {selectedRequest.notification ? "Enabled" : "Disabled"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="File">
                {selectedRequest.file ? (
                  selectedRequest.file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={selectedRequest.file}
                      alt="Uploaded File"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <a
                      href={selectedRequest.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  )
                ) : (
                  "No file uploaded"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <div className="user-info">
                  <Avatar size={64}>
                    {selectedRequest.userId?.name?.charAt(0) || "U"}
                  </Avatar>
                  <div>
                    <h4>{selectedRequest.userId?.name || "Unknown"}</h4>
                    <p>{selectedRequest.userId?.email || "N/A"}</p>
                    <p>{selectedRequest.userId?.phone || "N/A"}</p>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address">
                <div className="address">
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedRequest.shippingAddress?.name}
                  </p>
                  <p>
                    <strong>Company:</strong>{" "}
                    {selectedRequest.shippingAddress?.companyName}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedRequest.shippingAddress?.streetAddress},{" "}
                    {selectedRequest.shippingAddress?.city}
                  </p>
                  <p>
                    <strong>Province:</strong>{" "}
                    {selectedRequest.shippingAddress?.province}
                  </p>
                  <p>
                    <strong>Zip:</strong>{" "}
                    {selectedRequest.shippingAddress?.zipCode}
                  </p>
                  <p>
                    <strong>Country:</strong>{" "}
                    {selectedRequest.shippingAddress?.country}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedRequest.shippingAddress?.phoneNumber}
                  </p>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Samplerequests;
