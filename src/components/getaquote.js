import React, { useState, useEffect } from "react";
import { getquote } from "../utils/axios";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Row,
  Col,
  Typography,
  Input,
  Image,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text } = Typography;

const Quote = () => {
  const [quotes, setQuotes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    getquote
      .get("/")
      .then((response) => {
        setQuotes(response.data);
        console.log(response, "quote ka data");
      })
      .catch((error) => {
        console.error("Error fetching quotes:", error);
        message.error("Failed to fetch quotes");
      });
  }, []);

  const handleView = (id) => {
    const quote = quotes.find((quote) => quote.id === id);
    setSelectedQuote(quote);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this quote?",
      content: "This action cannot be undone",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Show loading state
          message.loading("Deleting quote...", 0);

          // Call delete API
          await getquote.delete(`/${id}`);

          // Show success message
          message.success("Quote deleted successfully");

          // Refresh the quotes data
          const response = await getquote.get("/");
          setQuotes(response.data);
        } catch (error) {
          console.error("Delete error:", error);

          // Show appropriate error message
          if (error.response) {
            if (error.response.status === 404) {
              message.error("Quote not found");
            } else {
              message.error("Failed to delete quote");
            }
          } else {
            message.error("Network error. Please try again.");
          }
        } finally {
          // Hide loading message
          message.destroy();
        }
      },
    });
  };
  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Product",
      dataIndex: "chooseProduct",
      key: "chooseProduct",
    },
    {
      title: "Material",
      dataIndex: "material",
      key: "material",
    },
    {
      title: "Colors",
      dataIndex: "colors",
      key: "colors",
    },
    {
      title: "Finish Option",
      dataIndex: "finishOption",
      key: "finishOption",
    },
    {
      title: "Length",
      dataIndex: "length",
      key: "length",
    },
    {
      title: "Width",
      dataIndex: "width",
      key: "width",
    },
    {
      title: "Height",
      dataIndex: "height",
      key: "height",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Uploaded File",
      dataIndex: "uploadFile",
      key: "uploadFile",
      render: (text) => (
        <Image width={50} src={`path_to_your_images/${text}`} />
      ),
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
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <div>
      <p>Here you can view and manage the quotes you have received.</p>
      <Table
        columns={columns}
        dataSource={quotes}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
        bordered
        style={{ width: "90%", margin: "0 auto" }}
      />
      <Modal
        title={
          <Text strong style={{ fontSize: "18px", textAlign: "center" }}>
            Quote Details
          </Text>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedQuote && (
          <div style={{ fontSize: "14px", textAlign: "center" }}>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={12}>
                <Text strong>Full Name:</Text>
                <Input value={selectedQuote.fullName} disabled />
              </Col>
              <Col span={12}>
                <Text strong>Email:</Text>
                <Input value={selectedQuote.email} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={12}>
                <Text strong>Phone Number:</Text>
                <Input value={selectedQuote.phoneNumber} disabled />
              </Col>
              <Col span={12}>
                <Text strong>Company Name:</Text>
                <Input value={selectedQuote.companyName} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={12}>
                <Text strong>Product:</Text>
                <Input value={selectedQuote.chooseProduct} disabled />
              </Col>
              <Col span={12}>
                <Text strong>Material:</Text>
                <Input value={selectedQuote.material} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={12}>
                <Text strong>Colors:</Text>
                <Input value={selectedQuote.colors} disabled />
              </Col>
              <Col span={12}>
                <Text strong>Finish Option:</Text>
                <Input value={selectedQuote.finishOption} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={8}>
                <Text strong>Length:</Text>
                <Input value={selectedQuote.length} disabled />
              </Col>
              <Col span={8}>
                <Text strong>Width:</Text>
                <Input value={selectedQuote.width} disabled />
              </Col>
              <Col span={8}>
                <Text strong>Height:</Text>
                <Input value={selectedQuote.height} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={12}>
                <Text strong>Quantity:</Text>
                <Input value={selectedQuote.quantity} disabled />
              </Col>
              <Col span={12}>
                <Text strong>Message:</Text>
                <Input value={selectedQuote.message} disabled />
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={24}>
                <Text strong>Uploaded File:</Text>
                <div style={{ marginTop: 5 }}>
                  <Image
                    width={100}
                    src={`path_to_your_images/${selectedQuote.uploadFile}`}
                  />
                </div>
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginBottom: 10, justifyContent: "center" }}
            >
              <Col span={24}>
                <Text strong>Created At:</Text>
                <Input
                  value={moment(selectedQuote.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                  disabled
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
