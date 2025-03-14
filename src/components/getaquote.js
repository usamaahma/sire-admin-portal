import React, { useState } from "react";
import { Table, Button, Space, Modal, message, Row, Col, Typography, Input } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { Image } from "antd";
import moment from "moment"; // Import moment.js for date formatting

const { Text } = Typography;

const Quote = () => {
  // State for managing the data of quotes
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      productname: "Product A",
      message: "Looking for a quote for Product A",
      createdAt: "2025-03-01 10:30:00", // Example date with time
      length: "10 cm",
      width: "5 cm",
      depth: "3 cm",
      color: "Red",
      quantity: 50,
      imageUrl: "https://via.placeholder.com/150", // Image URL for preview
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      productname: "Product B",
      message: "Interested in purchasing Product B",
      createdAt: "2025-03-02 12:45:00", // Example date with time
      length: "12 cm",
      width: "6 cm",
      depth: "4 cm",
      color: "Blue",
      quantity: 100,
      imageUrl: "https://via.placeholder.com/150", // Image URL for preview
    },
  ]);

  // State for the modal visibility and selected quote
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Function to handle view button click
  const handleView = (id) => {
    const quote = quotes.find((quote) => quote.id === id);
    setSelectedQuote(quote);
    setIsModalVisible(true);
  };

  // Function to handle delete button click with confirmation
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this quote?",
      onOk: () => {
        setQuotes(quotes.filter((quote) => quote.id !== id));
        message.success("Quote deleted successfully");
      },
    });
  };

  // Table columns definition
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Product Name",
      dataIndex: "productname",
      key: "productname",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"), // Format date with time
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            View
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <p>Here you can view and manage the quotes you have received.</p>

      {/* Table to display quotes */}
      <Table
        columns={columns}
        dataSource={quotes}
        rowKey="id"
        pagination={{ pageSize: 5 }} // Optional: Limit the number of rows per page
        scroll={{ x: "max-content" }} // Horizontal scroll for larger content
        bordered // Add borders around the table
        responsive // Automatically adjust table layout based on screen size
        style={{ width: "90%", margin: "0 auto" }} // Adjust the table width and center it
      />

      {/* Modal to display quote details */}
      <Modal
        title={<Text strong style={{ fontSize: "18px", textAlign: "center" }}>Quote Details</Text>} // Centered and bold heading
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} // No footer for this modal
        width={900} // Adjust modal width as required
      >
        {selectedQuote && (
          <div style={{ fontSize: "14px", textAlign: "center" }}> {/* Centered content and smaller font size */}
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Name:</Text>
                <Input
                  value={selectedQuote.name}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Phone:</Text>
                <Input
                  value={selectedQuote.phone}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Email:</Text>
                <Input
                  value={selectedQuote.email}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Product Name:</Text>
                <Input
                  value={selectedQuote.productname}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Message:</Text>
                <Input
                  value={selectedQuote.message}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Image:</Text>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 }}>
                  <Image width={100} src={selectedQuote.imageUrl} />
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Length:</Text>
                <Input
                  value={selectedQuote.length}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Width:</Text>
                <Input
                  value={selectedQuote.width}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Depth:</Text>
                <Input
                  value={selectedQuote.depth}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Color:</Text>
                <Input
                  value={selectedQuote.color}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 10, justifyContent: "center" }}>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Quantity:</Text>
                <Input
                  value={selectedQuote.quantity}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: "14px", color: "#333" }}>Created At:</Text>
                <Input
                  value={moment(selectedQuote.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  disabled
                  style={{
                    fontSize: "14px", marginTop: 5, color: "#333", textAlign: "center"
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quote;
